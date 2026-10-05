import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Kural } from '../../types/kural';
import { useAppTheme, space, radius, tamilText } from '../../theme';

interface KuralListItemProps {
  kural: Kural;
  onPress: (kural: Kural) => void;
  /** Show the chapter name under the lines (useful outside a chapter view). */
  showChapter?: boolean;
  showEnglish?: boolean;
  right?: React.ReactNode;
  /** Dim the number badge's fill for kurals already read. */
  read?: boolean;
}

const KuralListItemBase: React.FC<KuralListItemProps> = ({
  kural, onPress, showChapter = false, showEnglish = true, right, read = false,
}) => {
  const theme = useAppTheme();
  return (
    <Pressable
      onPress={() => onPress(kural)}
      accessibilityRole="button"
      accessibilityLabel={`Kural ${kural.number}. ${kural.line1} ${kural.line2}`}
      android_ripple={{ color: theme.colors.primaryContainer }}
      style={({ pressed }) => [
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.outlineVariant,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View
        style={[
          styles.badge,
          { backgroundColor: read ? theme.colors.surfaceVariant : theme.colors.primaryContainer },
        ]}
      >
        <Text
          variant="labelMedium"
          style={{ color: read ? theme.colors.onSurfaceVariant : theme.colors.onPrimaryContainer }}
        >
          {kural.number}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={[tamilText.title, { color: theme.colors.onSurface }]}>{kural.line1}</Text>
        <Text style={[tamilText.title, { color: theme.colors.onSurface }]}>{kural.line2}</Text>
        {showEnglish && (
          <Text variant="bodySmall" numberOfLines={1} style={[styles.english, { color: theme.colors.onSurfaceVariant }]}>
            {kural.eng}
          </Text>
        )}
        {showChapter && (
          <Text style={[tamilText.label, { color: theme.colors.primary, marginTop: 4 }]} numberOfLines={1}>
            {kural.chap_tam}{kural.chap_eng ? ` · ${kural.chap_eng}` : ''}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
};

export const KuralListItem = React.memo(KuralListItemBase);

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: space.lg,
    marginHorizontal: space.lg,
    marginBottom: space.sm,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    gap: space.md,
    overflow: 'hidden',
  },
  badge: {
    minWidth: 40,
    height: 40,
    paddingHorizontal: 6,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  english: {
    marginTop: 4,
    fontStyle: 'italic',
  },
});
