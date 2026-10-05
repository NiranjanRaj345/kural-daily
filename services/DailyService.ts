import { getKuralByNumber, getAllKurals } from './DataService';
import { Kural } from '../types/kural';
import { calendarDaysBetween } from '../utils/date';

// Epoch start date: Jan 1, 2024
// This ensures a continuous cycle through all 1330 Kurals without resetting every year
const EPOCH_START = new Date(2024, 0, 1);

export const getKuralForDate = (date: Date): Kural => {
  const all = getAllKurals();
  if (all.length === 0) {
    throw new Error('No Kurals found in data source');
  }

  const diffDays = calendarDaysBetween(EPOCH_START, date);
  // Ensure positive index even if date is before epoch
  const index = ((diffDays % all.length) + all.length) % all.length;

  return getKuralByNumber(index + 1) ?? all[index];
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
