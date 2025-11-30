import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useTheme } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const theme = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: Platform.select({
          ios: {
            position: 'absolute',
          },
          default: {},
        }),
        tabBarActiveTintColor: theme.colors.primary,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Daily',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "calendar-today" : "calendar-blank-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="browse"
        options={{
          title: 'Browse',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "book-open-page-variant" : "book-open-page-variant-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "magnify" : "magnify"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="quiz"
        options={{
          title: 'Quiz',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "brain" : "brain"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          title: 'Favorites',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "heart" : "heart-outline"} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => <MaterialCommunityIcons size={28} name={focused ? "account" : "account-outline"} color={color} />,
        }}
      />
    </Tabs>
  );
}
