import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { lastNDays, toLocalDateKey } from '../../utils/date';
import { useAppTheme, space, radius } from '../../theme';

interface StreakStripProps {
  readDays: string[];
  streak: number;
  bestStreak: number;
}

/** The last seven days, each marked when the user read, with the current streak. */
export const StreakStrip: React.FC<StreakStripProps> = ({ readDays, streak, bestStreak }) => {
  const theme = useAppTheme();
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const days = lastNDays(today, 7);
  const read = new Set(readDays);

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
      accessible
      accessibilityLabel={`${streak} day streak. Read on ${days.filter((d) => read.has(d)).length} of the last 7 days.`}
    >
      <View style={styles.summary}>
        <MaterialCommunityIcons name="fire" size={22} color={streak > 0 ? theme.colors.flame : theme.colors.outline} />
        <View style={{ flex: 1 }}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {streak > 0 ? `${streak}-day streak` : 'Start a streak today'}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {bestStreak > 1 ? `Best: ${bestStreak} days` : 'Read every day to keep it going'}
          </Text>
        </View>
      </View>
      <View style={styles.days}>
        {days.map((key) => {
          const [y, m, d] = key.split('-').map(Number);
          const date = new Date(y, m - 1, d);
          const done = read.has(key);
          const isToday = key === todayKey;
          return (
            <View key={key} style={styles.day}>
              <Text variant="labelSmall" style={{ color: isToday ? theme.colors.primary : theme.colors.onSurfaceVariant }}>
                {date.toLocaleDateString(undefined, { weekday: 'narrow' })}
              </Text>
              <View
                style={[
                  styles.dayDot,
                  {
                    backgroundColor: done ? theme.colors.flame : 'transparent',
                    borderColor: done ? theme.colors.flame : isToday ? theme.colors.primary : theme.colors.outlineVariant,
                  },
                ]}
              >
                {done && <MaterialCommunityIcons name="check" size={14} color={theme.colors.surface} />}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: space.lg,
    padding: space.lg,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: space.md,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  days: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    alignItems: 'center',
    gap: 6,
  },
  dayDot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
