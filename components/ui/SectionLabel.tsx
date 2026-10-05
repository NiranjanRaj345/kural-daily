import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme, space } from '../../theme';

export const SectionLabel: React.FC<{ children: React.ReactNode; style?: object }> = ({ children, style }) => {
  const theme = useAppTheme();
  return (
    <Text variant="labelMedium" style={[styles.label, { color: theme.colors.onSurfaceVariant }, style]}>
      {children}
    </Text>
  );
};

const styles = StyleSheet.create({
  label: {
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    paddingHorizontal: space.xl,
    paddingTop: space.xl,
    paddingBottom: space.sm,
  },
});
