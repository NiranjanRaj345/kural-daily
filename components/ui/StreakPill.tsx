import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { lastNDays, toLocalDateKey } from '../../utils/date';
import { useAppTheme, space, radius } from '../../theme';

interface StreakPillProps {
  readDays: string[];
  streak: number;
  onPress?: () => void;
}

/**
 * One compact line for the Today screen: the streak and a dot for each of the
 * last seven days. The full calendar is on the You tab.
 */
export const StreakPill: React.FC<StreakPillProps> = ({ readDays, streak, onPress }) => {
  const theme = useAppTheme();
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const days = lastNDays(today, 7);
  const read = new Set(readDays);
  const weekCount = days.filter((d) => read.has(d)).length;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${streak} day streak. Read on ${weekCount} of the last 7 days. Opens your reading calendar.`}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <MaterialCommunityIcons name="fire" size={18} color={streak > 0 ? theme.colors.flame : theme.colors.outline} />
      <Text variant="labelLarge" style={[styles.label, { color: theme.colors.onSurface }]} numberOfLines={1}>
        {streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
      </Text>
      <View style={styles.dots}>
        {days.map((key) => {
          const done = read.has(key);
          return (
            <View
              key={key}
              style={[
                styles.dot,
                {
                  backgroundColor: done ? theme.colors.flame : 'transparent',
                  borderColor: done ? theme.colors.flame : key === todayKey ? theme.colors.primary : theme.colors.outline,
                },
              ]}
            />
          );
        })}
      </View>
      <MaterialCommunityIcons name="chevron-right" size={18} color={theme.colors.onSurfaceVariant} />
    </Pressable>
  );
};

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginHorizontal: space.lg,
    paddingLeft: space.md,
    paddingRight: space.sm,
    paddingVertical: space.sm,
    borderRadius: radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
    flex: 1,
  },
  dots: {
    flexDirection: 'row',
    gap: 4,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 1,
  },
});
