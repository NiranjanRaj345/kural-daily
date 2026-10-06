import { BOX_INTERVALS, MASTERED_BOX, dueKurals, learningSummary, newCard, reviewCard } from '../utils/srs';
import { addDaysToKey, lastNDays } from '../utils/date';

describe('date helpers', () => {
  it('adds days across month and year ends', () => {
    expect(addDaysToKey('2026-01-31', 1)).toBe('2026-02-01');
    expect(addDaysToKey('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDaysToKey('2028-02-28', 1)).toBe('2028-02-29');
  });

  it('lists the last N days oldest first', () => {
    expect(lastNDays(new Date(2026, 9, 2), 3)).toEqual(['2026-09-30', '2026-10-01', '2026-10-02']);
  });
});

describe('Leitner review schedule', () => {
  const today = '2026-10-05';

  it('new cards are due tomorrow', () => {
    const card = newCard(today);
    expect(card).toMatchObject({ box: 0, due: '2026-10-06', added: today, reviews: 0 });
  });

  it('remembering moves up a box with a longer gap', () => {
    let card = newCard(today);
    card = reviewCard(card, true, '2026-10-06');
    expect(card.box).toBe(1);
    expect(card.due).toBe(addDaysToKey('2026-10-06', BOX_INTERVALS[1]));
    expect(card.reviews).toBe(1);
  });

  it('forgetting sends it back to the first box', () => {
    const card = reviewCard({ ...newCard(today), box: 4 }, false, today);
    expect(card.box).toBe(0);
    expect(card.due).toBe('2026-10-06');
  });

  it('never goes past the last box', () => {
    const last = BOX_INTERVALS.length - 1;
    const card = reviewCard({ ...newCard(today), box: last }, true, today);
    expect(card.box).toBe(last);
  });

  it('lists due cards, most overdue first', () => {
    const map = {
      10: { ...newCard(today), due: '2026-10-05' },
      3: { ...newCard(today), due: '2026-10-01' },
      7: { ...newCard(today), due: '2026-10-09' },
    };
    expect(dueKurals(map, today)).toEqual([3, 10]);
    expect(learningSummary(map, today)).toEqual({ total: 3, mastered: 0, due: 2 });
  });

  it('counts mastered cards', () => {
    const map = { 1: { ...newCard(today), box: MASTERED_BOX }, 2: newCard(today) };
    expect(learningSummary(map, today).mastered).toBe(1);
  });
});
