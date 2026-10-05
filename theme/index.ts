import { MD3DarkTheme, MD3LightTheme, configureFonts, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

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
  { value: 'saffron', label: 'Saffron', tamil: 'காவி', swatch: '#B4651A' },
];

// Each font weight is its own file, so fontWeight stays at 400: pairing these
// families with a bold fontWeight makes iOS and some Android versions fall
// back to the system font.
const w = '400' as const;
const fontConfig = {
  displayLarge: { fontFamily: 'Lora_600SemiBold', fontWeight: w },
  displayMedium: { fontFamily: 'Lora_600SemiBold', fontWeight: w },
  displaySmall: { fontFamily: 'Lora_600SemiBold', fontWeight: w },
  headlineLarge: { fontFamily: 'Lora_600SemiBold', fontWeight: w },
  headlineMedium: { fontFamily: 'Lora_600SemiBold', fontWeight: w },
  headlineSmall: { fontFamily: 'Lora_600SemiBold', fontWeight: w },
  titleLarge: { fontFamily: 'Inter_600SemiBold', fontWeight: w },
  titleMedium: { fontFamily: 'Inter_600SemiBold', fontWeight: w },
  titleSmall: { fontFamily: 'Inter_600SemiBold', fontWeight: w },
  labelLarge: { fontFamily: 'Inter_500Medium', fontWeight: w },
  labelMedium: { fontFamily: 'Inter_500Medium', fontWeight: w },
  labelSmall: { fontFamily: 'Inter_500Medium', fontWeight: w },
  bodyLarge: { fontFamily: 'Inter_400Regular', fontWeight: w },
  bodyMedium: { fontFamily: 'Inter_400Regular', fontWeight: w },
  bodySmall: { fontFamily: 'Inter_400Regular', fontWeight: w },
  default: { fontFamily: 'Inter_400Regular', fontWeight: w },
};
const fonts = configureFonts({ config: fontConfig });

/** Colours Paper doesn't define. */
export interface ExtraColors {
  /** Saffron used for streaks and highlights, independent of the chosen accent. */
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

export const buildTheme = (appearance: ResolvedAppearance, accent: Accent): AppTheme => {
  const base = BASES[appearance];
  const a = ACCENT_PALETTES[accent][base.dark ? 'dark' : 'light'];
  const md3 = base.dark ? MD3DarkTheme : MD3LightTheme;

  return {
    ...md3,
    fonts,
    roundness: 4,
    appearance,
    accent,
    colors: {
      ...md3.colors,
      ...a,
      secondary: base.onSurfaceVariant,
      onSecondary: base.dark ? '#121110' : '#FFFFFF',
      secondaryContainer: base.surfaceVariant,
      onSecondaryContainer: base.onSurface,
      tertiary: base.dark ? '#F5BC6C' : '#9A5400',
      onTertiary: base.dark ? '#4A2800' : '#FFFFFF',
      tertiaryContainer: base.dark ? '#4A3214' : '#FBE6C6',
      onTertiaryContainer: base.dark ? '#FCE2BD' : '#4A2800',
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
      flame: base.dark ? '#F5BC6C' : '#B4651A',
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

/** 4pt spacing scale and shared radii. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, pill: 999 } as const;

/** Reading typography. Tamil needs generous line height for its tall vowel signs. */
export const tamilText = {
  /** The couplet itself, set like a printed verse. */
  kural: (size: number) => ({
    fontFamily: 'NotoSerifTamil_600SemiBold',
    fontSize: size,
    lineHeight: Math.round(size * 1.7),
  }),
  /** Tamil prose such as the explanation. */
  body: { fontFamily: 'NotoSerifTamil_400Regular', fontSize: 16, lineHeight: 29 },
  /** Small Tamil interface labels. */
  label: { fontFamily: 'NotoSansTamil_400Regular', fontSize: 13, lineHeight: 20 },
  labelStrong: { fontFamily: 'NotoSansTamil_600SemiBold', fontSize: 13, lineHeight: 20 },
  /** Tamil headings and list titles. */
  title: { fontFamily: 'NotoSansTamil_600SemiBold', fontSize: 16, lineHeight: 26 },
  /** List previews of a couplet. */
  preview: { fontFamily: 'NotoSerifTamil_500Medium', fontSize: 16, lineHeight: 27 },
} as const;

export const englishText = {
  translation: { fontFamily: 'Lora_400Regular_Italic', fontSize: 17, lineHeight: 27 },
  body: { fontFamily: 'Lora_400Regular', fontSize: 16, lineHeight: 27 },
} as const;
