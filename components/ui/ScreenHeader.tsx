import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme, space } from '../../theme';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  /** Small label above the title, e.g. a section name. */
  eyebrow?: string;
}

export const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle, right, eyebrow }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={styles.text}>
        {eyebrow && (
          <Text variant="labelMedium" style={[styles.eyebrow, { color: theme.colors.primary }]}>
            {eyebrow}
          </Text>
        )}
        <Text variant="headlineMedium" accessibilityRole="header" style={{ color: theme.colors.onBackground }}>
          {title}
        </Text>
        {subtitle && (
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 2 }}>
            {subtitle}
          </Text>
        )}
      </View>
      {right}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space.xl,
    paddingTop: space.lg,
    paddingBottom: space.md,
    gap: space.md,
  },
  text: {
    flex: 1,
  },
  eyebrow: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 2,
  },
});
