import { getKuralForDate } from '../services/DailyService';

describe('getKuralForDate', () => {
  it('starts at Kural 1 on the epoch date', () => {
    expect(getKuralForDate(new Date(2024, 0, 1)).number).toBe(1);
  });

  it('advances one Kural per day', () => {
    expect(getKuralForDate(new Date(2024, 0, 2)).number).toBe(2);
    expect(getKuralForDate(new Date(2024, 1, 1)).number).toBe(32);
  });

  it('is the same all day', () => {
    const morning = getKuralForDate(new Date(2026, 9, 5, 0, 5));
    const night = getKuralForDate(new Date(2026, 9, 5, 23, 55));
    expect(morning.number).toBe(night.number);
  });

  it('wraps around after 1330 days', () => {
    const start = new Date(2024, 0, 1);
    const wrapped = new Date(2024, 0, 1 + 1330);
    expect(getKuralForDate(wrapped).number).toBe(getKuralForDate(start).number);
    expect(getKuralForDate(new Date(2024, 0, 1330)).number).toBe(1330);
  });
});
