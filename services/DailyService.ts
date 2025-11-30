import { getKuralByNumber, getAllKurals } from './DataService';
import { Kural } from '../types/kural';

// Epoch start date: Jan 1, 2024
// This ensures a continuous cycle through all 1330 Kurals without resetting every year
const EPOCH_START = new Date(2024, 0, 1);

export const getDailyKural = (): Kural => {
  const now = new Date();
  
  // Reset time to midnight for accurate day calculation
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const start = new Date(EPOCH_START.getFullYear(), EPOCH_START.getMonth(), EPOCH_START.getDate());
  
  const diffTime = today.getTime() - start.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  const totalKurals = 1330;
  // Ensure positive index even if date is before epoch (though unlikely in prod)
  let targetId = ((diffDays % totalKurals) + totalKurals) % totalKurals + 1;

  let kural = getKuralByNumber(targetId);

  // Fallback for development with sample data
  if (!kural) {
    const all = getAllKurals();
    if (all.length > 0) {
        const sampleIndex = ((diffDays % all.length) + all.length) % all.length;
        kural = all[sampleIndex];
    }
  }

  if (!kural) {
      throw new Error("No Kurals found in data source");
  }

  return kural;
};

export const getRandomKural = (): Kural => {
  const all = getAllKurals();
  if (all.length === 0) {
    throw new Error("No Kurals found");
  }
  const randomIndex = Math.floor(Math.random() * all.length);
  return all[randomIndex];
};