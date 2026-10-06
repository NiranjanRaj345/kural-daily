import { buildDailyOrder, getKuralForDate } from '../services/DailyService';

const day = (offset: number) => new Date(2024, 0, 1 + offset);
const chapterOf = (n: number) => Math.ceil(n / 10);

describe('daily order', () => {
  const order = buildDailyOrder(1330);

  it('contains every Kural exactly once', () => {
    expect(order).toHaveLength(1330);
    expect(new Set(order).size).toBe(1330);
    expect(Math.min(...order)).toBe(1);
    expect(Math.max(...order)).toBe(1330);
  });

  it('is shuffled, not the book order', () => {
    const inSequence = order.filter((n, i) => i > 0 && n === order[i - 1] + 1).length;
    expect(inSequence).toBeLessThan(10);
  });

  it('never puts two Kurals from the same chapter on neighbouring days, even across the wrap', () => {
    for (let i = 0; i < order.length; i++) {
      const next = order[(i + 1) % order.length];
      expect(chapterOf(order[i])).not.toBe(chapterOf(next));
    }
  });

  it('is the same every time (the same Kural for everyone on a given day)', () => {
    expect(buildDailyOrder(1330)).toEqual(order);
  });
});

describe('getKuralForDate', () => {
  it('shows no Kural twice within 1330 days', () => {
    const seen = new Set<number>();
    for (let d = 0; d < 1330; d++) seen.add(getKuralForDate(day(1000 + d)).number);
    expect(seen.size).toBe(1330);
  });

  it('brings each Kural back exactly 1330 days later', () => {
    for (const offset of [0, 17, 999, 2500]) {
      expect(getKuralForDate(day(offset + 1330)).number).toBe(getKuralForDate(day(offset)).number);
    }
  });

  it("doesn't simply count up from yesterday", () => {
    const today = getKuralForDate(new Date(2026, 9, 6)).number;
    const tomorrow = getKuralForDate(new Date(2026, 9, 7)).number;
    expect(tomorrow).not.toBe(today + 1);
    expect(chapterOf(tomorrow)).not.toBe(chapterOf(today));
  });

  it('is the same all day', () => {
    const morning = getKuralForDate(new Date(2026, 9, 5, 0, 5));
    const night = getKuralForDate(new Date(2026, 9, 5, 23, 55));
    expect(morning.number).toBe(night.number);
  });

  it('works for dates before the epoch', () => {
    expect(getKuralForDate(day(-1)).number).toBe(getKuralForDate(day(1329)).number);
  });
});
