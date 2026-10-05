import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { IconButton, Snackbar } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useSettingsStore } from '../../store/useSettingsStore';
import { getKuralByNumber } from '../../services/DataService';
import { Kural } from '../../types/kural';
import { KuralDetailModal } from '../../components/KuralDetailModal';
import { KuralListItem } from '../../components/ui/KuralListItem';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAppTheme, space } from '../../theme';

export default function FavoritesScreen() {
  const theme = useAppTheme();
  const router = useRouter();
  const favorites = useSettingsStore((s) => s.favorites);
  const toggleFavorite = useSettingsStore((s) => s.toggleFavorite);
  const [selectedKural, setSelectedKural] = useState<Kural | null>(null);
  const [removed, setRemoved] = useState<number | null>(null);

  // Most recently saved first
  const favoriteKurals = useMemo(
    () => [...favorites].reverse().map((id) => getKuralByNumber(id)).filter((k): k is Kural => k !== undefined),
    [favorites]
  );

  const openKural = useCallback((kural: Kural) => setSelectedKural(kural), []);

  const remove = (kural: Kural) => {
    toggleFavorite(kural.number);
    setRemoved(kural.number);
  };

  const undo = () => {
    if (removed !== null && !useSettingsStore.getState().favorites.includes(removed)) {
      toggleFavorite(removed);
    }
    setRemoved(null);
  };

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader
        title="Saved"
        subtitle={favoriteKurals.length > 0 ? `${favoriteKurals.length} ${favoriteKurals.length === 1 ? 'Kural' : 'Kurals'}` : undefined}
      />

      <FlatList
        data={favoriteKurals}
        keyExtractor={(item) => item.number.toString()}
        renderItem={({ item }) => (
          <KuralListItem
            kural={item}
            onPress={openKural}
            showChapter
            showEnglish={false}
            right={
              <IconButton
                icon="bookmark"
                iconColor={theme.colors.tertiary}
                size={22}
                style={styles.removeButton}
                onPress={() => remove(item)}
                accessibilityLabel={`Remove Kural ${item.number} from saved`}
              />
            }
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            icon="bookmark-outline"
            title="Nothing saved yet"
            message="Tap Save on any Kural to keep it here for later."
            actionLabel="Read today's Kural"
            onAction={() => router.navigate('/')}
          />
        }
      />

      <KuralDetailModal kural={selectedKural} onClose={() => setSelectedKural(null)} sequence={favoriteKurals} />

      <Snackbar
        visible={removed !== null}
        onDismiss={() => setRemoved(null)}
        duration={4000}
        action={{ label: 'Undo', onPress: undo }}
      >
        {`Removed Kural ${removed ?? ''}`}
      </Snackbar>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: space.sm,
    paddingBottom: space.xxxl,
    flexGrow: 1,
  },
  removeButton: {
    margin: -8,
  },
});
