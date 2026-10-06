import { completedChapters, computeMilestones } from '../utils/milestones';
import { MASTERED_BOX, newCard } from '../utils/srs';

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

describe('milestones', () => {
  it('counts only fully read chapters', () => {
    expect(completedChapters(range(1, 10))).toBe(1);
    expect(completedChapters(range(1, 19))).toBe(1);
    expect(completedChapters([...range(1, 10), ...range(21, 30)])).toBe(2);
  });

  it('nothing is earned for a new reader', () => {
    expect(computeMilestones({ history: [], bestStreak: 0, learning: {} }).some((m) => m.earned)).toBe(false);
  });

  it('earns and tracks progress', () => {
    const milestones = computeMilestones({
      history: range(1, 12),
      bestStreak: 7,
      learning: { 1: { ...newCard('2026-10-05'), box: MASTERED_BOX } },
    });
    const byId = Object.fromEntries(milestones.map((m) => [m.id, m]));
    expect(byId.first.earned).toBe(true);
    expect(byId.chapter.earned).toBe(true);
    expect(byId.week.earned).toBe(true);
    expect(byId.learn.earned).toBe(true);
    expect(byId.month.earned).toBe(false);
    expect(byId.hundred.progressLabel).toBe('12/100');
    expect(byId.hundred.progress).toBeCloseTo(0.12);
  });
});
