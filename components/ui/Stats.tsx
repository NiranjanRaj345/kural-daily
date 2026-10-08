import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme, useType, space } from '../../theme';

interface StatsProps {
  items: { value: string | number; label: string }[];
}

/** A row of figures with their labels, set as plain text (no boxes or icons). */
export const Stats: React.FC<StatsProps> = ({ items }) => {
  const theme = useAppTheme();
  const type = useType();
  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.item} accessible accessibilityLabel={`${item.label}: ${item.value}`}>
          <Text style={[type.display(22), styles.value, { color: theme.colors.onSurface }]}>{item.value}</Text>
          <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>
            {item.label}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: space.lg,
  },
  item: {
    flex: 1,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
});
