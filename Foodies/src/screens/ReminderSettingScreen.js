import { useState, useEffect } from "react";
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  Button,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../src/firebase";
import {
  scheduleWeeklyReminders,
  cancelAllReminders,
} from "../src/notifications";

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

// Quick presets for convenience
const PRESETS = [
  { label: "Every day", days: [1, 2, 3, 4, 5, 6, 7] },
  { label: "Weekdays", days: [2, 3, 4, 5, 6] },
  { label: "Weekends", days: [1, 7] },
  { label: "Mon, Wed, Fri", days: [2, 4, 6] },
  { label: "Tue, Thu", days: [3, 5] },
];

export default function ReminderSettingsScreen() {
  const [enabled, setEnabled] = useState(false);
  const [selectedDays, setSelectedDays] = useState([]);
  const [time, setTime] = useState(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load saved settings from Firestore on mount
  useEffect(() => {
    async function loadSavedSettings() {
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

      setLoading(false);
    }

    loadSavedSettings();
  }, []);

  function toggleDay(value) {
    setSelectedDays(
      (prev) =>
        prev.includes(value)
          ? prev.filter((d) => d !== value) // deselect
          : [...prev, value] // select
    );
  }

  function applyPreset(days) {
    setSelectedDays(days);
  }

  async function handleSave() {
    if (!enabled) {
      await cancelAllReminders();
      return;
    }

    if (selectedDays.length === 0) {
      alert("Please select at least one day.");
      return;
    }

    await scheduleWeeklyReminders({
      title: "🍽️ Foodies Reminder",
      body: "Check out what's cooking today!",
      hour: time.getHours(),
      minute: time.getMinutes(),
      days: selectedDays,
    });

    alert("Reminders saved!");
  }

  async function handleToggle(value) {
    setEnabled(value);
    if (!value) await cancelAllReminders();
  }

  function handleTimeChange(event, selectedTime) {
    setShowPicker(Platform.OS === "ios"); // keep open on iOS
    if (selectedTime) setTime(selectedTime);
  }

  const formattedTime = time.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (loading) return null;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Reminder Settings</Text>

      {/* Master toggle */}
      <View style={styles.row}>
        <Text style={styles.label}>Enable reminders</Text>
        <Switch value={enabled} onValueChange={handleToggle} />
      </View>

      {enabled && (
        <>
          {/* Time picker */}
          <Text style={styles.sectionLabel}>Reminder time</Text>
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

          {/* Presets */}
          <Text style={styles.sectionLabel}>Quick select</Text>
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

          {/* Day selector */}
          <Text style={styles.sectionLabel}>Or pick days manually</Text>
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
                    style={[styles.dayText, isSelected && styles.dayTextActive]}
                  >
                    {day.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Summary */}
          {selectedDays.length > 0 && (
            <Text style={styles.summary}>
              Reminders will fire every{" "}
              {DAYS.filter((d) => selectedDays.includes(d.value))
                .map((d) => d.label)
                .join(", ")}{" "}
              at {formattedTime}.
            </Text>
          )}
        </>
      )}

      {/* Save button */}
      <View style={styles.saveButton}>
        <Button title="Save Reminders" onPress={handleSave} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 24 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  label: { fontSize: 16 },
  sectionLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
    marginBottom: 10,
    marginTop: 8,
  },
  timeButton: {
    backgroundColor: "#f2f2f2",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  timeText: { fontSize: 32, fontWeight: "bold", textAlign: "center" },
  timeHint: { fontSize: 12, color: "#aaa", textAlign: "center", marginTop: 4 },
  presetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fff",
  },
  presetActive: { backgroundColor: "#ff6b35", borderColor: "#ff6b35" },
  presetText: { fontSize: 13, color: "#444" },
  presetTextActive: { color: "#fff", fontWeight: "600" },
  daysRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  dayButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  dayButtonActive: { backgroundColor: "#ff6b35", borderColor: "#ff6b35" },
  dayText: { fontSize: 12, color: "#444" },
  dayTextActive: { color: "#fff", fontWeight: "600" },
  summary: {
    fontSize: 14,
    color: "#555",
    backgroundColor: "#fff8f5",
    padding: 14,
    borderRadius: 10,
    marginBottom: 24,
    lineHeight: 20,
  },
  saveButton: { marginTop: 8 },
});
