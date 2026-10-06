import { ACCENTS, buildTheme, readingSizes, resolveAppearance, ResolvedAppearance } from '../theme';

// WCAG relative luminance and contrast ratio
const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const contrast = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};

const appearances: ResolvedAppearance[] = ['paper', 'palm', 'night'];

describe('themes', () => {
  for (const appearance of appearances) {
    for (const { value: accent } of ACCENTS) {
      it(`${appearance} + ${accent} keeps text readable (WCAG AA)`, () => {
        const { colors } = buildTheme(appearance, accent);
        expect(contrast(colors.ink, colors.surface)).toBeGreaterThanOrEqual(7);
        expect(contrast(colors.onSurface, colors.background)).toBeGreaterThanOrEqual(7);
        expect(contrast(colors.onSurfaceVariant, colors.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors.primary, colors.surface)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors.onPrimary, colors.primary)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors.onPrimaryContainer, colors.primaryContainer)).toBeGreaterThanOrEqual(4.5);
        expect(contrast(colors.onFlameContainer, colors.flameContainer)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }

  it('Auto follows the system setting', () => {
    expect(resolveAppearance('auto', 'dark')).toBe('night');
    expect(resolveAppearance('auto', 'light')).toBe('paper');
    expect(resolveAppearance('auto', null)).toBe('paper');
    expect(resolveAppearance('palm', 'dark')).toBe('palm');
  });
});

describe('reading fonts', () => {
  it('Classic uses the serif faces for reading', () => {
    const { type } = buildTheme('paper', 'indigo', 'classic');
    expect(type.kural(24)).toMatchObject({ fontFamily: 'NotoSerifTamil_600SemiBold', fontSize: 24 });
    expect(type.translation.fontFamily).toBe('Lora_400Regular_Italic');
  });

  it('Modern uses the sans faces', () => {
    const { type } = buildTheme('paper', 'indigo', 'modern');
    expect(type.kural(24).fontFamily).toBe('NotoSansTamil_600SemiBold');
    expect(type.englishBody.fontFamily).toBe('Inter_400Regular');
  });

  it('Device uses the system font with real weights, everywhere', () => {
    const theme = buildTheme('paper', 'indigo', 'device');
    const styles = [theme.type.kural(24), theme.type.tamilBody, theme.type.translation, theme.type.display(30), theme.type.ui];
    for (const style of styles) expect(style.fontFamily).toBeUndefined();
    expect(theme.type.kural(24).fontWeight).toBe('700');
    expect(theme.type.translation.fontStyle).toBe('italic');
    expect(theme.fonts.bodyMedium.fontFamily).not.toMatch(/Inter|Lora|Noto/);
  });

  it('bundled fonts never pair a family with a bold weight', () => {
    for (const font of ['classic', 'modern'] as const) {
      const { type, fonts } = buildTheme('paper', 'indigo', font);
      expect(type.kural(24).fontWeight).toBeUndefined();
      expect(fonts.headlineMedium.fontWeight).toBe('400');
    }
  });
});

describe('accent', () => {
  it('colours the selected states Paper draws with secondary/tertiary (segments, chips, tonal buttons)', () => {
    for (const appearance of appearances) {
      const seen = new Set(ACCENTS.map(({ value }) => buildTheme(appearance, value).colors.secondaryContainer));
      expect(seen.size).toBe(ACCENTS.length);
      const tertiary = new Set(ACCENTS.map(({ value }) => buildTheme(appearance, value).colors.tertiary));
      expect(tertiary.size).toBe(ACCENTS.length);
    }
  });

  it('keeps selected-state text readable', () => {
    for (const appearance of appearances) {
      for (const { value } of ACCENTS) {
        const { colors } = buildTheme(appearance, value);
        expect(contrast(colors.onSecondaryContainer, colors.secondaryContainer)).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
});

describe('reading sizes', () => {
  const steps = [20, 24, 28, 32].map(readingSizes);

  it('grows every reading size with each text-size step', () => {
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].verseMin).toBeGreaterThan(steps[i - 1].verseMin);
      expect(steps[i].meaning).toBeGreaterThanOrEqual(steps[i - 1].meaning);
      expect(steps[i].translation).toBeGreaterThanOrEqual(steps[i - 1].translation);
    }
    expect(steps[3].meaning).toBeGreaterThan(steps[0].meaning);
  });

  it('keeps the couplet clearly larger than the meaning, even when shrunk to fit', () => {
    for (const s of steps) expect(s.verseMin).toBeGreaterThan(s.meaning);
  });
});
