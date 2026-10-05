import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useAppTheme, useType } from '../../theme';
import { useSettingsStore } from '../../store/useSettingsStore';
import { learningSummary } from '../../utils/srs';
import { toLocalDateKey } from '../../utils/date';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabIcon = (active: IconName, inactive: IconName) => {
  const TabIcon = ({ color, focused }: { color: string; focused: boolean }) => (
    <MaterialCommunityIcons size={24} name={focused ? active : inactive} color={color} />
  );
  return TabIcon;
};

export default function TabLayout() {
  const theme = useAppTheme();
  const type = useType();
  const learning = useSettingsStore((s) => s.learning);
  const dueCount = learningSummary(learning, toLocalDateKey(new Date())).due;

  return (
    <Tabs
      // Back from Search returns to the tab it was opened from
      backBehavior="history"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarLabelStyle: { ...type.uiMedium, fontSize: 11 },
        sceneStyle: { backgroundColor: theme.colors.background },
      }}
      screenListeners={{
        tabPress: () => {
          if (Platform.OS !== 'web') Haptics.selectionAsync();
        },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Today', tabBarIcon: tabIcon('white-balance-sunny', 'weather-sunny') }} />
      <Tabs.Screen name="browse" options={{ title: 'Browse', tabBarIcon: tabIcon('book-open-page-variant', 'book-open-page-variant-outline') }} />
      <Tabs.Screen
        name="learn"
        options={{
          title: 'Learn',
          tabBarIcon: tabIcon('school', 'school-outline'),
          tabBarBadge: dueCount > 0 ? dueCount : undefined,
          tabBarBadgeStyle: { backgroundColor: theme.colors.flame, color: theme.colors.surface, fontSize: 10 },
        }}
      />
      <Tabs.Screen name="favorites" options={{ title: 'Saved', tabBarIcon: tabIcon('bookmark', 'bookmark-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: tabIcon('account-circle', 'account-circle-outline') }} />
      {/* Opened from the search buttons on Today and Browse */}
      <Tabs.Screen name="search" options={{ href: null, title: 'Search' }} />
    </Tabs>
  );
}
