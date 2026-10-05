import { getAllKurals } from './DataService';
import { Kural } from '../types/kural';

export type QuizType = 'missing-word' | 'meaning-match' | 'find-chapter' | 'jumbled-kural';

export interface QuizQuestion {
  id: string;
  kural: Kural;
  questionText: string;
  options: string[];
  correctAnswerIndex: number;
  type: QuizType;
  jumbledWords?: string[]; // Only for jumbled-kural
}

const shuffleArray = <T>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const getRandomKural = (allKurals: Kural[]): Kural => {
  return allKurals[Math.floor(Math.random() * allKurals.length)];
};

const newId = () => Math.random().toString(36).slice(2, 11);

const PUNCTUATION = /[.,;:!?'"“”‘’()\[\]-]/g;

// Strip punctuation so options don't give the answer away (e.g. "உலகு." vs "உலகு")
export const normalizeWord = (word: string) => word.replace(PUNCTUATION, '').trim();

const MIN_WORD_LENGTH = 3;

export const generateMissingWordQuestion = (): QuizQuestion => {
  const allKurals = getAllKurals();

  for (let attempt = 0; attempt < 50; attempt++) {
    const randomKural = getRandomKural(allKurals);
    const lines = [randomKural.line1, randomKural.line2].map(line => line.split(/\s+/).filter(Boolean));
    const tokens = lines.flatMap((words, lineIndex) =>
      words.map((raw, wordIndex) => ({ raw, word: normalizeWord(raw), lineIndex, wordIndex }))
    );

    // Only blank a word that appears once, so there's exactly one right answer
    const candidates = tokens.filter(t =>
      t.word.length >= MIN_WORD_LENGTH && tokens.filter(o => o.word === t.word).length === 1
    );
    if (candidates.length === 0) continue;

    const target = candidates[Math.floor(Math.random() * candidates.length)];
    const correctWord = target.word;
    const kuralWords = new Set(tokens.map(t => t.word));

    const maskedText = lines
      .map((words, lineIndex) =>
        words
          .map((raw, wordIndex) =>
            lineIndex === target.lineIndex && wordIndex === target.wordIndex
              ? (raw.includes(correctWord) ? raw.replace(correctWord, '_______') : '_______')
              : raw
          )
          .join(' ')
      )
      .join('\n');

    // Distractors come from other Kurals and must not appear in this one
    const distractors: string[] = [];
    for (let tries = 0; distractors.length < 3 && tries < 500; tries++) {
      const other = getRandomKural(allKurals);
      if (other.number === randomKural.number) continue;
      const otherWords = `${other.line1} ${other.line2}`.split(/\s+/).map(normalizeWord);
      const candidate = otherWords[Math.floor(Math.random() * otherWords.length)];
      if (
        candidate.length >= MIN_WORD_LENGTH &&
        !kuralWords.has(candidate) &&
        !distractors.includes(candidate)
      ) {
        distractors.push(candidate);
      }
    }
    if (distractors.length < 3) continue;

    const options = shuffleArray([...distractors, correctWord]);

    return {
      id: newId(),
      kural: randomKural,
      questionText: maskedText,
      options,
      correctAnswerIndex: options.indexOf(correctWord),
      type: 'missing-word',
    };
  }

  throw new Error('Could not generate a missing-word question');
};

export const generateMeaningMatchQuestion = (): QuizQuestion => {
  const allKurals = getAllKurals();
  const randomKural = getRandomKural(allKurals);
  
  const correctMeaning = randomKural.tam_exp; // Or eng_exp based on preference, sticking to Tamil for now

  const distractors: string[] = [];
  while (distractors.length < 3) {
    const randomDistractorKural = getRandomKural(allKurals);
    const distractorMeaning = randomDistractorKural.tam_exp;
    
    if (distractorMeaning !== correctMeaning && !distractors.includes(distractorMeaning)) {
      distractors.push(distractorMeaning);
    }
  }

  const options = shuffleArray([...distractors, correctMeaning]);
  const correctAnswerIndex = options.indexOf(correctMeaning);

  return {
    id: newId(),
    kural: randomKural,
    questionText: `${randomKural.line1}\n${randomKural.line2}`,
    options,
    correctAnswerIndex,
    type: 'meaning-match',
  };
};

export const generateFindChapterQuestion = (): QuizQuestion => {
  const allKurals = getAllKurals();
  const randomKural = getRandomKural(allKurals);
  
  const correctChapter = randomKural.chap_tam;

  const distractors: string[] = [];
  while (distractors.length < 3) {
    const randomDistractorKural = getRandomKural(allKurals);
    const distractorChapter = randomDistractorKural.chap_tam;
    
    if (distractorChapter !== correctChapter && !distractors.includes(distractorChapter)) {
      distractors.push(distractorChapter);
    }
  }

  const options = shuffleArray([...distractors, correctChapter]);
  const correctAnswerIndex = options.indexOf(correctChapter);

  return {
    id: newId(),
    kural: randomKural,
    questionText: `${randomKural.line1}\n${randomKural.line2}`,
    options,
    correctAnswerIndex,
    type: 'find-chapter',
  };
};

export const generateJumbledKuralQuestion = (): QuizQuestion => {
  const allKurals = getAllKurals();
  const randomKural = getRandomKural(allKurals);
  
  const fullText = `${randomKural.line1} ${randomKural.line2}`;
  const words = fullText.split(/\s+/).filter(w => w.length > 0);
  
  // For jumbled kural, the "options" will be the shuffled words
  // The "correct answer" isn't a single index, but the sequence.
  // However, to fit the interface, we can adapt or handle it specifically in UI.
  // Here we provide shuffled words.
  
  const jumbledWords = shuffleArray([...words]);

  return {
    id: newId(),
    kural: randomKural,
    questionText: "Arrange the words in the correct order:",
    options: [], // Not used for this type in the same way
    correctAnswerIndex: -1, // Not used
    type: 'jumbled-kural',
    jumbledWords
  };
};