import { MD3DarkTheme, MD3LightTheme, configureFonts, useTheme } from 'react-native-paper';
import type { MD3Theme } from 'react-native-paper';

// Brand palette, taken from the app icon: deep "ink" blue with saffron palm leaves.

export type ThemeMode = 'system' | 'light' | 'dark' | 'sepia';
export type ResolvedThemeName = 'light' | 'dark' | 'sepia';

// Each Inter weight is its own font file, so the weight comes from fontFamily.
// Pairing these families with a bold fontWeight makes iOS (and some Android
// versions) fall back to the system font, so fontWeight stays at 400.
const fontConfig = {
  displayLarge: { fontFamily: 'Inter_700Bold', fontWeight: '400' as const },
  displayMedium: { fontFamily: 'Inter_700Bold', fontWeight: '400' as const },
  displaySmall: { fontFamily: 'Inter_700Bold', fontWeight: '400' as const },
  headlineLarge: { fontFamily: 'Inter_700Bold', fontWeight: '400' as const },
  headlineMedium: { fontFamily: 'Inter_700Bold', fontWeight: '400' as const },
  headlineSmall: { fontFamily: 'Inter_600SemiBold', fontWeight: '400' as const },
  titleLarge: { fontFamily: 'Inter_600SemiBold', fontWeight: '400' as const },
  titleMedium: { fontFamily: 'Inter_600SemiBold', fontWeight: '400' as const },
  titleSmall: { fontFamily: 'Inter_600SemiBold', fontWeight: '400' as const },
  labelLarge: { fontFamily: 'Inter_500Medium', fontWeight: '400' as const },
  labelMedium: { fontFamily: 'Inter_500Medium', fontWeight: '400' as const },
  labelSmall: { fontFamily: 'Inter_500Medium', fontWeight: '400' as const },
  bodyLarge: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
  bodyMedium: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
  bodySmall: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
  default: { fontFamily: 'Inter_400Regular', fontWeight: '400' as const },
};

const fonts = configureFonts({ config: fontConfig });

/** Colours Paper doesn't define, used for the brand accent and status states. */
export interface ExtraColors {
  accent: string;
  onAccent: string;
  accentContainer: string;
  onAccentContainer: string;
  success: string;
  successContainer: string;
  onSuccessContainer: string;
  heroStart: string;
  heroEnd: string;
  onHero: string;
  onHeroMuted: string;
}

export type AppTheme = MD3Theme & { colors: MD3Theme['colors'] & ExtraColors; name: ResolvedThemeName };

const elevation = (l1: string, l2: string, l3: string, l4: string, l5: string) => ({
  level0: 'transparent', level1: l1, level2: l2, level3: l3, level4: l4, level5: l5,
});

export const lightTheme: AppTheme = {
  ...MD3LightTheme,
  name: 'light',
  fonts,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#1E4FA3',
    onPrimary: '#FFFFFF',
    primaryContainer: '#DCE6FA',
    onPrimaryContainer: '#0B2559',
    secondary: '#5B6477',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#E3E8F2',
    onSecondaryContainer: '#1A2233',
    tertiary: '#9A5B00',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#FFE3B8',
    onTertiaryContainer: '#3D2400',
    background: '#F6F7FB',
    onBackground: '#191C22',
    surface: '#FFFFFF',
    onSurface: '#191C22',
    surfaceVariant: '#EEF1F7',
    onSurfaceVariant: '#565D6D',
    outline: '#8C93A3',
    outlineVariant: '#E1E5EE',
    inverseSurface: '#2D3038',
    inverseOnSurface: '#F0F1F6',
    inversePrimary: '#A9C3FF',
    elevation: elevation('#FFFFFF', '#F7F9FD', '#F1F4FA', '#EEF2F9', '#EBEFF8'),
    accent: '#E8A33D',
    onAccent: '#3D2400',
    accentContainer: '#FFF1DB',
    onAccentContainer: '#6B3F00',
    success: '#1E7A4A',
    successContainer: '#DDF3E6',
    onSuccessContainer: '#0B3B22',
    heroStart: '#1E4FA3',
    heroEnd: '#14306B',
    onHero: '#FFFFFF',
    onHeroMuted: 'rgba(255,255,255,0.72)',
  },
};

export const darkTheme: AppTheme = {
  ...MD3DarkTheme,
  name: 'dark',
  fonts,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#A9C3FF',
    onPrimary: '#0A2A66',
    primaryContainer: '#1F3D7A',
    onPrimaryContainer: '#DCE6FA',
    secondary: '#BBC3D6',
    onSecondary: '#252D3D',
    secondaryContainer: '#2C3446',
    onSecondaryContainer: '#DCE2F0',
    tertiary: '#FFC46B',
    onTertiary: '#3D2400',
    tertiaryContainer: '#5A3A00',
    onTertiaryContainer: '#FFE3B8',
    background: '#0E1117',
    onBackground: '#E3E6ED',
    surface: '#151922',
    onSurface: '#E3E6ED',
    surfaceVariant: '#222835',
    onSurfaceVariant: '#A7AEBD',
    outline: '#6B7385',
    outlineVariant: '#2B3140',
    inverseSurface: '#E3E6ED',
    inverseOnSurface: '#2D3038',
    inversePrimary: '#1E4FA3',
    error: '#FFB4AB',
    onError: '#690005',
    errorContainer: '#4A1F1D',
    onErrorContainer: '#FFDAD6',
    elevation: elevation('#181D27', '#1C212C', '#202633', '#222836', '#252C3A'),
    accent: '#FFC46B',
    onAccent: '#3D2400',
    accentContainer: '#3A2A12',
    onAccentContainer: '#FFD89C',
    success: '#7FD6A5',
    successContainer: '#14382A',
    onSuccessContainer: '#BDF0D3',
    heroStart: '#1C3570',
    heroEnd: '#101B3A',
    onHero: '#F2F5FF',
    onHeroMuted: 'rgba(242,245,255,0.7)',
  },
};

export const sepiaTheme: AppTheme = {
  ...MD3LightTheme,
  name: 'sepia',
  fonts,
  roundness: 4,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#7A4E2D',
    onPrimary: '#FFFFFF',
    primaryContainer: '#EBD3B8',
    onPrimaryContainer: '#3A2210',
    secondary: '#6E5A47',
    onSecondary: '#FFFFFF',
    secondaryContainer: '#EADBC4',
    onSecondaryContainer: '#2E2216',
    tertiary: '#9A5B00',
    onTertiary: '#FFFFFF',
    tertiaryContainer: '#F3DDB5',
    onTertiaryContainer: '#3D2400',
    background: '#F4ECD8',
    onBackground: '#3E2F22',
    surface: '#FBF5E6',
    onSurface: '#3E2F22',
    surfaceVariant: '#EADFC8',
    onSurfaceVariant: '#6E5A47',
    outline: '#A8937A',
    outlineVariant: '#E0D2B8',
    inverseSurface: '#3E2F22',
    inverseOnSurface: '#FBF5E6',
    inversePrimary: '#E5C3A0',
    elevation: elevation('#FBF5E6', '#F8F0DE', '#F5ECD8', '#F3E9D3', '#F1E6CF'),
    accent: '#C77C1E',
    onAccent: '#FFFFFF',
    accentContainer: '#F6E2C0',
    onAccentContainer: '#5C3500',
    success: '#3F6B2F',
    successContainer: '#E1EBCF',
    onSuccessContainer: '#1F3515',
    heroStart: '#7A4E2D',
    heroEnd: '#553521',
    onHero: '#FFF8EC',
    onHeroMuted: 'rgba(255,248,236,0.75)',
  },
};

export const THEMES: Record<ResolvedThemeName, AppTheme> = {
  light: lightTheme,
  dark: darkTheme,
  sepia: sepiaTheme,
};

export const resolveTheme = (mode: ThemeMode, systemScheme: 'light' | 'dark' | null | undefined): AppTheme => {
  if (mode === 'system') return systemScheme === 'dark' ? darkTheme : lightTheme;
  return THEMES[mode];
};

export const useAppTheme = () => useTheme<AppTheme>();

/** 4pt spacing scale and shared radii. */
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 } as const;

/** Tamil text styles. Noto Sans Tamil needs generous line height for its tall vowel signs. */
export const tamilText = {
  kural: (size: number) => ({
    fontFamily: 'NotoSansTamil_700Bold',
    fontSize: size,
    lineHeight: Math.round(size * 1.6),
  }),
  body: { fontFamily: 'NotoSansTamil_400Regular', fontSize: 15, lineHeight: 26 },
  label: { fontFamily: 'NotoSansTamil_400Regular', fontSize: 13, lineHeight: 20 },
  title: { fontFamily: 'NotoSansTamil_700Bold', fontSize: 16, lineHeight: 26 },
} as const;
