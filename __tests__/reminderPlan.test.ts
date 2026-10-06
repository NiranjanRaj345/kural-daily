import { DAILY_WINDOW_DAYS, planReminders, ReminderSettings } from '../utils/reminderPlan';

const settings = (over: Partial<ReminderSettings> = {}): ReminderSettings => ({
  dailyEnabled: true, dailyHour: 7, dailyMinute: 30,
  streakEnabled: true, streakHour: 20, streakMinute: 0,
  ...over,
});
const at = (d: number, h: number, m = 0) => new Date(2026, 9, d, h, m);

describe('daily reminders', () => {
  it('schedules every day of the window at the chosen time', () => {
    const plan = planReminders(settings({ streakEnabled: false }), { streak: 0, lastReadDate: null }, at(6, 6));
    expect(plan).toHaveLength(DAILY_WINDOW_DAYS + 1);
    expect(plan[0]).toMatchObject({ kind: 'daily', dayKey: '2026-10-06' });
    expect(plan[0].date).toEqual(at(6, 7, 30));
    expect(plan[1].date).toEqual(at(7, 7, 30));
  });

  it('skips a time that has passed today', () => {
    const plan = planReminders(settings({ streakEnabled: false }), { streak: 0, lastReadDate: null }, at(6, 9));
    expect(plan[0].dayKey).toBe('2026-10-07');
    expect(plan).toHaveLength(DAILY_WINDOW_DAYS);
  });

  it("skips today's reminder once today's Kural has been read", () => {
    const plan = planReminders(settings({ streakEnabled: false }), { streak: 1, lastReadDate: '2026-10-06' }, at(6, 6));
    expect(plan[0].dayKey).toBe('2026-10-07');
  });

  it('allows any minute of the day', () => {
    const plan = planReminders(settings({ dailyHour: 23, dailyMinute: 47, streakEnabled: false }), { streak: 0, lastReadDate: null }, at(6, 6));
    expect(plan[0].date).toEqual(at(6, 23, 47));
  });

  it('stays within the iOS limit of 64 pending notifications', () => {
    expect(planReminders(settings(), { streak: 5, lastReadDate: '2026-10-05' }, at(6, 6)).length).toBeLessThanOrEqual(64);
  });
});

describe('streak reminder', () => {
  const daily = { dailyEnabled: false };

  it('nudges this evening when yesterday was read but today is not', () => {
    const plan = planReminders(settings(daily), { streak: 4, lastReadDate: '2026-10-05' }, at(6, 12));
    expect(plan).toEqual([{ kind: 'streak', dayKey: '2026-10-06', date: at(6, 20), streak: 4 }]);
  });

  it('moves to tomorrow evening once today is read', () => {
    const plan = planReminders(settings(daily), { streak: 5, lastReadDate: '2026-10-06' }, at(6, 12));
    expect(plan).toEqual([{ kind: 'streak', dayKey: '2026-10-07', date: at(7, 20), streak: 5 }]);
  });

  it('does nothing once the streak is already lost or never started', () => {
    expect(planReminders(settings(daily), { streak: 4, lastReadDate: '2026-10-03' }, at(6, 12))).toEqual([]);
    expect(planReminders(settings(daily), { streak: 0, lastReadDate: null }, at(6, 12))).toEqual([]);
  });

  it('does nothing if the reminder time has passed today', () => {
    expect(planReminders(settings(daily), { streak: 4, lastReadDate: '2026-10-05' }, at(6, 21))).toEqual([]);
  });

  it('is left out when it would fire at the same time as the daily reminder', () => {
    const plan = planReminders(settings({ dailyHour: 20, dailyMinute: 0 }), { streak: 4, lastReadDate: '2026-10-05' }, at(6, 12));
    expect(plan.some((r) => r.kind === 'streak')).toBe(false);
  });

  it('can be on while the daily reminder is off, and the reverse', () => {
    expect(planReminders(settings({ dailyEnabled: false, streakEnabled: false }), { streak: 3, lastReadDate: '2026-10-05' }, at(6, 6))).toEqual([]);
    const both = planReminders(settings(), { streak: 3, lastReadDate: '2026-10-05' }, at(6, 6));
    expect(both.filter((r) => r.kind === 'streak')).toHaveLength(1);
    expect(both[0].kind).toBe('daily');
  });
});
