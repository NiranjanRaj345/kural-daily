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

export const generateMissingWordQuestion = (): QuizQuestion => {
  const allKurals = getAllKurals();
  const randomKural = getRandomKural(allKurals);
  
  // Combine lines and split into words
  const fullText = `${randomKural.line1} ${randomKural.line2}`;
  const words = fullText.split(/\s+/).filter(w => w.length > 2); // Filter out very short words
  
  if (words.length < 4) {
    return generateMissingWordQuestion();
  }

  // Select a random word to mask
  const correctWordIndex = Math.floor(Math.random() * words.length);
  const correctWord = words[correctWordIndex];
  
  // Create masked text
  const maskedText = fullText.replace(correctWord, '_______');

  // Generate distractors
  const distractors: string[] = [];
  while (distractors.length < 3) {
    const randomDistractorKural = getRandomKural(allKurals);
    const distractorWords = `${randomDistractorKural.line1} ${randomDistractorKural.line2}`.split(/\s+/);
    const randomDistractor = distractorWords[Math.floor(Math.random() * distractorWords.length)];
    
    if (randomDistractor !== correctWord && !distractors.includes(randomDistractor) && randomDistractor.length > 2) {
      distractors.push(randomDistractor);
    }
  }

  const options = shuffleArray([...distractors, correctWord]);
  const correctAnswerIndex = options.indexOf(correctWord);

  return {
    id: Math.random().toString(36).substr(2, 9),
    kural: randomKural,
    questionText: maskedText,
    options,
    correctAnswerIndex,
    type: 'missing-word',
  };
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
    id: Math.random().toString(36).substr(2, 9),
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
    id: Math.random().toString(36).substr(2, 9),
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
    id: Math.random().toString(36).substr(2, 9),
    kural: randomKural,
    questionText: "Arrange the words in the correct order:",
    options: [], // Not used for this type in the same way
    correctAnswerIndex: -1, // Not used
    type: 'jumbled-kural',
    jumbledWords
  };
};