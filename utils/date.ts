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

/** Whether the device shows times on a 24-hour clock. */
export const uses24HourClock = (): boolean => {
  try {
    const { hour12, hourCycle } = new Intl.DateTimeFormat(undefined, { hour: 'numeric' }).resolvedOptions() as Intl.ResolvedDateTimeFormatOptions & { hourCycle?: string };
    if (typeof hour12 === 'boolean') return !hour12;
    if (hourCycle) return hourCycle === 'h23' || hourCycle === 'h24';
  } catch {
    // Fall through to formatting check
  }
  // Day-period words differ by language (AM, PM, பிற்பகல், 下午…); 13:00 shown as "13" means 24-hour
  return /(^|\D)13(\D|$)/.test(new Date(2000, 0, 1, 13, 0).toLocaleTimeString([], { hour: 'numeric' }));
};

/**
 * A month laid out as calendar weeks (Sunday first): each cell is a local date
 * key, or null for the blank cells before the 1st and after the last day.
 */
export const monthGrid = (year: number, month: number): (string | null)[][] => {
  const first = new Date(year, month, 1);
  const days = new Date(year, month + 1, 0).getDate();
  const cells: (string | null)[] = Array(first.getDay()).fill(null);
  for (let d = 1; d <= days; d++) cells.push(toLocalDateKey(new Date(year, month, d)));
  while (cells.length % 7 !== 0) cells.push(null);
  return Array.from({ length: cells.length / 7 }, (_, w) => cells.slice(w * 7, w * 7 + 7));
};
