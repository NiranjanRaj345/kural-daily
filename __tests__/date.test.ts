import { toLocalDateKey, calendarDaysBetween, computeStreak, uses24HourClock, monthGrid } from '../utils/date';

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

describe('monthGrid', () => {
  it('lays out a month in Sunday-first weeks', () => {
    // October 2026 starts on a Thursday and has 31 days
    const weeks = monthGrid(2026, 9);
    expect(weeks).toHaveLength(5);
    expect(weeks[0]).toEqual([null, null, null, null, '2026-10-01', '2026-10-02', '2026-10-03']);
    expect(weeks[4]).toEqual(['2026-10-25', '2026-10-26', '2026-10-27', '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31']);
  });

  it('handles leap-year February', () => {
    const cells = monthGrid(2028, 1).flat().filter(Boolean);
    expect(cells).toHaveLength(29);
    expect(cells[28]).toBe('2028-02-29');
  });
});
