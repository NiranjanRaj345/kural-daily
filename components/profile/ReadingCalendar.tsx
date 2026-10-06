import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, IconButton } from 'react-native-paper';
import { monthGrid, toLocalDateKey } from '../../utils/date';
import { useAppTheme, space } from '../../theme';

interface ReadingCalendarProps {
  readDays: string[];
}

// A fixed Sunday so the weekday initials come out in the phone's language
const WEEKDAYS = Array.from({ length: 7 }, (_, i) =>
  new Date(2026, 0, 4 + i).toLocaleDateString(undefined, { weekday: 'narrow' })
);

/** A month of reading days, with the months since the first reading day one tap away. */
export const ReadingCalendar: React.FC<ReadingCalendarProps> = ({ readDays }) => {
  const theme = useAppTheme();
  const today = new Date();
  const todayKey = toLocalDateKey(today);
  const read = useMemo(() => new Set(readDays), [readDays]);

  // Months are counted back from the current one; the earliest is the first month with a reading day
  const [offset, setOffset] = useState(0);
  const earliest = readDays.length > 0 ? [...readDays].sort()[0] : todayKey;
  const [ey, em] = earliest.split('-').map(Number);
  const maxOffset = Math.max(0, (today.getFullYear() - ey) * 12 + today.getMonth() - (em - 1));

  const shown = new Date(today.getFullYear(), today.getMonth() - offset, 1);
  const weeks = monthGrid(shown.getFullYear(), shown.getMonth());
  const monthPrefix = toLocalDateKey(shown).slice(0, 7);
  const readThisMonth = readDays.filter((d) => d.startsWith(monthPrefix)).length;

  return (
    <View>
      <View style={styles.header}>
        <IconButton
          icon="chevron-left"
          size={20}
          disabled={offset >= maxOffset}
          onPress={() => setOffset(offset + 1)}
          accessibilityLabel="Previous month"
        />
        <View style={styles.title}>
          <Text variant="titleSmall" style={{ color: theme.colors.onSurface }}>
            {shown.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
          </Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>
            {readThisMonth === 0 ? 'No reading days yet' : `Read on ${readThisMonth} ${readThisMonth === 1 ? 'day' : 'days'}`}
          </Text>
        </View>
        <IconButton
          icon="chevron-right"
          size={20}
          disabled={offset === 0}
          onPress={() => setOffset(offset - 1)}
          accessibilityLabel="Next month"
        />
      </View>

      <View style={styles.row}>
        {WEEKDAYS.map((d, i) => (
          <Text key={i} variant="labelSmall" style={[styles.cell, styles.weekday, { color: theme.colors.onSurfaceVariant }]}>
            {d}
          </Text>
        ))}
      </View>
      {weeks.map((week, w) => (
        <View key={w} style={styles.row}>
          {week.map((key, i) => {
            if (!key) return <View key={i} style={styles.cell} />;
            const done = read.has(key);
            const isToday = key === todayKey;
            const future = key > todayKey;
            return (
              <View key={key} style={styles.cell} accessible accessibilityLabel={`${key}${done ? ', read' : ''}`}>
                <View
                  style={[
                    styles.day,
                    done && { backgroundColor: theme.colors.flame },
                    isToday && !done && { borderWidth: 1.5, borderColor: theme.colors.primary },
                  ]}
                >
                  <Text
                    variant="labelMedium"
                    style={{
                      color: done ? theme.colors.surface : future ? theme.colors.outline : theme.colors.onSurface,
                    }}
                  >
                    {Number(key.slice(8))}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  title: {
    flex: 1,
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 2,
  },
  weekday: {
    textAlign: 'center',
    marginBottom: space.xs,
  },
  day: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
