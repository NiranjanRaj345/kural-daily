import { Link, Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useAppTheme } from '../theme';

export default function NotFoundScreen() {
  const theme = useAppTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Not found' }} />
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text variant="titleLarge">This page doesn&apos;t exist.</Text>
        <Link href="/" style={styles.link}>
          <Text variant="labelLarge" style={{ color: theme.colors.primary }}>Go to Today</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
