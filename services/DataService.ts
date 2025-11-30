import data from '../assets/data/thirukkural.json';
import { Kural } from '../types/kural';

// Cast the imported JSON to the Kural type
const kurals: Kural[] = data as Kural[];

export const getAllKurals = (): Kural[] => {
  return kurals;
};

export const getKuralByNumber = (number: number): Kural | undefined => {
  return kurals.find(k => k.number === number);
};

export const searchKurals = (query: string): Kural[] => {
  const lowerQuery = query.toLowerCase();
  return kurals.filter(k =>
    k.line1.toLowerCase().includes(lowerQuery) ||
    k.line2.toLowerCase().includes(lowerQuery) ||
    k.eng.toLowerCase().includes(lowerQuery) ||
    k.number.toString().includes(lowerQuery) ||
    k.chap_tam.toLowerCase().includes(lowerQuery) ||
    k.chap_eng?.toLowerCase().includes(lowerQuery)
  );
};

export const getKuralsByChapter = (chapterName: string): Kural[] => {
    return kurals.filter(k => k.chap_tam === chapterName);
};

export const getChapters = () => {
    // Extract unique chapters
    const chapters = new Set(kurals.map(k => k.chap_tam));
    return Array.from(chapters);
};