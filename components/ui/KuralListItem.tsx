import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Text } from 'react-native-paper';
import { Kural } from '../../types/kural';
import { useAppTheme, space, useType } from '../../theme';

interface KuralListItemProps {
  kural: Kural;
  onPress: (kural: Kural) => void;
  /** Show the chapter name under the lines (useful outside a chapter view). */
  showChapter?: boolean;
  showEnglish?: boolean;
  right?: React.ReactNode;
  /** Mute the number of Kurals already read. */
  read?: boolean;
}

const KuralListItemBase: React.FC<KuralListItemProps> = ({
  kural, onPress, showChapter = false, showEnglish = true, right, read = false,
}) => {
  const theme = useAppTheme();
  const type = useType();
  return (
    <Pressable
      onPress={() => onPress(kural)}
      accessibilityRole="button"
      accessibilityLabel={`Kural ${kural.number}. ${kural.line1} ${kural.line2}`}
      android_ripple={{ color: theme.colors.primaryContainer }}
      style={({ pressed }) => [
        styles.container,
        { borderBottomColor: theme.colors.rule, opacity: pressed ? 0.7 : 1 },
      ]}
    >
      <Text
        variant="labelLarge"
        style={[styles.number, { color: read ? theme.colors.onSurfaceVariant : theme.colors.primary }]}
      >
        {kural.number}
      </Text>
      <View style={styles.body}>
        <Text style={[type.tamilPreview, { color: theme.colors.ink }]}>{kural.line1}</Text>
        <Text style={[type.tamilPreview, { color: theme.colors.ink }]}>{kural.line2}</Text>
        {showEnglish && (
          <Text numberOfLines={1} style={[type.translation, styles.english, { color: theme.colors.onSurfaceVariant }]}>
            {kural.eng}
          </Text>
        )}
        {showChapter && (
          <Text style={[type.tamilLabel, { color: theme.colors.primary, marginTop: 4 }]} numberOfLines={1}>
            {kural.chap_tam}{kural.chap_eng ? ` · ${kural.chap_eng}` : ''}
          </Text>
        )}
      </View>
      {right}
    </Pressable>
  );
};

export const KuralListItem = React.memo(KuralListItemBase);

// A plain row in a list: lists are separated by rules, not drawn as stacks of cards
const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: space.md,
    marginHorizontal: space.xl,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: space.md,
  },
  number: {
    width: 40,
    marginTop: 3,
    fontVariant: ['tabular-nums'],
  },
  body: {
    flex: 1,
  },
  english: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 21,
  },
});
