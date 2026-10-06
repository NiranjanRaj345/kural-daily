import { MD3DarkTheme, MD3LightTheme, configureFonts, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';
import type { TextStyle } from 'react-native';

/*
 * Visual identity: a page of a book, not a dashboard.
 *  - Three paper "bases": Paper (warm white), Palm leaf (ஓலைச்சுவடி tones), Night (warm ink-black).
 *  - Four accents chosen from Tamil visual tradition; Indigo matches the app icon.
 *  - Serif type for the text being read (Noto Serif Tamil for couplets, Lora for English),
 *    a sans (Inter / Noto Sans Tamil) for interface chrome.
 */

export type Appearance = 'auto' | 'paper' | 'palm' | 'night';
export type ResolvedAppearance = Exclude<Appearance, 'auto'>;
export type Accent = 'indigo' | 'maroon' | 'green' | 'saffron';

export const APPEARANCES: { value: Appearance; label: string; tamil: string }[] = [
  { value: 'auto', label: 'Auto', tamil: 'தானியங்கி' },
  { value: 'paper', label: 'Paper', tamil: 'தாள்' },
  { value: 'palm', label: 'Palm leaf', tamil: 'ஓலை' },
  { value: 'night', label: 'Night', tamil: 'இரவு' },
];

export const ACCENTS: { value: Accent; label: string; tamil: string; swatch: string }[] = [
  { value: 'indigo', label: 'Indigo', tamil: 'அவுரி', swatch: '#1F4E9E' },
  { value: 'maroon', label: 'Kumkum', tamil: 'குங்குமம்', swatch: '#8E2B2B' },
  { value: 'green', label: 'Leaf', tamil: 'இலை', swatch: '#2F6B3A' },
  { value: 'saffron', label: 'Saffron', tamil: 'காவி', swatch: '#9A5400' },
];

export type ReadingFont = 'classic' | 'modern' | 'device';

export const READING_FONTS: { value: ReadingFont; label: string; detail: string }[] = [
  { value: 'classic', label: 'Classic', detail: 'Book serif' },
  { value: 'modern', label: 'Modern', detail: 'Clean sans' },
  { value: 'device', label: 'Device', detail: "Phone's font" },
];

interface FontFamilies {
  kural: string;
  tamilBody: string;
  tamilPreview: string;
  tamilUi: string;
  tamilUiStrong: string;
  translation: string;
  englishBody: string;
  display: string;
  ui: string;
  uiMedium: string;
  uiStrong: string;
}

const FAMILIES: Record<Exclude<ReadingFont, 'device'>, FontFamilies> = {
  classic: {
    kural: 'NotoSerifTamil_600SemiBold',
    tamilBody: 'NotoSerifTamil_400Regular',
    tamilPreview: 'NotoSerifTamil_500Medium',
    tamilUi: 'NotoSansTamil_400Regular',
    tamilUiStrong: 'NotoSansTamil_600SemiBold',
    translation: 'Lora_400Regular_Italic',
    englishBody: 'Lora_400Regular',
    display: 'Lora_600SemiBold',
    ui: 'Inter_400Regular',
    uiMedium: 'Inter_500Medium',
    uiStrong: 'Inter_600SemiBold',
  },
  modern: {
    kural: 'NotoSansTamil_600SemiBold',
    tamilBody: 'NotoSansTamil_400Regular',
    tamilPreview: 'NotoSansTamil_500Medium',
    tamilUi: 'NotoSansTamil_400Regular',
    tamilUiStrong: 'NotoSansTamil_600SemiBold',
    translation: 'Inter_400Regular',
    englishBody: 'Inter_400Regular',
    display: 'Inter_700Bold',
    ui: 'Inter_400Regular',
    uiMedium: 'Inter_500Medium',
    uiStrong: 'Inter_600SemiBold',
  },
};

type Weight = '400' | '500' | '600' | '700';

/**
 * A font face. Bundled fonts are one file per weight, so the weight comes from
 * fontFamily alone (pairing them with a bold fontWeight makes iOS and some
 * Android versions fall back to the system font). The device font is a real
 * family, so there the weight and style are set directly.
 */
const face = (family: string | undefined, weight: Weight, italic = false): TextStyle =>
  family
    ? { fontFamily: family }
    : { fontWeight: weight, fontStyle: italic ? 'italic' : 'normal' };

const paperFonts = (font: ReadingFont) => {
  if (font === 'device') return MD3LightTheme.fonts;
  const f = FAMILIES[font];
  const w = '400' as const;
  const config = {
    displayLarge: { fontFamily: f.display, fontWeight: w },
    displayMedium: { fontFamily: f.display, fontWeight: w },
    displaySmall: { fontFamily: f.display, fontWeight: w },
    headlineLarge: { fontFamily: f.display, fontWeight: w },
    headlineMedium: { fontFamily: f.display, fontWeight: w },
    headlineSmall: { fontFamily: f.display, fontWeight: w },
    titleLarge: { fontFamily: f.uiStrong, fontWeight: w },
    titleMedium: { fontFamily: f.uiStrong, fontWeight: w },
    titleSmall: { fontFamily: f.uiStrong, fontWeight: w },
    labelLarge: { fontFamily: f.uiMedium, fontWeight: w },
    labelMedium: { fontFamily: f.uiMedium, fontWeight: w },
    labelSmall: { fontFamily: f.uiMedium, fontWeight: w },
    bodyLarge: { fontFamily: f.ui, fontWeight: w },
    bodyMedium: { fontFamily: f.ui, fontWeight: w },
    bodySmall: { fontFamily: f.ui, fontWeight: w },
    default: { fontFamily: f.ui, fontWeight: w },
  };
  return configureFonts({ config });
};

/** Text styles for reading, chosen by the font setting. */
export interface TypeScale {
  /** The couplet itself. */
  kural: (size: number) => TextStyle;
  /** Tamil prose such as the explanation. */
  tamilBody: TextStyle;
  /** Couplet previews in lists. */
  tamilPreview: TextStyle;
  /** Tamil headings and list titles. */
  tamilTitle: TextStyle;
  tamilLabel: TextStyle;
  tamilLabelStrong: TextStyle;
  /** English translation of a couplet. */
  translation: TextStyle;
  /** English explanation. */
  englishBody: TextStyle;
  /** Large numerals and hero titles. */
  display: (size: number) => TextStyle;
  ui: TextStyle;
  uiMedium: TextStyle;
  uiStrong: TextStyle;
}

const buildTypeScale = (font: ReadingFont): TypeScale => {
  const f = font === 'device' ? undefined : FAMILIES[font];
  return {
    // Bold for the device font: Android has no 600 for most system faces and falls back to regular
    kural: (size) => ({ ...face(f?.kural, '700'), fontSize: size, lineHeight: Math.round(size * 1.7) }),
    tamilBody: { ...face(f?.tamilBody, '400'), fontSize: 16, lineHeight: 29 },
    tamilPreview: { ...face(f?.tamilPreview, '500'), fontSize: 16, lineHeight: 27 },
    tamilTitle: { ...face(f?.tamilUiStrong, '600'), fontSize: 16, lineHeight: 26 },
    tamilLabel: { ...face(f?.tamilUi, '400'), fontSize: 13, lineHeight: 20 },
    tamilLabelStrong: { ...face(f?.tamilUiStrong, '600'), fontSize: 13, lineHeight: 20 },
    translation: { ...face(f?.translation, '400', true), fontSize: 17, lineHeight: 27 },
    englishBody: { ...face(f?.englishBody, '400'), fontSize: 16, lineHeight: 27 },
    display: (size) => ({ ...face(f?.display, '600'), fontSize: size, lineHeight: Math.round(size * 1.25) }),
    ui: face(f?.ui, '400'),
    uiMedium: face(f?.uiMedium, '500'),
    uiStrong: face(f?.uiStrong, '600'),
  };
};

/** Colours Paper doesn't define. */
export interface ExtraColors {
  /** Saffron for the streak flame icon only; everything else follows the accent. */
  flame: string;
  flameContainer: string;
  onFlameContainer: string;
  success: string;
  successContainer: string;
  onSuccessContainer: string;
  /** Text colour for the couplet itself. */
  ink: string;
  /** Hairlines and the thin rules used in the manuscript layout. */
  rule: string;
}

export type AppTheme = MD3Theme & {
  colors: MD3Theme['colors'] & ExtraColors;
  appearance: ResolvedAppearance;
  accent: Accent;
  readingFont: ReadingFont;
  type: TypeScale;
};

interface BasePalette {
  dark: boolean;
  background: string;
  surface: string;
  surfaceVariant: string;
  onSurface: string;
  onSurfaceVariant: string;
  outline: string;
  outlineVariant: string;
  ink: string;
  elevation: [string, string, string, string, string];
}

const BASES: Record<ResolvedAppearance, BasePalette> = {
  paper: {
    dark: false,
    background: '#FAF6EE',
    surface: '#FFFDF8',
    surfaceVariant: '#F2ECE0',
    onSurface: '#2A2119',
    onSurfaceVariant: '#6B5E50',
    outline: '#A3968A',
    outlineVariant: '#E8E0D2',
    ink: '#221A12',
    elevation: ['#FFFDF8', '#FBF7EF', '#F7F2E8', '#F5EFE4', '#F3ECE0'],
  },
  palm: {
    dark: false,
    background: '#EEDFBE',
    surface: '#F6EAD0',
    surfaceVariant: '#E6D3AC',
    onSurface: '#3A2916',
    onSurfaceVariant: '#6A5235',
    outline: '#A2865E',
    outlineVariant: '#DAC49B',
    ink: '#33230F',
    elevation: ['#F6EAD0', '#F3E5C8', '#F0E1C1', '#EEDEBC', '#ECDBB7'],
  },
  night: {
    dark: true,
    background: '#121110',
    surface: '#1C1A17',
    surfaceVariant: '#2A2723',
    onSurface: '#EDE6DA',
    onSurfaceVariant: '#B5AB9C',
    outline: '#706759',
    outlineVariant: '#332F29',
    ink: '#F3ECDF',
    elevation: ['#1E1C19', '#23201C', '#27241F', '#292621', '#2C2924'],
  },
};

interface AccentPalette {
  primary: string;
  onPrimary: string;
  primaryContainer: string;
  onPrimaryContainer: string;
}

const ACCENT_PALETTES: Record<Accent, { light: AccentPalette; dark: AccentPalette }> = {
  indigo: {
    light: { primary: '#1F4E9E', onPrimary: '#FFFFFF', primaryContainer: '#DCE5F6', onPrimaryContainer: '#0E2A5C' },
    dark: { primary: '#A8C2F5', onPrimary: '#0E2A5C', primaryContainer: '#25406E', onPrimaryContainer: '#DCE5F6' },
  },
  maroon: {
    light: { primary: '#8E2B2B', onPrimary: '#FFFFFF', primaryContainer: '#F4DCD7', onPrimaryContainer: '#4A1010' },
    dark: { primary: '#F2A79D', onPrimary: '#4A1010', primaryContainer: '#5C2420', onPrimaryContainer: '#F9DCD7' },
  },
  green: {
    light: { primary: '#2F6B3A', onPrimary: '#FFFFFF', primaryContainer: '#DAEAD5', onPrimaryContainer: '#10331A' },
    dark: { primary: '#9ED3A3', onPrimary: '#10331A', primaryContainer: '#25502D', onPrimaryContainer: '#D6EFD6' },
  },
  saffron: {
    light: { primary: '#9A5400', onPrimary: '#FFFFFF', primaryContainer: '#F9E1C0', onPrimaryContainer: '#4A2800' },
    dark: { primary: '#F5BC6C', onPrimary: '#4A2800', primaryContainer: '#64400F', onPrimaryContainer: '#FCE2BD' },
  },
};

export const buildTheme = (appearance: ResolvedAppearance, accent: Accent, readingFont: ReadingFont = 'classic'): AppTheme => {
  const base = BASES[appearance];
  const a = ACCENT_PALETTES[accent][base.dark ? 'dark' : 'light'];
  const md3 = base.dark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...md3,
    fonts: paperFonts(readingFont),
    roundness: 4,
    appearance,
    accent,
    readingFont,
    type: buildTypeScale(readingFont),
    colors: {
      ...md3.colors,
      ...a,
      secondary: base.onSurfaceVariant,
      onSecondary: base.dark ? '#121110' : '#FFFFFF',
      // Paper draws selected segments, chips and tonal buttons with the secondary
      // container, so it follows the accent too
      secondaryContainer: a.primaryContainer,
      onSecondaryContainer: a.onPrimaryContainer,
      tertiary: a.primary,
      onTertiary: a.onPrimary,
      tertiaryContainer: a.primaryContainer,
      onTertiaryContainer: a.onPrimaryContainer,
      background: base.background,
      onBackground: base.onSurface,
      surface: base.surface,
      onSurface: base.onSurface,
      surfaceVariant: base.surfaceVariant,
      onSurfaceVariant: base.onSurfaceVariant,
      surfaceDisabled: base.dark ? 'rgba(237,230,218,0.12)' : 'rgba(42,33,25,0.12)',
      onSurfaceDisabled: base.dark ? 'rgba(237,230,218,0.38)' : 'rgba(42,33,25,0.38)',
      outline: base.outline,
      outlineVariant: base.outlineVariant,
      inverseSurface: base.dark ? '#EDE6DA' : '#2F2820',
      inverseOnSurface: base.dark ? '#2F2820' : '#F6F0E6',
      inversePrimary: ACCENT_PALETTES[accent][base.dark ? 'light' : 'dark'].primary,
      error: base.dark ? '#FFB4AB' : '#B3261E',
      onError: base.dark ? '#690005' : '#FFFFFF',
      errorContainer: base.dark ? '#4A1F1D' : '#F9DEDC',
      onErrorContainer: base.dark ? '#FFDAD6' : '#410E0B',
      backdrop: 'rgba(20,16,12,0.45)',
      elevation: {
        level0: 'transparent',
        level1: base.elevation[0],
        level2: base.elevation[1],
        level3: base.elevation[2],
        level4: base.elevation[3],
        level5: base.elevation[4],
      },
      // The streak flame is saffron; with the Saffron accent it is the accent itself
      flame: accent === 'saffron' ? a.primary : base.dark ? '#F5BC6C' : '#B4651A',
      flameContainer: base.dark ? '#3D2A12' : '#FBE9CF',
      onFlameContainer: base.dark ? '#FCE2BD' : '#5C3300',
      success: base.dark ? '#8FD19A' : '#2E6B3A',
      successContainer: base.dark ? '#1D3A23' : '#DCEEDB',
      onSuccessContainer: base.dark ? '#CDEFD0' : '#10331A',
      ink: base.ink,
      rule: base.outlineVariant,
    },
  };
};

export const resolveAppearance = (
  appearance: Appearance,
  systemScheme: 'light' | 'dark' | null | undefined
): ResolvedAppearance => {
  if (appearance === 'auto') return systemScheme === 'dark' ? 'night' : 'paper';
  return appearance;
};

export const useAppTheme = () => useTheme<AppTheme>();

/**
 * Reading sizes for the text-size setting (the couplet's size; S 20, M 24, L 28,
 * XL 32). The translation and meaning grow with it. The couplet may shrink to
 * keep its two lines, but never below about 70% of the chosen size and never to
 * the meaning's size; with its heavier weight it always leads the card.
 */
export const readingSizes = (fontSize: number) => {
  const k = fontSize / 24;
  const meaning = Math.max(14, Math.round(15 * k));
  return {
    verse: fontSize,
    verseMin: Math.max(meaning + 1, Math.round(fontSize * 0.68)),
    translation: Math.max(14, Math.round(16 * k)),
    meaning,
  };
};

/** 4pt spacing scale and shared radii. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

/** Reading text styles for the current font setting. */
export const useType = () => useAppTheme().type;
