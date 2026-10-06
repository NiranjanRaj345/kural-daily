import { LearningMap, MASTERED_BOX } from './srs';

export interface Milestone {
  id: string;
  title: string;
  tamil: string;
  description: string;
  icon: string;
  earned: boolean;
  /** 0–1 towards earning it. */
  progress: number;
  progressLabel: string;
}

interface MilestoneInput {
  history: number[];
  bestStreak: number;
  learning: LearningMap;
}

const TOTAL_KURALS = 1330;
const VIRTUE_LAST_KURAL = 380; // அறத்துப்பால்: chapters 1–38

/** Number of chapters whose 10 Kurals have all been read. */
export const completedChapters = (history: number[]): number => {
  const counts = new Map<number, number>();
  for (const n of new Set(history)) {
    const chapter = Math.ceil(n / 10);
    counts.set(chapter, (counts.get(chapter) ?? 0) + 1);
  }
  let done = 0;
  for (const count of counts.values()) if (count >= 10) done += 1;
  return done;
};

const goal = (
  id: string, title: string, tamil: string, description: string, icon: string, value: number, target: number
): Milestone => ({
  id, title, tamil, description, icon,
  earned: value >= target,
  progress: Math.min(value / target, 1),
  progressLabel: `${Math.min(value, target)}/${target}`,
});

export const computeMilestones = ({ history, bestStreak, learning }: MilestoneInput): Milestone[] => {
  const read = new Set(history);
  const chapters = completedChapters(history);
  const mastered = Object.values(learning).filter((c) => c.box >= MASTERED_BOX).length;
  const virtueRead = [...read].filter((n) => n <= VIRTUE_LAST_KURAL).length;

  return [
    goal('first', 'First step', 'முதல் அடி', 'Read your first Kural', 'shoe-print', read.size, 1),
    goal('chapter', 'A full chapter', 'ஓர் அதிகாரம்', 'Read all ten Kurals of a chapter', 'book-check-outline', chapters, 1),
    goal('week', 'Seven days', 'ஏழு நாள்', 'Read seven days in a row', 'fire', bestStreak, 7),
    goal('learn', 'By heart', 'மனப்பாடம்', 'Know your first Kural by heart', 'head-heart-outline', mastered, 1),
    goal('hundred', 'A hundred Kurals', 'நூறு குறள்', 'Read 100 different Kurals', 'numeric', read.size, 100),
    goal('month', 'A month of mornings', 'ஒரு திங்கள்', 'Read 30 days in a row', 'calendar-month-outline', bestStreak, 30),
    goal('ten-heart', 'Ten by heart', 'பத்து மனப்பாடம்', 'Know ten Kurals by heart', 'brain', mastered, 10),
    goal('chapters', 'Ten chapters', 'பத்து அதிகாரம்', 'Complete ten chapters', 'bookshelf', chapters, 10),
    goal('virtue', 'Book of Virtue', 'அறத்துப்பால்', 'Read all 380 Kurals on virtue', 'scale-balance', virtueRead, VIRTUE_LAST_KURAL),
    goal('all', 'The whole Kural', 'முப்பால்', 'Read all 1330 Kurals', 'crown-outline', read.size, TOTAL_KURALS),
  ];
};
