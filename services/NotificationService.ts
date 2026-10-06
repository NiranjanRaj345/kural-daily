import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { getKuralForDate } from './DailyService';
import { PlannedReminder, planReminders } from '../utils/reminderPlan';

const DAILY_CHANNEL = 'daily-kural';
const STREAK_CHANNEL = 'streak';

const notificationsSupported = Platform.OS !== 'web';

// Show reminders even when the app is open
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

let channelsReady = false;

async function ensureAndroidChannels() {
  if (Platform.OS !== 'android' || channelsReady) return;
  await Notifications.setNotificationChannelAsync(DAILY_CHANNEL, {
    name: 'Daily Kural',
    description: "Each day's Kural at the time you choose",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
  });
  await Notifications.setNotificationChannelAsync(STREAK_CHANNEL, {
    name: 'Streak reminder',
    description: "An evening nudge when you haven't read yet and your streak is about to end",
    importance: Notifications.AndroidImportance.DEFAULT,
  });
  channelsReady = true;
}

type PermissionResult = 'granted' | 'denied' | 'undetermined';

/**
 * Notification permission. Only shows the system prompt when `prompt` is true,
 * i.e. in response to the user turning a reminder on.
 */
export async function ensureNotificationPermission(prompt: boolean): Promise<PermissionResult> {
  if (!notificationsSupported) return 'denied';

  try {
    await ensureAndroidChannels();

    const current = await Notifications.getPermissionsAsync();
    if (current.status === 'granted') return 'granted';
    if (!prompt) return current.status === 'denied' ? 'denied' : 'undetermined';

    const requested = await Notifications.requestPermissionsAsync();
    return requested.status === 'granted' ? 'granted' : 'denied';
  } catch (error) {
    console.warn("Failed to get notification permission:", error);
    return 'undetermined';
  }
}

const contentFor = (reminder: PlannedReminder): Notifications.NotificationContentInput => {
  if (reminder.kind === 'daily') {
    const kural = getKuralForDate(reminder.date);
    return {
      title: `Today's Thirukkural · ${kural.number}`,
      body: `${kural.line1}\n${kural.line2}`,
      sound: true,
      data: { url: '/' },
    };
  }
  return {
    title: `Keep your ${reminder.streak}-day streak`,
    body: "You haven't read today's Kural yet. A minute is all it takes · இன்றைய குறளைப் படியுங்கள்",
    sound: true,
    data: { url: '/' },
  };
};

export async function cancelAllNotifications() {
  if (!notificationsSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.warn("Failed to cancel notifications:", error);
  }
}

// What is currently scheduled, so an unchanged plan isn't rescheduled on every
// foreground. Empty after a cold start, so each launch schedules once.
let scheduledSignature: string | null = null;

const signatureOf = (plan: PlannedReminder[]) =>
  plan.map((r) => `${r.kind}:${r.date.getTime()}:${r.kind === 'streak' ? r.streak : ''}`).join('|');

/** Replaces all scheduled reminders with the given plan. */
export async function scheduleReminders(plan: PlannedReminder[]) {
  await cancelAllNotifications();
  scheduledSignature = null;
  const results = await Promise.allSettled(
    plan.map((reminder) =>
      Notifications.scheduleNotificationAsync({
        content: contentFor(reminder),
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: reminder.date,
          channelId: reminder.kind === 'daily' ? DAILY_CHANNEL : STREAK_CHANNEL,
        },
      })
    )
  );
  const failed = results.filter((r) => r.status === 'rejected').length;
  if (failed > 0) {
    console.warn(`Failed to schedule ${failed} of ${plan.length} reminders`);
  } else {
    scheduledSignature = signatureOf(plan);
  }
}

/** Everything the reminder plan depends on. Re-plan whenever this changes. */
export const reminderInputs = (state: ReturnType<typeof useSettingsStore.getState>) => ({
  dailyEnabled: state.notificationsEnabled,
  dailyHour: state.notificationHour,
  dailyMinute: state.notificationMinute,
  streakEnabled: state.streakReminderEnabled,
  streakHour: state.streakReminderHour,
  streakMinute: state.streakReminderMinute,
  streak: state.streak,
  lastReadDate: state.lastReadDate,
});

export const reminderInputsKey = (state: ReturnType<typeof useSettingsStore.getState>) =>
  JSON.stringify(reminderInputs(state));

// Serialise syncs: settings changes and app foregrounding can trigger several at once
let syncChain: Promise<boolean> = Promise.resolve(false);

/**
 * Brings scheduled reminders in line with the saved settings and reading state.
 * If reminders are on but permission was revoked, the settings are switched off.
 * Returns whether any reminder is active afterwards.
 */
export function syncDailyReminders({ prompt = false } = {}): Promise<boolean> {
  syncChain = syncChain.then(() => runSync(prompt), () => runSync(prompt));
  return syncChain;
}

async function runSync(prompt: boolean): Promise<boolean> {
  const store = useSettingsStore.getState();
  const inputs = reminderInputs(store);
  const anyEnabled = inputs.dailyEnabled || inputs.streakEnabled;

  if (!notificationsSupported) {
    // Nothing can be scheduled here (web); keep the switches honest
    if (anyEnabled) {
      store.setNotificationsEnabled(false);
      store.setStreakReminderEnabled(false);
    }
    return false;
  }

  if (!anyEnabled) {
    scheduledSignature = null;
    await cancelAllNotifications();
    return false;
  }

  const permission = await ensureNotificationPermission(prompt);
  if (permission === 'denied') {
    // Refused (now or in system settings): switch the reminders off to match
    store.setNotificationsEnabled(false);
    store.setStreakReminderEnabled(false);
    scheduledSignature = null;
    await cancelAllNotifications();
    return false;
  }
  if (permission === 'undetermined') {
    // Not asked yet (a background sync can't ask). Leave the settings alone so a
    // sync that is allowed to prompt can still ask; nothing can be scheduled now.
    return false;
  }

  const plan = planReminders(inputs, { streak: inputs.streak, lastReadDate: inputs.lastReadDate }, new Date());
  if (signatureOf(plan) !== scheduledSignature) {
    await scheduleReminders(plan);
  }
  return true;
}

/** Turns the daily Kural reminder on (asking for permission if needed). Returns false if denied. */
export async function enableDailyReminders({ withStreak = false } = {}): Promise<boolean> {
  const store = useSettingsStore.getState();
  store.dismissNotificationPrompt();
  store.setNotificationsEnabled(true);
  if (withStreak) store.setStreakReminderEnabled(true);
  return syncDailyReminders({ prompt: true });
}

export async function disableDailyReminders() {
  useSettingsStore.getState().setNotificationsEnabled(false);
  await syncDailyReminders();
}

/** Turns the streak reminder on or off. Returns false if permission was denied. */
export async function setStreakReminder(enabled: boolean): Promise<boolean> {
  useSettingsStore.getState().setStreakReminderEnabled(enabled);
  return syncDailyReminders({ prompt: enabled });
}

export const formatReminderTime = (hour: number, minute: number) =>
  new Date(2000, 0, 1, hour, minute).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
