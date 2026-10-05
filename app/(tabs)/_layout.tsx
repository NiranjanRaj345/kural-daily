import { Tabs } from 'expo-router';
import React from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import { useAppTheme } from '../../theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

const tabIcon = (active: IconName, inactive: IconName) => {
  const TabIcon = ({ color, focused }: { color: string; focused: boolean }) => (
    <MaterialCommunityIcons size={24} name={focused ? active : inactive} color={color} />
  );
  return TabIcon;
};

export default function TabLayout() {
  const theme = useAppTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outlineVariant,
        },
        tabBarLabelStyle: { fontFamily: 'Inter_500Medium', fontSize: 11 },
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
      <Tabs.Screen name="search" options={{ title: 'Search', tabBarIcon: tabIcon('magnify', 'magnify') }} />
      <Tabs.Screen name="quiz" options={{ title: 'Quiz', tabBarIcon: tabIcon('lightbulb-on', 'lightbulb-on-outline') }} />
      <Tabs.Screen name="favorites" options={{ title: 'Saved', tabBarIcon: tabIcon('bookmark', 'bookmark-outline') }} />
      <Tabs.Screen name="profile" options={{ title: 'You', tabBarIcon: tabIcon('account-circle', 'account-circle-outline') }} />
    </Tabs>
  );
}
