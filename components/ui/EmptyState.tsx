import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAppTheme, space } from '../../theme';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, message, actionLabel, onAction }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.container}>
      <View style={[styles.iconWrap, { backgroundColor: theme.colors.primaryContainer }]}>
        <MaterialCommunityIcons name={icon} size={36} color={theme.colors.onPrimaryContainer} />
      </View>
      <Text variant="titleMedium" style={[styles.title, { color: theme.colors.onSurface }]}>{title}</Text>
      <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>{message}</Text>
      {actionLabel && onAction && (
        <Button mode="contained-tonal" onPress={onAction} style={styles.action}>
          {actionLabel}
        </Button>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingHorizontal: space.xxxl,
    paddingVertical: 56,
  },
  iconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: space.lg,
  },
  title: {
    textAlign: 'center',
    marginBottom: space.xs,
  },
  message: {
    textAlign: 'center',
    lineHeight: 21,
  },
  action: {
    marginTop: space.lg,
  },
});
