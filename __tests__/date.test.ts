import { toLocalDateKey, calendarDaysBetween, computeStreak, uses24HourClock } from '../utils/date';

describe('toLocalDateKey', () => {
  it('uses the local calendar date, not UTC', () => {
    // 00:30 local time is still "today" locally even where UTC is a day behind
    expect(toLocalDateKey(new Date(2026, 9, 5, 0, 30))).toBe('2026-10-05');
    expect(toLocalDateKey(new Date(2026, 0, 9, 23, 59))).toBe('2026-01-09');
  });
});

describe('calendarDaysBetween', () => {
  it('ignores time of day', () => {
    expect(calendarDaysBetween(new Date(2024, 0, 1, 23, 0), new Date(2024, 0, 2, 0, 1))).toBe(1);
    expect(calendarDaysBetween(new Date(2024, 0, 1), new Date(2024, 0, 1, 18))).toBe(0);
  });

  it('counts across leap years', () => {
    expect(calendarDaysBetween(new Date(2024, 0, 1), new Date(2025, 0, 1))).toBe(366);
  });
});

describe('computeStreak', () => {
  const today = new Date(2026, 9, 5, 0, 15);

  it('starts at 1 on first read', () => {
    expect(computeStreak(null, 0, today)).toEqual({ streak: 1, lastReadDate: '2026-10-05' });
  });

  it('does not change when already read today', () => {
    expect(computeStreak('2026-10-05', 4, today)).toEqual({ streak: 4, lastReadDate: '2026-10-05' });
  });

  it('continues from yesterday', () => {
    expect(computeStreak('2026-10-04', 4, today)).toEqual({ streak: 5, lastReadDate: '2026-10-05' });
  });

  it('continues across a month boundary', () => {
    expect(computeStreak('2026-09-30', 2, new Date(2026, 9, 1, 8))).toEqual({ streak: 3, lastReadDate: '2026-10-01' });
  });

  it('resets after a missed day', () => {
    expect(computeStreak('2026-10-03', 9, today)).toEqual({ streak: 1, lastReadDate: '2026-10-05' });
  });
});

describe('uses24HourClock', () => {
  it('returns a boolean for the current locale', () => {
    expect(typeof uses24HourClock()).toBe('boolean');
  });
});
