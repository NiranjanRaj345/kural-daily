import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme, space, radius } from '../../theme';

interface StatTileProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  value: string | number;
  label: string;
  iconColor?: string;
}

export const StatTile: React.FC<StatTileProps> = ({ icon, value, label, iconColor }) => {
  const theme = useAppTheme();
  return (
    <View
      style={[styles.tile, { backgroundColor: theme.colors.surface, borderColor: theme.colors.outlineVariant }]}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <MaterialCommunityIcons name={icon} size={20} color={iconColor ?? theme.colors.primary} />
      <Text variant="headlineSmall" style={[styles.value, { color: theme.colors.onSurface }]}>{value}</Text>
      <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }} numberOfLines={1}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  tile: {
    flex: 1,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  value: {
    marginTop: space.xs,
    fontVariant: ['tabular-nums'],
  },
});
