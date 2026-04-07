import * as Notifications from "expo-notifications";
import * as Device from "expo-device";
import { Platform } from "react-native";

const DEV_MODE = __DEV__;

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

export async function scheduleReminders(days, hour, minute) {
  await cancelReminders();

  if (DEV_MODE) {
    // Fires in 5 seconds — background the app after saving to see it
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to cook! 🍳 (test)",
        body: `Would fire on days [${days.join(", ")}] at ${hour}:${String(
          minute
        ).padStart(2, "0")}`,
        sound: true,
        data: { type: "reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId: Platform.OS === "android" ? "reminders" : undefined,
      },
    });
    return;
  }

  // Production: one repeating trigger per selected weekday
  for (const weekday of days) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Time to cook! 🍳",
        body: "Your daily cooking reminder is here. What are you making today?",
        sound: true,
        data: { type: "reminder" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.CALENDAR,
        weekday,
        hour,
        minute,
        repeats: true,
        ...(Platform.OS === "android" && { channelId: "reminders" }),
      },
    });
  }
}

export async function cancelReminders() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
