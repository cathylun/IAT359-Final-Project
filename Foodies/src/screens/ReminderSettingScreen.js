import { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db, firebase_auth as auth } from "../firebaseConfig";
import { scheduleReminders, cancelReminders } from "../notifications";

// 1 = Sunday ... 7 = Saturday (matches expo-notifications weekday trigger)
const DAYS = [
  { label: "Sun", value: 1 },
  { label: "Mon", value: 2 },
  { label: "Tue", value: 3 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 5 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 7 },
];

const PRESETS = [
  { label: "Every day", days: [1, 2, 3, 4, 5, 6, 7] },
  { label: "Weekdays", days: [2, 3, 4, 5, 6] },
  { label: "Weekends", days: [1, 7] },
  { label: "Mon, Wed, Fri", days: [2, 4, 6] },
  { label: "Tue, Thu", days: [3, 5] },
];

export default function ReminderSettingsScreen({ navigation }) {
  const [enabled, setEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  const insets = useSafeAreaInsets();

  useEffect(() => {
    async function loadSavedSettings() {
      try {
        const userId = auth.currentUser?.uid;
        if (!userId) return;

        const userDoc = await getDoc(doc(db, "users", userId));
        const reminders = userDoc.data()?.reminders;

        if (reminders?.enabled) {
          setEnabled(true);
          setSelectedDays(reminders.days ?? []);
          const savedTime = new Date();
          savedTime.setHours(reminders.hour, reminders.minute, 0, 0);
          setTime(savedTime);
        }
      } catch (e) {
        console.error("Failed to load reminder settings:", e);
      } finally {
        setLoading(false);
      }
    }

    loadSavedSettings();
  }, []);

  function toggleDay(value) {
    setSelectedDays((prev) =>
      prev.includes(value) ? prev.filter((d) => d !== value) : [...prev, value]
    );
  }

  function applyPreset(days) {
    setSelectedDays(days);
  }

  async function handleSave() {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    if (!enabled) {
      await cancelReminders();
      await setDoc(
        doc(db, "users", userId),
        { reminders: { enabled: false } },
        { merge: true }
      );
      Alert.alert("Reminders turned off");
      return;
    }

    if (selectedDays.length === 0) {
      Alert.alert("Please select at least one day.");
      return;
    }

    const hour = time.getHours();
    const minute = time.getMinutes();

    await scheduleReminders(selectedDays, hour, minute);

    await setDoc(
      doc(db, "users", userId),
      { reminders: { enabled: true, days: selectedDays, hour, minute } },
      { merge: true }
    );

    Alert.alert(
      "Reminders saved!",
      __DEV__
        ? "Test notification arrives in 5 seconds — background the app now."
        : `You'll be reminded every ${DAYS.filter((d) =>
            selectedDays.includes(d.value)
          )
            .map((d) => d.label)
            .join(", ")} at ${time.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}.`
    );
  }

  async function handleToggle(value) {
    setEnabled(value);
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    if (!value) {
      await cancelReminders();
      await setDoc(
        doc(db, "users", userId),
        { reminders: { enabled: false } },
        { merge: true }
      );
    }
  }

  function handleTimeChange(event, selectedTime) {
    setShowPicker(Platform.OS === "ios");
    if (selectedTime) setTime(selectedTime);
  }

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) return null;

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.greeting}>Stay on track</Text>
            <Text style={styles.title}>Reminder Settings</Text>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 24) + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.content}>
          {/* Master toggle */}
          <View style={styles.sectionCard}>
            <View style={styles.toggleRow}>
              <View>
                <Text style={styles.sectionTitle}>Enable Reminders</Text>
                <Text style={styles.toggleSubtitle}>
                  Get notified when it's time to cook
                </Text>
              </View>
              <Switch
                value={enabled}
                onValueChange={handleToggle}
                trackColor={{ false: "#E0D0C8", true: "#F48F92" }}
                thumbColor={enabled ? "#fff" : "#fff"}
              />
            </View>
          </View>

          {enabled && (
            <>
              {/* Time picker */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Reminder Time</Text>
                <TouchableOpacity
                  style={styles.timeButton}
                  onPress={() => setShowPicker(true)}
                >
                  <Text style={styles.timeText}>{formattedTime}</Text>
                  <Text style={styles.timeHint}>Tap to change</Text>
                </TouchableOpacity>
                {showPicker && (
                  <DateTimePicker
                    value={time}
                    mode="time"
                    is24Hour={false}
                    onChange={handleTimeChange}
                  />
                )}
              </View>

              {/* Presets */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Quick Select</Text>
                <View style={styles.presetRow}>
                  {PRESETS.map((preset) => {
                    const isActive =
                      JSON.stringify([...preset.days].sort()) ===
                      JSON.stringify([...selectedDays].sort());
                    return (
                      <TouchableOpacity
                        key={preset.label}
                        style={[styles.preset, isActive && styles.presetActive]}
                        onPress={() => applyPreset(preset.days)}
                      >
                        <Text
                          style={[
                            styles.presetText,
                            isActive && styles.presetTextActive,
                          ]}
                        >
                          {preset.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Day selector */}
              <View style={styles.sectionCard}>
                <Text style={styles.sectionTitle}>Pick Days</Text>
                <View style={styles.daysRow}>
                  {DAYS.map((day) => {
                    const isSelected = selectedDays.includes(day.value);
                    return (
                      <TouchableOpacity
                        key={day.value}
                        style={[
                          styles.dayButton,
                          isSelected && styles.dayButtonActive,
                        ]}
                        onPress={() => toggleDay(day.value)}
                      >
                        <Text
                          style={[
                            styles.dayText,
                            isSelected && styles.dayTextActive,
                          ]}
                        >
                          {day.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Summary */}
              {selectedDays.length > 0 && (
                <View style={styles.summaryCard}>
                  <Text style={styles.summaryText}>
                    🍳 Reminders every{" "}
                    {DAYS.filter((d) => selectedDays.includes(d.value))
                      .map((d) => d.label)
                      .join(", ")}{" "}
                    at {formattedTime}
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Save button */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleSave}>
            <Text style={styles.primaryButtonText}>Save Reminders</Text>
          </TouchableOpacity>

          {navigation && (
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.secondaryButtonText}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },
  safeArea: {
    backgroundColor: "#F6E9DB",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },

  // Header
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
    paddingHorizontal: 20,
  },
  headerTextWrap: {
    flex: 1,
  },
  greeting: {
    fontSize: 15,
    color: "#9d7d7d",
    marginBottom: 4,
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2b2b2b",
  },

  // Cards
  sectionCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2b2b2b",
    marginBottom: 14,
  },

  // Toggle row
  toggleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  toggleSubtitle: {
    fontSize: 13,
    color: "#9d7d7d",
    marginTop: 2,
  },

  // Time
  timeButton: {
    backgroundColor: "#F6E9DB",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
  },
  timeText: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#2b2b2b",
  },
  timeHint: {
    fontSize: 12,
    color: "#9d7d7d",
    marginTop: 4,
  },

  // Presets
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  preset: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0D0C8",
    backgroundColor: "#fff",
  },
  presetActive: {
    backgroundColor: "#F48F92",
    borderColor: "#C96C70",
  },
  presetText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#4d4d4d",
  },
  presetTextActive: {
    color: "#fff",
  },

  // Days
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#E0D0C8",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dayButtonActive: {
    backgroundColor: "#F48F92",
    borderColor: "#C96C70",
  },
  dayText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#4d4d4d",
  },
  dayTextActive: {
    color: "#fff",
  },

  // Summary
  summaryCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 16,
    padding: 16,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: "#F4C9CA",
  },
  summaryText: {
    fontSize: 14,
    color: "#555",
    lineHeight: 20,
    fontWeight: "500",
  },

  // Buttons
  primaryButton: {
    backgroundColor: "#F48F92",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 6,
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  secondaryButton: {
    marginTop: 14,
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D07A7D",
  },
  secondaryButtonText: {
    color: "#C96C70",
    fontSize: 18,
    fontWeight: "bold",
  },
});
