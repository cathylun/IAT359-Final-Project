import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "./firebaseConfig.js";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function requestNotificationPermission() {
  if (!Device.isDevice) return false;
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
}

export async function setupAndroidChannel() {
  if (Platform.OS !== "android") return;
  await Notifications.setNotificationChannelAsync("reminders", {
    name: "Reminders",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
  });
}

// days = array of weekday numbers: 1 (Sun) → 7 (Sat)
// e.g. [2, 4, 6] = Monday, Wednesday, Friday
export async function scheduleWeeklyReminders({
  title,
  body,
  hour,
  minute,
  days,
}) {
  // Cancel all existing reminders first
  await cancelAllReminders();

  const scheduledIds = [];

  for (const weekday of days) {
    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: "default",
        ...(Platform.OS === "android" && { channelId: "reminders" }),
      },
      trigger: {
        weekday, // 1 = Sunday, 2 = Monday, ..., 7 = Saturday
        hour,
        minute,
        repeats: true,
      },
    });
    scheduledIds.push(id);
  }

  // Persist to Firestore so we can restore after reinstall
  const userId = auth.currentUser?.uid;
  if (userId) {
    await setDoc(
      doc(db, "users", userId),
      {
        reminders: {
          enabled: true,
          days,
          hour,
          minute,
          notificationIds: scheduledIds,
        },
      },
      { merge: true }
    );
  }

  return scheduledIds;
}

export async function cancelAllReminders() {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const userDoc = await getDoc(doc(db, "users", userId));
  const ids = userDoc.data()?.reminders?.notificationIds ?? [];

  for (const id of ids) {
    await Notifications.cancelScheduledNotificationAsync(id);
  }

  await setDoc(
    doc(db, "users", userId),
    {
      reminders: { enabled: false, notificationIds: [] },
    },
    { merge: true }
  );
}

export async function restoreRemindersFromFirestore() {
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  const userDoc = await getDoc(doc(db, "users", userId));
  const reminders = userDoc.data()?.reminders;

  if (reminders?.enabled && reminders?.days?.length > 0) {
    await scheduleWeeklyReminders({
      title: "🍽️ Foodies Reminder",
      body: "It's time to learn to cook!",
      hour: reminders.hour,
      minute: reminders.minute,
      days: reminders.days,
    });
  }
}
