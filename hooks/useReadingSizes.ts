import { useWindowDimensions } from 'react-native';
import { useSettingsStore } from '../store/useSettingsStore';
import { readingSizes } from '../theme';

/** The text-size value meaning "follow the phone's font size". */
export const DEVICE_TEXT_SIZE = 0;
/** The app's standard couplet size, before the phone's font scale is applied. */
const DEVICE_BASE = 22;

/**
 * Reading sizes for the text-size setting.
 * - Device: the app's standard sizes, enlarged or reduced by the phone's own
 *   font-size setting (as all text on the phone is).
 * - S, M, L, XL: exactly that size, whatever the phone's font size is set to.
 *   React Native multiplies every size by the phone's font scale, so the size
 *   is divided by it here to cancel that out.
 */
export function useReadingSizes() {
  const fontSize = useSettingsStore((s) => s.fontSize);
  const { fontScale } = useWindowDimensions();
  const device = fontSize === DEVICE_TEXT_SIZE;
  const sizes = readingSizes(device ? DEVICE_BASE : fontSize);
  const f = device || !fontScale ? 1 : fontScale;
  return {
    verse: sizes.verse / f,
    verseMin: sizes.verseMin / f,
    translation: sizes.translation / f,
    meaning: sizes.meaning / f,
  };
}
