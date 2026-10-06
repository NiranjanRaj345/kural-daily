import { addDaysToKey, toLocalDateKey } from './date';

/*
 * Decides which local notifications to schedule. Kept free of side effects so
 * it can be tested; NotificationService turns the plan into real notifications.
 *
 * - Daily Kural: one per day at the chosen time, each naming that day's Kural,
 *   for the next DAILY_WINDOW_DAYS days (topped up every time the app opens).
 *   Today's is skipped if the user has already read today.
 * - Streak reminder: one evening nudge when a streak is about to be lost,
 *   i.e. on the next day the user hasn't read yet. Only the next such day can
 *   be scheduled: once a day is missed the streak is gone.
 */

/** How far ahead daily reminders are scheduled. iOS allows 64 pending notifications. */
export const DAILY_WINDOW_DAYS = 30;

export interface ReminderSettings {
  dailyEnabled: boolean;
  dailyHour: number;
  dailyMinute: number;
  streakEnabled: boolean;
  streakHour: number;
  streakMinute: number;
}

export interface ReadingState {
  streak: number;
  /** Local date key of the last day the user read. */
  lastReadDate: string | null;
}

export type PlannedReminder =
  | { kind: 'daily'; date: Date; dayKey: string }
  | { kind: 'streak'; date: Date; dayKey: string; streak: number };

const at = (dayKey: string, hour: number, minute: number) => {
  const [y, m, d] = dayKey.split('-').map(Number);
  return new Date(y, m - 1, d, hour, minute, 0, 0);
};

export const planReminders = (settings: ReminderSettings, reading: ReadingState, now: Date): PlannedReminder[] => {
  const todayKey = toLocalDateKey(now);
  const readToday = reading.lastReadDate === todayKey;
  const plan: PlannedReminder[] = [];

  if (settings.dailyEnabled) {
    for (let offset = 0; offset <= DAILY_WINDOW_DAYS; offset++) {
      const dayKey = addDaysToKey(todayKey, offset);
      if (offset === 0 && readToday) continue;
      const date = at(dayKey, settings.dailyHour, settings.dailyMinute);
      if (date.getTime() > now.getTime()) plan.push({ kind: 'daily', date, dayKey });
    }
  }

  if (settings.streakEnabled && reading.streak > 0) {
    // The streak is still alive if the user read today or yesterday
    const yesterdayKey = addDaysToKey(todayKey, -1);
    const dayKey = readToday ? addDaysToKey(todayKey, 1) : reading.lastReadDate === yesterdayKey ? todayKey : null;
    if (dayKey) {
      const date = at(dayKey, settings.streakHour, settings.streakMinute);
      const sameAsDaily = settings.dailyEnabled &&
        settings.dailyHour === settings.streakHour && settings.dailyMinute === settings.streakMinute;
      if (date.getTime() > now.getTime() && !sameAsDaily) {
        plan.push({ kind: 'streak', date, dayKey, streak: reading.streak });
      }
    }
  }

  return plan.sort((a, b) => a.date.getTime() - b.date.getTime());
};
