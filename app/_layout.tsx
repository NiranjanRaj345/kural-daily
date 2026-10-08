import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { NotoSansTamil_400Regular, NotoSansTamil_500Medium, NotoSansTamil_600SemiBold, NotoSansTamil_700Bold } from '@expo-google-fonts/noto-sans-tamil';
import { NotoSerifTamil_400Regular, NotoSerifTamil_500Medium, NotoSerifTamil_600SemiBold, NotoSerifTamil_700Bold } from '@expo-google-fonts/noto-serif-tamil';
import { Lora_400Regular, Lora_400Regular_Italic, Lora_600SemiBold } from '@expo-google-fonts/lora';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useMemo, useState } from 'react';
import 'react-native-reanimated';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { AppState, Platform, StyleSheet, View, useColorScheme } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as SystemUI from 'expo-system-ui';
import { useSettingsStore } from '../store/useSettingsStore';
import { buildTheme, resolveAppearance } from '../theme';
import { en, registerTranslation } from 'react-native-paper-dates';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { reminderInputsKey, syncDailyReminders } from '../services/NotificationService';

const useStoreHydrated = () => {
  const [hydrated, setHydrated] = useState(useSettingsStore.persist.hasHydrated());
  useEffect(() => {
    const unsub = useSettingsStore.persist.onFinishHydration(() => setHydrated(true));
    setHydrated(useSettingsStore.persist.hasHydrated());
    return unsub;
  }, []);
  return hydrated;
};

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// Labels for the reminder time picker
registerTranslation('en', en);

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansTamil_400Regular,
    NotoSansTamil_500Medium,
    NotoSansTamil_600SemiBold,
    NotoSansTamil_700Bold,
    NotoSerifTamil_400Regular,
    NotoSerifTamil_500Medium,
    NotoSerifTamil_600SemiBold,
    NotoSerifTamil_700Bold,
    Lora_400Regular,
    Lora_400Regular_Italic,
    Lora_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // Saved settings load asynchronously; wait for them so the streak, theme and
  // favorites aren't computed from defaults and then overwritten.
  const hydrated = useStoreHydrated();
  const ready = loaded && hydrated;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync();
    }
  }, [ready]);

  useEffect(() => {
    if (!hydrated) return;
    // Never prompts here; permission is only requested when the user opts in.
    // Re-syncing on every foreground keeps the reminder window topped up.
    syncDailyReminders();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncDailyReminders();
    });

    // Re-plan when reading or reminder settings change: reading today drops
    // today's reminder and moves the streak nudge to tomorrow.
    let timer: ReturnType<typeof setTimeout> | null = null;
    const unsubscribe = useSettingsStore.subscribe((next, prev) => {
      if (reminderInputsKey(next) === reminderInputsKey(prev)) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => syncDailyReminders(), 400);
    });

    return () => {
      sub.remove();
      unsubscribe();
      if (timer) clearTimeout(timer);
    };
  }, [hydrated]);

  if (!ready) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const appearance = useSettingsStore((state) => state.appearance);
  const accent = useSettingsStore((state) => state.accent);
  const readingFont = useSettingsStore((state) => state.readingFont);
  const boldKural = useSettingsStore((state) => state.boldKural);
  const onboarded = useSettingsStore((state) => state.onboarded);
  const systemScheme = useColorScheme();
  const theme = useMemo(
    () => buildTheme(resolveAppearance(appearance, systemScheme), accent, readingFont, boldKural),
    [appearance, accent, readingFont, boldKural, systemScheme]
  );

  // Tapping a daily reminder opens today's Kural
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate('/');
    });
    return () => sub.remove();
  }, [router]);

  // Window background behind screens and transitions follows the page colour
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme.colors.background]);

  const navTheme = useMemo(() => {
    const base = theme.dark ? NavigationDarkTheme : NavigationDefaultTheme;
    return {
      ...base,
      colors: {
        ...base.colors,
        primary: theme.colors.primary,
        background: theme.colors.background,
        card: theme.colors.surface,
        text: theme.colors.onSurface,
        border: theme.colors.outlineVariant,
        notification: theme.colors.error,
      },
    };
  }, [theme]);

  return (
    <PaperProvider theme={theme}>
      <ThemeProvider value={navTheme}>
        <StatusBar style={theme.dark ? 'light' : 'dark'} />
        <Stack screenOptions={{ contentStyle: { backgroundColor: theme.colors.background } }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
        {/* First launch: the welcome flow covers the app until it's completed */}
        {!onboarded && (
          <View style={StyleSheet.absoluteFill}>
            <WelcomeScreen />
          </View>
        )}
      </ThemeProvider>
    </PaperProvider>
  );
}
