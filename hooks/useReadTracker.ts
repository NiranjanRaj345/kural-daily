import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSettingsStore } from '../store/useSettingsStore';
import { toLocalDateKey } from '../utils/date';

/**
 * Whether the app is in front. Android reports "unknown" or no state while starting,
 * so only an explicit background/inactive state stops the clock.
 */
const isInFront = (state: string | null | undefined) => state !== 'background' && state !== 'inactive';

/** How long a Kural has to stay on screen to count as read. */
export const READ_AFTER_MS = 6000;

/**
 * Counts a Kural as read only once it has really been read: after it has been
 * on screen for a few seconds with the app in front, or as soon as the reader
 * does something with it (listens, opens the meaning, learns, saves, shares).
 * Opening a Kural and closing it straight away doesn't count, so it neither
 * fills the reading history nor keeps a streak alive.
 *
 * `visible` is false while something covers the Kural (e.g. another Kural's sheet).
 * Returns `markRead`, to call from those interactions.
 */
export function useReadTracker(kuralNumber: number, visible = true) {
  const markReadInStore = useSettingsStore((s) => s.markRead);
  const focused = useIsFocused();
  const [active, setActive] = useState(isInFront(AppState.currentState));
  // Kural and day last counted, so a card left open overnight counts again the next day
  const counted = useRef<string | null>(null);
  const keyNow = useCallback(() => `${kuralNumber}:${toLocalDateKey(new Date())}`, [kuralNumber]);

  const markRead = useCallback(() => {
    const key = keyNow();
    if (counted.current === key) return;
    counted.current = key;
    markReadInStore(kuralNumber);
  }, [kuralNumber, keyNow, markReadInStore]);

  useEffect(() => {
    // Read the state again here: on Android the app can come to the front between the
    // first render and this listener, and that change would otherwise be missed
    setActive(isInFront(AppState.currentState));
    const sub = AppState.addEventListener('change', (state) => setActive(isInFront(state)));
    return () => sub.remove();
  }, []);

  // The clock restarts whenever the Kural changes or the screen comes back into view
  useEffect(() => {
    if (!visible || !focused || !active || counted.current === keyNow()) return;
    const timer = setTimeout(markRead, READ_AFTER_MS);
    return () => clearTimeout(timer);
  }, [visible, focused, active, keyNow, markRead]);

  return markRead;
}
