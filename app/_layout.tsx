import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme as NavigationDarkTheme, DefaultTheme as NavigationDefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts, NotoSansTamil_400Regular, NotoSansTamil_700Bold } from '@expo-google-fonts/noto-sans-tamil';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { PaperProvider, MD3DarkTheme, MD3LightTheme, adaptNavigationTheme, configureFonts } from 'react-native-paper';
import { useColorScheme } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { registerForPushNotificationsAsync, scheduleDailyNotification } from '../services/NotificationService';

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

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  useEffect(() => {
    const setupNotifications = async () => {
      const hasPermission = await registerForPushNotificationsAsync();
      if (hasPermission) {
        // Ensure daily notification is scheduled if enabled
        // We could check store here, but scheduling is idempotent-ish (cancels old ones)
        // For now, let's just ensure the channel/perms are ready.
        // Ideally, we check the store state.
        const state = useSettingsStore.getState();
        if (state.notificationsEnabled) {
          await scheduleDailyNotification();
        }
      }
    };

    setupNotifications();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();
  const { themeMode } = useSettingsStore();

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
