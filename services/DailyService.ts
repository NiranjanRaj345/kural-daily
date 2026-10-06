import { getKuralByNumber, getAllKurals } from './DataService';
import { Kural } from '../types/kural';
import { calendarDaysBetween } from '../utils/date';

/*
 * Which Kural is shown on which day.
 *
 * All 1330 Kurals are put in one fixed, shuffled order, and each day takes the
 * next one. So:
 *  - tomorrow's Kural is a surprise (not simply today's number + 1);
 *  - no Kural repeats until every one of the 1330 has been shown, and then each
 *    comes back exactly 1330 days (about 3 years 8 months) later;
 *  - two days in a row never come from the same chapter;
 *  - everyone sees the same Kural on the same day, and a reminder scheduled
 *    weeks ahead can name that day's Kural.
 * The order comes from a seeded shuffle, so it never changes between app
 * versions or phones. Changing ORDER_SEED would reshuffle every day's Kural.
 */

// Day 0 of the order. Kept from earlier versions so existing reminders stay valid.
const EPOCH_START = new Date(2024, 0, 1);
const ORDER_SEED = 1330;

/** A small, fast, seeded pseudo-random generator (mulberry32). */
const seededRandom = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const chapterOf = (n: number) => Math.ceil(n / 10);

/**
 * The daily order: every Kural number from 1 to `total` exactly once, shuffled,
 * with no two neighbours (including last → first, as the order repeats) from
 * the same chapter.
 */
export const buildDailyOrder = (total: number, seed = ORDER_SEED): number[] => {
  const random = seededRandom(seed);
  const order = Array.from({ length: total }, (_, i) => i + 1);
  // Fisher–Yates shuffle
  for (let i = total - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  if (total < 30) return order;

  // Break up neighbours from the same chapter by swapping in a Kural from elsewhere
  const clashes = (i: number) => {
    const prev = order[(i - 1 + total) % total];
    const next = order[(i + 1) % total];
    return chapterOf(order[i]) === chapterOf(prev) || chapterOf(order[i]) === chapterOf(next);
  };
  for (let pass = 0; pass < 3; pass++) {
    let changed = false;
    for (let i = 0; i < total; i++) {
      if (!clashes(i)) continue;
      for (let step = 2; step < total; step++) {
        const j = (i + step) % total;
        [order[i], order[j]] = [order[j], order[i]];
        if (!clashes(i) && !clashes(j)) {
          changed = true;
          break;
        }
        [order[i], order[j]] = [order[j], order[i]];
      }
    }
    if (!changed) break;
  }
  return order;
};

let dailyOrder: number[] | null = null;
const getDailyOrder = () => {
  if (!dailyOrder || dailyOrder.length !== getAllKurals().length) {
    dailyOrder = buildDailyOrder(getAllKurals().length);
  }
  return dailyOrder;
};

export const getKuralForDate = (date: Date): Kural => {
  const all = getAllKurals();
  if (all.length === 0) {
    throw new Error('No Kurals found in data source');
  }

  const order = getDailyOrder();
  const diffDays = calendarDaysBetween(EPOCH_START, date);
  // Ensure a positive index even for dates before the epoch
  const index = ((diffDays % order.length) + order.length) % order.length;

  return getKuralByNumber(order[index]) ?? all[index];
};

export const getDailyKural = (): Kural => getKuralForDate(new Date());

export const getRandomKural = (): Kural => {
  const all = getAllKurals();
  if (all.length === 0) {
    throw new Error('No Kurals found');
  }
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex];
};
