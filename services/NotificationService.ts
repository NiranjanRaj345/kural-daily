import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { getKuralForDate } from './DailyService';

const CHANNEL_ID = 'daily-kural';

// A repeating DAILY trigger can't change its text, so instead we schedule one
// notification per day carrying that day's Kural, and top the window up every
// time the app is opened. iOS allows at most 64 pending notifications.
const DAYS_TO_SCHEDULE = 14;

const notificationsSupported = Platform.OS !== 'web';

// Configure how notifications appear when the app is in foreground
if (notificationsSupported) {
  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  } catch (error) {
    console.warn("Failed to set notification handler:", error);
  }
}

async function ensureAndroidChannel() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Daily Kural',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
}

/**
 * Returns whether notification permission is granted.
 * Only shows the system prompt when `prompt` is true, i.e. in response to a user action.
 */
export async function ensureNotificationPermission(prompt: boolean): Promise<boolean> {
  if (!notificationsSupported) return false;

  try {
    await ensureAndroidChannel();

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    if (existingStatus === 'granted') return true;
    if (!prompt) return false;

    const { status } = await Notifications.requestPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn("Failed to get notification permission:", error);
    return false;
  }
}

export async function scheduleDailyNotifications(hour: number, minute: number, now: Date = new Date()) {
  // Cancel existing to avoid duplicates
  await cancelAllNotifications();

  try {
    for (let offset = 0; offset <= DAYS_TO_SCHEDULE; offset++) {
      const fireDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset, hour, minute);
      if (fireDate.getTime() <= now.getTime()) continue;

      const kural = getKuralForDate(fireDate);
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `Today's Thirukkural · ${kural.number}`,
          body: `${kural.line1}\n${kural.line2}`,
          sound: true,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: fireDate,
          channelId: CHANNEL_ID,
        },
      });
    }
  } catch (error) {
    console.warn("Failed to schedule daily notifications:", error);
  }
}

export async function cancelAllNotifications() {
  if (!notificationsSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("Failed to cancel notifications:", error);
  }
}

/**
 * Brings scheduled reminders in line with the saved settings.
 * If reminders are on but permission was revoked, the setting is switched off.
 * Returns whether reminders are active afterwards.
 */
export async function syncDailyReminders({ prompt = false } = {}): Promise<boolean> {
  const { notificationsEnabled, notificationHour, notificationMinute, setNotificationsEnabled } =
    useSettingsStore.getState();

  if (!notificationsEnabled) {
    await cancelAllNotifications();
    return false;
  }

  const granted = await ensureNotificationPermission(prompt);
  if (!granted) {
    setNotificationsEnabled(false);
    await cancelAllNotifications();
    return false;
  }

  await scheduleDailyNotifications(notificationHour, notificationMinute);
  return true;
}

/** Turns reminders on (asking for permission if needed). Returns false if permission was denied. */
export async function enableDailyReminders(): Promise<boolean> {
  const { setNotificationsEnabled, dismissNotificationPrompt } = useSettingsStore.getState();
  dismissNotificationPrompt();
  setNotificationsEnabled(true);
  return syncDailyReminders({ prompt: true });
}

export async function disableDailyReminders() {
  useSettingsStore.getState().setNotificationsEnabled(false);
  await cancelAllNotifications();
}

export const formatReminderTime = (hour: number, minute: number) =>
  new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
