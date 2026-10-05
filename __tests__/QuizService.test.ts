import {
  generateMissingWordQuestion,
  generateMeaningMatchQuestion,
  generateFindChapterQuestion,
  generateJumbledKuralQuestion,
  normalizeWord,
} from '../services/QuizService';

const RUNS = 300;

describe('generateMissingWordQuestion', () => {
  it('always has exactly one correct, punctuation-free answer', () => {
    for (let i = 0; i < RUNS; i++) {
      const q = generateMissingWordQuestion();
      expect(q.options).toHaveLength(4);
      expect(new Set(q.options).size).toBe(4);
      expect(q.correctAnswerIndex).toBeGreaterThanOrEqual(0);

      const answer = q.options[q.correctAnswerIndex];
      for (const option of q.options) {
        expect(option).toBe(normalizeWord(option));
      }

      // The blank appears once, and filling it in restores the original Kural
      expect(q.questionText.split('_______')).toHaveLength(2);
      expect(q.questionText.replace('_______', answer)).toBe(`${q.kural.line1.split(/\s+/).filter(Boolean).join(' ')}\n${q.kural.line2.split(/\s+/).filter(Boolean).join(' ')}`);

      // Wrong options must not also fit the blank
      const kuralWords = `${q.kural.line1} ${q.kural.line2}`.split(/\s+/).map(normalizeWord);
      q.options.forEach((option, index) => {
        if (index !== q.correctAnswerIndex) expect(kuralWords).not.toContain(option);
      });
    }
  });
});

describe('other quiz types', () => {
  it('meaning match and find chapter have 4 unique options including the answer', () => {
    for (let i = 0; i < RUNS; i++) {
      const meaning = generateMeaningMatchQuestion();
      expect(new Set(meaning.options).size).toBe(4);
      expect(meaning.options[meaning.correctAnswerIndex]).toBe(meaning.kural.tam_exp);

      const chapter = generateFindChapterQuestion();
      expect(new Set(chapter.options).size).toBe(4);
      expect(chapter.options[chapter.correctAnswerIndex]).toBe(chapter.kural.chap_tam);
    }
  });

  it('jumbled kural contains every word of the kural', () => {
    const q = generateJumbledKuralQuestion();
    const words = `${q.kural.line1} ${q.kural.line2}`.split(/\s+/).filter(Boolean);
    expect([...(q.jumbledWords ?? [])].sort()).toEqual([...words].sort());
  });
});
