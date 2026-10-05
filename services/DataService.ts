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
  /** Book (பால்): அறத்துப்பால், பொருட்பால், காமத்துப்பால் */
  section: string;
  sectionEnglish?: string;
  /** Part of the book (இயல்) */
  group: string;
  groupEnglish?: string;
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
      group: k.chapgrp_tam,
      groupEnglish: k.chapgrp_eng,
    };
  }
}

export const getChapters = (): Chapter[] => chapters;

export const getChapter = (chapterNumber: number): Chapter | undefined => chapters[chapterNumber - 1];

/** Position of a Kural within its chapter, 1–10. */
export const getPositionInChapter = (kural: Kural) => ((kural.number - 1) % 10) + 1;

export interface BookStructure {
  name: string;
  nameEnglish?: string;
  chapters: number;
  kurals: number;
  groups: { name: string; nameEnglish?: string; chapters: number; firstChapter: number }[];
}

/** The three books and their parts, derived from the data. */
export const getBookStructure = (): BookStructure[] => {
  const books: BookStructure[] = [];
  for (const chapter of chapters) {
    let book = books[books.length - 1];
    if (!book || book.name !== chapter.section) {
      book = { name: chapter.section, nameEnglish: chapter.sectionEnglish, chapters: 0, kurals: 0, groups: [] };
      books.push(book);
    }
    book.chapters += 1;
    book.kurals += 10;
    let group = book.groups[book.groups.length - 1];
    if (!group || group.name !== chapter.group) {
      group = { name: chapter.group, nameEnglish: chapter.groupEnglish, chapters: 0, firstChapter: chapter.number };
      book.groups.push(group);
    }
    group.chapters += 1;
  }
  return books;
};

export const getKuralsByChapter = (chapterNumber: number): Kural[] => {
  return kurals.filter(k => getChapterNumber(k) === chapterNumber);
};
