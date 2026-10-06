import { getAllKurals, getBookStructure, getChapters, getKuralByNumber, getKuralsByChapter, getPositionInChapter, searchKurals } from '../services/DataService';

describe('DataService', () => {
  it('has all 1330 kurals in 133 chapters', () => {
    expect(getAllKurals()).toHaveLength(1330);
    expect(getChapters()).toHaveLength(133);
  });

  it('keeps chapters that share a Tamil name separate', () => {
    const chapters = getChapters();
    expect(chapters[70].name).toBe(chapters[109].name);
    expect(chapters[70].sectionEnglish).toBe('Wealth');
    expect(chapters[109].sectionEnglish).toBe('Love');
    expect(getKuralsByChapter(71).map(k => k.number)).toEqual([701, 702, 703, 704, 705, 706, 707, 708, 709, 710]);
    for (const chapter of chapters) {
      expect(getKuralsByChapter(chapter.number)).toHaveLength(10);
    }
  });

  it('derives the book structure: 3 books, 13 parts, 133 chapters', () => {
    const books = getBookStructure();
    expect(books.map((b) => [b.nameEnglish, b.chapters, b.kurals])).toEqual([
      ['Virtue', 38, 380], ['Wealth', 70, 700], ['Love', 25, 250],
    ]);
    expect(books.flatMap((b) => b.groups)).toHaveLength(13);
    expect(books[1].groups.map((g) => g.name)).toContain('படையியல்');
  });

  it('knows a Kural\'s place in its chapter', () => {
    expect(getPositionInChapter(getKuralByNumber(1009)!)).toBe(9);
    expect(getPositionInChapter(getKuralByNumber(1010)!)).toBe(10);
  });

  it('every kural has the required text', () => {
    for (const k of getAllKurals()) {
      expect(k.line1 && k.line2 && k.eng && k.tam_exp && k.eng_exp && k.chap_tam).toBeTruthy();
    }
  });

  it('looks up by number', () => {
    expect(getKuralByNumber(1)?.line1).toContain('அகர');
    expect(getKuralByNumber(1331)).toBeUndefined();
  });

  it('numeric search returns exactly that kural', () => {
    expect(searchKurals('13').map(k => k.number)).toEqual([13]);
    expect(searchKurals(' 7 ').map(k => k.number)).toEqual([7]);
    expect(searchKurals('9999')).toEqual([]);
  });

  it('searches Tamil and English text', () => {
    expect(searchKurals('அகர').some(k => k.number === 1)).toBe(true);
    expect(searchKurals('Ancient Lord').some(k => k.number === 1)).toBe(true);
    expect(searchKurals('   ')).toEqual([]);
  });
});
