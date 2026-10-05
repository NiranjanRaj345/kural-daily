import data from '../assets/data/thirukkural.json';
import { Kural } from '../types/kural';

// Cast the imported JSON to the Kural type
const kurals: Kural[] = data as Kural[];

const kuralsByNumber = new Map<number, Kural>(kurals.map(k => [k.number, k]));

export const TOTAL_KURALS = kurals.length;

export const getAllKurals = (): Kural[] => {
  return kurals;
};

export const getKuralByNumber = (number: number): Kural | undefined => {
  return kuralsByNumber.get(number);
};

export const searchKurals = (query: string): Kural[] => {
  const trimmed = query.trim();
  if (!trimmed) return [];

  // A plain number jumps straight to that Kural
  if (/^\d+$/.test(trimmed)) {
    const exact = getKuralByNumber(parseInt(trimmed, 10));
    return exact ? [exact] : [];
  }

  const lowerQuery = trimmed.toLowerCase();
  return kurals.filter(k =>
    k.line1.toLowerCase().includes(lowerQuery) ||
    k.line2.toLowerCase().includes(lowerQuery) ||
    k.eng.toLowerCase().includes(lowerQuery) ||
    k.eng_exp.toLowerCase().includes(lowerQuery) ||
    k.chap_tam.toLowerCase().includes(lowerQuery) ||
    k.chap_eng?.toLowerCase().includes(lowerQuery)
  );
};

export interface Chapter {
  number: number;
  name: string;
  nameEnglish?: string;
  section: string;
  sectionEnglish?: string;
}

// Every chapter has exactly 10 kurals. Chapters are identified by number because
// two of them share a Tamil name (71 and 110 are both "குறிப்பறிதல்").
export const getChapterNumber = (kural: Kural) => Math.ceil(kural.number / 10);

const chapters: Chapter[] = [];
for (const k of kurals) {
  const number = getChapterNumber(k);
  if (!chapters[number - 1]) {
    chapters[number - 1] = {
      number,
      name: k.chap_tam,
      nameEnglish: k.chap_eng,
      section: k.sect_tam,
      sectionEnglish: k.sect_eng,
    };
  }
}

export const getChapters = (): Chapter[] => chapters;

export const getKuralsByChapter = (chapterNumber: number): Kural[] => {
  return kurals.filter(k => getChapterNumber(k) === chapterNumber);
};
