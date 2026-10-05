import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, NotoSansTamil_400Regular, NotoSansTamil_700Bold } from '@expo-google-fonts/noto-sans-tamil';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack, useRouter } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import { PaperProvider, MD3DarkTheme, MD3LightTheme, adaptNavigationTheme } from 'react-native-paper';
import { AppState, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { useSettingsStore } from '../store/useSettingsStore';
import { syncDailyReminders } from '../services/NotificationService';

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
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    NotoSansTamil_400Regular,
    NotoSansTamil_700Bold,
    Inter_400Regular,
    Inter_700Bold,
    ...FontAwesome.font,
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
    // Re-syncing on every foreground keeps the next two weeks of reminders scheduled.
    syncDailyReminders();
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') syncDailyReminders();
    });
    return () => sub.remove();
  }, [hydrated]);

  if (!ready) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const router = useRouter();
  const { themeMode } = useSettingsStore();

  // Tapping a daily reminder opens today's Kural
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const sub = Notifications.addNotificationResponseReceivedListener(() => {
      router.navigate('/');
    });
    return () => sub.remove();
  }, [router]);

  const { LightTheme, DarkTheme } = adaptNavigationTheme({
    reactNavigationLight: NavigationDefaultTheme,
    reactNavigationDark: NavigationDarkTheme,
  });

  const SepiaTheme = {
    ...MD3LightTheme,
    colors: {
      ...MD3LightTheme.colors,
      background: '#f4ecd8',
      surface: '#fdf6e3',
      surfaceVariant: '#eaddcf',
      onSurface: '#5b4636',
      primary: '#8c6b5d',
      secondary: '#5b4636',
      elevation: {
        level0: 'transparent',
        level1: '#fdf6e3',
        level2: '#f8f0dc',
        level3: '#f4ecd8',
        level4: '#f0e8d4',
        level5: '#ece4d0',
      },
    },
  };

  let paperTheme = MD3LightTheme;
  let navTheme = LightTheme;

  if (themeMode === 'dark') {
    paperTheme = MD3DarkTheme;
    navTheme = DarkTheme;
  } else if (themeMode === 'sepia') {
    paperTheme = SepiaTheme;
    // For navigation, we can reuse LightTheme but maybe tweak background if possible,
    // but standard LightTheme is usually fine for navigation headers in Sepia.
    navTheme = {
      ...LightTheme,
      colors: {
        ...LightTheme.colors,
        background: '#f4ecd8',
        card: '#fdf6e3',
        text: '#5b4636',
      }
    };
  }

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </ThemeProvider>
    </PaperProvider>
  );
}
