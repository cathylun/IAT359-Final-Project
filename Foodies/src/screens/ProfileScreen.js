import { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { collection, getDocs } from "firebase/firestore";
import { db, firebase_auth as auth } from "../firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const DAY_SIZE = Math.floor((SCREEN_WIDTH - 48 - 12) / 7); // 7 columns with padding

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];
const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay(); // 0 = Sunday
}

function formatDateKey(year, month, day) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(
    2,
    "0"
  )}`;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const today = new Date();

  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [entries, setEntries] = useState({}); // { "YYYY-MM-DD": { photoUri, text, rating, date } }
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [loading, setLoading] = useState(true);

  // Reload entries every time the screen comes into focus (e.g. after saving a new entry)
  useFocusEffect(
    useCallback(() => {
      loadEntries();
    }, [])
  );

  async function loadEntries() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;
    try {
      const snapshot = await getDocs(
        collection(db, "users", userId, "entries")
      );
      const map = {};
      snapshot.forEach((doc) => {
        map[doc.id] = doc.data();
      });
      setEntries(map);
    } catch (e) {
      console.error("Failed to load entries:", e);
    } finally {
      setLoading(false);
    }
  }

  function prevMonth() {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else setMonth((m) => m - 1);
  }

  function nextMonth() {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else setMonth((m) => m + 1);
  }

  function renderCalendar() {
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);
    const cells = [];

    // Empty cells before the 1st
    for (let i = 0; i < firstDay; i++) {
      cells.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(year, month, day);
      const entry = entries[dateKey];
      const isToday =
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

      cells.push(
        <TouchableOpacity
          key={dateKey}
          style={[styles.dayCell, isToday && styles.todayCell]}
          onPress={() => entry && setSelectedEntry(entry)}
          activeOpacity={entry ? 0.7 : 1}
        >
          <Text style={[styles.dayNumber, isToday && styles.todayNumber]}>
            {day}
          </Text>
          {entry && (
            <View style={styles.entryDot}>
              <Text style={styles.entryDotEmoji}>🍽️</Text>
            </View>
          )}
        </TouchableOpacity>
      );
    }

    // Group into rows of 7
    const rows = [];
    for (let i = 0; i < cells.length; i += 7) {
      rows.push(
        <View key={`row-${i}`} style={styles.weekRow}>
          {cells.slice(i, i + 7)}
        </View>
      );
    }
    return rows;
  }

  function renderStars(rating) {
    return Array.from({ length: 10 }, (_, i) => (
      <Text
        key={i}
        style={[styles.starSmall, i < rating && styles.starSmallFilled]}
      >
        ★
      </Text>
    ));
  }

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.topRow}>
          <Text style={styles.title}>My Cooking Diary</Text>
          <TouchableOpacity
            style={styles.settingsBtn}
            onPress={() => navigation.navigate("ReminderSetting")}
          >
            <Text style={styles.settingsBtnText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Calendar card */}
        <View style={styles.calendarCard}>
          {/* Month navigation */}
          <View style={styles.monthNav}>
            <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
              <Text style={styles.navArrow}>‹</Text>
            </TouchableOpacity>
            <Text style={styles.monthTitle}>
              {MONTH_NAMES[month]} {year}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
              <Text style={styles.navArrow}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day labels */}
          <View style={styles.weekRow}>
            {DAY_LABELS.map((d) => (
              <View key={d} style={styles.dayCell}>
                <Text style={styles.dayLabel}>{d}</Text>
              </View>
            ))}
          </View>

          {/* Calendar grid */}
          {loading ? (
            <ActivityIndicator style={{ marginVertical: 32 }} color="#F48F92" />
          ) : (
            renderCalendar()
          )}

          <Text style={styles.hint}>🍽️ = diary entry — tap to view</Text>
        </View>
      </ScrollView>

      {/* Bottom sheet modal */}
      <Modal
        visible={!!selectedEntry}
        animationType="slide"
        transparent
        onRequestClose={() => setSelectedEntry(null)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedEntry(null)}
        />
        {selectedEntry && (
          <View style={styles.bottomSheet}>
            <View style={styles.sheetHandle} />

            <ScrollView
              contentContainerStyle={styles.sheetContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Date */}
              <Text style={styles.sheetDate}>
                {new Date(selectedEntry.date + "T12:00:00").toLocaleDateString(
                  [],
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}
              </Text>

              {/* Photo */}
              {selectedEntry.photoUri && (
                <Image
                  source={{ uri: selectedEntry.photoUri }}
                  style={styles.sheetPhoto}
                />
              )}

              {/* Rating */}
              <View style={styles.sheetStarsRow}>
                {renderStars(selectedEntry.rating)}
                <Text style={styles.sheetRatingText}>
                  {selectedEntry.rating} / 10
                </Text>
              </View>

              {/* Diary text */}
              {selectedEntry.text ? (
                <Text style={styles.sheetText}>{selectedEntry.text}</Text>
              ) : (
                <Text style={styles.sheetTextEmpty}>No notes written.</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeBtn, { marginBottom: insets.bottom || 16 }]}
              onPress={() => setSelectedEntry(null)}
            >
              <Text style={styles.closeBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },
  scroll: {
    padding: 20,
    paddingBottom: 40,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  settingsBtn: {
    padding: 4,
  },
  settingsBtnText: {
    fontSize: 22,
  },

  // Calendar card
  calendarCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  monthNav: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  monthTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  navBtn: {
    padding: 8,
  },
  navArrow: {
    fontSize: 26,
    color: "#F48F92",
    lineHeight: 28,
  },
  weekRow: {
    flexDirection: "row",
  },
  dayCell: {
    width: DAY_SIZE,
    height: DAY_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  dayLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "#bbb",
  },
  dayNumber: {
    fontSize: 13,
    color: "#333",
  },
  todayCell: {
    backgroundColor: "#FFF0F0",
    borderRadius: DAY_SIZE / 2,
  },
  todayNumber: {
    color: "#F48F92",
    fontWeight: "700",
  },
  entryDot: {
    marginTop: 1,
  },
  entryDotEmoji: {
    fontSize: 10,
  },
  hint: {
    fontSize: 12,
    color: "#ccc",
    textAlign: "center",
    marginTop: 12,
  },

  // Modal / bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  bottomSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "70%",
  },
  sheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: "#eee",
    borderRadius: 2,
    alignSelf: "center",
    marginTop: 12,
    marginBottom: 4,
  },
  sheetContent: {
    padding: 20,
    paddingTop: 8,
  },
  sheetDate: {
    fontSize: 13,
    color: "#aaa",
    marginBottom: 14,
    textAlign: "center",
  },
  sheetPhoto: {
    width: "100%",
    height: 200,
    borderRadius: 14,
    marginBottom: 16,
    backgroundColor: "#f5f5f5",
  },
  sheetStarsRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 2,
    marginBottom: 14,
  },
  starSmall: {
    fontSize: 16,
    color: "#eee",
  },
  starSmallFilled: {
    color: "#F48F92",
  },
  sheetRatingText: {
    fontSize: 13,
    color: "#F48F92",
    fontWeight: "600",
    marginLeft: 6,
  },
  sheetText: {
    fontSize: 15,
    color: "#333",
    lineHeight: 22,
  },
  sheetTextEmpty: {
    fontSize: 15,
    color: "#ccc",
    fontStyle: "italic",
  },
  closeBtn: {
    marginHorizontal: 20,
    marginTop: 8,
    backgroundColor: "#F48F92",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  closeBtnText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
