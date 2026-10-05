// Date helpers that work in the device's local timezone.
// Using toISOString() would give the UTC date, which is the previous day
// for users ahead of UTC (e.g. 00:00–05:30 in India).

export const toLocalDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Whole calendar days from `from` to `to`, ignoring time of day and DST shifts.
export const calendarDaysBetween = (from: Date, to: Date): number => {
  const a = Date.UTC(from.getFullYear(), from.getMonth(), from.getDate());
  const b = Date.UTC(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b - a) / MS_PER_DAY);
};

export const computeStreak = (
  lastReadDate: string | null,
  currentStreak: number,
  today: Date
): { streak: number; lastReadDate: string } => {
  const todayKey = toLocalDateKey(today);
  if (lastReadDate === todayKey) {
    return { streak: Math.max(currentStreak, 1), lastReadDate: todayKey };
  }

  const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
  if (lastReadDate === toLocalDateKey(yesterday)) {
    return { streak: currentStreak + 1, lastReadDate: todayKey };
  }

  return { streak: 1, lastReadDate: todayKey };
};

/** Adds whole calendar days to a YYYY-MM-DD key. */
export const addDaysToKey = (key: string, days: number): string => {
  const [y, m, d] = key.split('-').map(Number);
  return toLocalDateKey(new Date(y, m - 1, d + days));
};

/** The last `count` local date keys ending today, oldest first. */
export const lastNDays = (today: Date, count: number): string[] =>
  Array.from({ length: count }, (_, i) =>
    toLocalDateKey(new Date(today.getFullYear(), today.getMonth(), today.getDate() - (count - 1 - i)))
  );
