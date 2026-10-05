import { ACCENTS, buildTheme, resolveAppearance, ResolvedAppearance } from '../theme';

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
