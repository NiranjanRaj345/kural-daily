import React, { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from 'react-native-paper';
import { Kural } from '../types/kural';
import { getAllKurals } from '../services/DataService';
import { KuralCard } from './KuralCard';
import { SheetModal } from './SheetModal';
import { useAppTheme, space } from '../theme';

interface KuralDetailModalProps {
  kural: Kural | null;
  onClose: () => void;
  title?: string;
  /**
   * The list the user opened this Kural from (a chapter, saved list, results…).
   * Previous/next step through it. Defaults to the whole book.
   */
  sequence?: Kural[];
}

export const KuralDetailModal: React.FC<KuralDetailModalProps> = ({ kural, onClose, title, sequence }) => {
  const theme = useAppTheme();
  const [current, setCurrent] = useState<Kural | null>(kural);

  useEffect(() => {
    setCurrent(kural);
  }, [kural]);

  const list = useMemo(() => (sequence && sequence.length > 0 ? sequence : getAllKurals()), [sequence]);
  const index = current ? list.findIndex((k) => k.number === current.number) : -1;
  const prev = index > 0 ? list[index - 1] : null;
  const next = index >= 0 && index < list.length - 1 ? list[index + 1] : null;

  const subtitle = current
    ? index >= 0 && sequence
      ? `${index + 1} of ${list.length}`
      : `Kural ${current.number} of ${getAllKurals().length}`
    : undefined;

  const footer = current && index >= 0 && list.length > 1 ? (
    <View style={[styles.footer, { borderTopColor: theme.colors.outlineVariant, backgroundColor: theme.colors.surface }]}>
      <Button
        icon="chevron-left"
        mode="text"
        disabled={!prev}
        onPress={() => prev && setCurrent(prev)}
        accessibilityLabel={prev ? `Previous, Kural ${prev.number}` : 'No previous Kural'}
      >
        {prev ? `${prev.number}` : 'Previous'}
      </Button>
      <Button
        icon="chevron-right"
        mode="contained-tonal"
        disabled={!next}
        contentStyle={styles.nextContent}
        onPress={() => next && setCurrent(next)}
        accessibilityLabel={next ? `Next, Kural ${next.number}` : 'No next Kural'}
      >
        {next ? `Next · ${next.number}` : 'Next'}
      </Button>
    </View>
  ) : undefined;

  return (
    <SheetModal
      visible={!!kural}
      onClose={onClose}
      title={title ?? (current ? current.chap_tam : 'Kural')}
      subtitle={subtitle}
      footer={footer}
      contentKey={current?.number}
    >
      {current && <KuralCard key={current.number} kural={current} />}
    </SheetModal>
  );
};

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  nextContent: {
    flexDirection: 'row-reverse',
  },
});
