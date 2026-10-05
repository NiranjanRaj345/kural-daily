import { addDaysToKey } from './date';

/*
 * Spaced repetition with Leitner boxes. A Kural you are learning sits in a box;
 * remembering it moves it up (longer gap before the next review), forgetting
 * sends it back to the first box.
 */

/** Days until the next review for each box. */
export const BOX_INTERVALS = [1, 2, 4, 7, 15, 30, 60] as const;
/** From this box on, a Kural counts as known by heart. */
export const MASTERED_BOX = 5;
const LAST_BOX = BOX_INTERVALS.length - 1;

export interface LearningCard {
  box: number;
  /** Local date key (YYYY-MM-DD) of the next review. */
  due: string;
  added: string;
  lastReviewed?: string;
  reviews: number;
}

export type LearningMap = Record<string, LearningCard>;

export const newCard = (todayKey: string): LearningCard => ({
  box: 0,
  due: addDaysToKey(todayKey, BOX_INTERVALS[0]),
  added: todayKey,
  reviews: 0,
});

export const reviewCard = (card: LearningCard, remembered: boolean, todayKey: string): LearningCard => {
  const box = remembered ? Math.min(card.box + 1, LAST_BOX) : 0;
  return {
    ...card,
    box,
    due: addDaysToKey(todayKey, BOX_INTERVALS[box]),
    lastReviewed: todayKey,
    reviews: card.reviews + 1,
  };
};

export const isDue = (card: LearningCard, todayKey: string) => card.due <= todayKey;

/** Kural numbers due for review, most overdue first. */
export const dueKurals = (map: LearningMap, todayKey: string): number[] =>
  Object.entries(map)
    .filter(([, card]) => isDue(card, todayKey))
    .sort(([a, ca], [b, cb]) => ca.due.localeCompare(cb.due) || Number(a) - Number(b))
    .map(([n]) => Number(n));

export const learningSummary = (map: LearningMap, todayKey: string) => {
  const cards = Object.values(map);
  return {
    total: cards.length,
    mastered: cards.filter((c) => c.box >= MASTERED_BOX).length,
    due: cards.filter((c) => isDue(c, todayKey)).length,
  };
};
