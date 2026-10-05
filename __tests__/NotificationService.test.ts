import * as Notifications from 'expo-notifications';
import { scheduleDailyNotifications, syncDailyReminders } from '../services/NotificationService';
import { getKuralForDate } from '../services/DailyService';
import { useSettingsStore } from '../store/useSettingsStore';

jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  AndroidImportance: { HIGH: 4 },
  SchedulableTriggerInputTypes: { DATE: 'date' },
}));

const mocked = Notifications as jest.Mocked<typeof Notifications>;

beforeEach(() => {
  jest.clearAllMocks();
});

describe('scheduleDailyNotifications', () => {
  it('schedules the next 14 days with each day’s Kural, skipping a time already passed', async () => {
    const now = new Date(2026, 9, 5, 10, 0); // after today's 9:00 reminder
    await scheduleDailyNotifications(9, 0, now);

    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    const calls = mocked.scheduleNotificationAsync.mock.calls.map(c => c[0]);
    expect(calls).toHaveLength(14);

    const first = calls[0];
    const firstDate = (first.trigger as { date: Date }).date;
    expect(firstDate).toEqual(new Date(2026, 9, 6, 9, 0));
    expect(first.content.body).toContain(getKuralForDate(firstDate).line1);
    expect(first.content.title).toContain(String(getKuralForDate(firstDate).number));
  });

  it('includes today when the time is still ahead', async () => {
    await scheduleDailyNotifications(9, 0, new Date(2026, 9, 5, 8, 0));
    const firstDate = (mocked.scheduleNotificationAsync.mock.calls[0][0].trigger as { date: Date }).date;
    expect(firstDate).toEqual(new Date(2026, 9, 5, 9, 0));
    expect(mocked.scheduleNotificationAsync).toHaveBeenCalledTimes(15);
  });
});

describe('syncDailyReminders', () => {
  it('never prompts for permission unless asked to', async () => {
    useSettingsStore.setState({ notificationsEnabled: true });
    mocked.getPermissionsAsync.mockResolvedValue({ status: 'undetermined' } as never);

    const active = await syncDailyReminders();

    expect(active).toBe(false);
    expect(mocked.requestPermissionsAsync).not.toHaveBeenCalled();
    // Setting reflects reality when permission is missing
    expect(useSettingsStore.getState().notificationsEnabled).toBe(false);
  });

  it('cancels everything when reminders are off', async () => {
    useSettingsStore.setState({ notificationsEnabled: false });
    await syncDailyReminders();
    expect(mocked.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    expect(mocked.scheduleNotificationAsync).not.toHaveBeenCalled();
  });
});
