import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Milestone } from '../../utils/milestones';
import { useAppTheme, space, radius, tamilText } from '../../theme';

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];

export const MilestoneGrid: React.FC<{ milestones: Milestone[] }> = ({ milestones }) => {
  const theme = useAppTheme();
  return (
    <View style={styles.grid}>
      {milestones.map((m) => (
        <View
          key={m.id}
          style={[
            styles.item,
            {
              backgroundColor: m.earned ? theme.colors.flameContainer : theme.colors.surface,
              borderColor: m.earned ? 'transparent' : theme.colors.outlineVariant,
            },
          ]}
          accessible
          accessibilityLabel={`${m.title}: ${m.description}. ${m.earned ? 'Earned' : `Progress ${m.progressLabel}`}`}
        >
          <View style={styles.top}>
            <MaterialCommunityIcons
              name={m.icon as IconName}
              size={22}
              color={m.earned ? theme.colors.flame : theme.colors.outline}
            />
            {m.earned ? (
              <MaterialCommunityIcons name="check-circle" size={16} color={theme.colors.flame} />
            ) : (
              <Text variant="labelSmall" style={{ color: theme.colors.onSurfaceVariant }}>{m.progressLabel}</Text>
            )}
          </View>
          <Text style={[tamilText.labelStrong, { color: m.earned ? theme.colors.onFlameContainer : theme.colors.onSurface }]} numberOfLines={1}>
            {m.tamil}
          </Text>
          <Text variant="labelSmall" style={{ color: m.earned ? theme.colors.onFlameContainer : theme.colors.onSurfaceVariant }} numberOfLines={2}>
            {m.description}
          </Text>
          {!m.earned && (
            <View style={[styles.track, { backgroundColor: theme.colors.surfaceVariant }]}>
              <View style={[styles.fill, { width: `${Math.max(m.progress * 100, 2)}%`, backgroundColor: theme.colors.primary }]} />
            </View>
          )}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: space.sm,
    paddingHorizontal: space.lg,
  },
  item: {
    width: '48.8%',
    flexGrow: 1,
    padding: space.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 2,
  },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.xs,
  },
  track: {
    height: 4,
    borderRadius: 2,
    marginTop: space.sm,
    overflow: 'hidden',
  },
  fill: {
    height: 4,
    borderRadius: 2,
  },
});
