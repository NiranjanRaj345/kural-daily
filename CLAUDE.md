# Kural Daily: notes for Claude

Read this first. The README, CONTRIBUTING.md and `docs/` (design, testing, releasing) give the
full picture; this file holds the decisions and loose ends that aren't obvious from the code.

## The project

- Thirukkural app: Expo SDK 54, React Native 0.81, TypeScript, expo-router, React Native Paper
  (MD3), zustand + AsyncStorage, Reanimated, react-native-svg, Jest.
- Published by **Aatra Labs** (owner: Niranjan Rajkumar). Contact: aatralabs@gmail.com.
- Repo: `github.com/aatralabs/kural-daily` (public), default branch `master`.
- Package ID `com.aatralabs.kuraldaily` (fixed forever once on Play). Expo owner `aatralabs`,
  EAS projectId in `app.json`. Don't change these.
- License: GPL-3.0-or-later. The name "Kural Daily" and the icon are reserved; forks must rename.
  Paid features may come later, so keep code ownership clear (no copying code from
  incompatibly licensed projects).
- Offline and private: no accounts, analytics, tracking, crash reporting or network calls. Any
  change to what's stored or collected must update `PRIVACY.md` and You → Privacy policy in
  `app/(tabs)/profile.tsx` together.

## Working rules

- `npm run check` (typecheck, lint, tests) must pass before every push. CI runs the same
  (`.github/workflows/check.yml`).
- Follow `docs/design.md`: the couplet dominates, plain rows over cards, colour by role, no
  hard-coded colours (use `theme/`), no shadows or gradients, motion only for state changes.
- "Done" and "right" use the accent; "wrong" is neutral grey. No success green or warning yellow.
  `flame` is for the streak fire icon only.
- Bundled fonts: set `fontFamily` only, never with a bold `fontWeight`.
- Changing the persisted settings shape: bump `version` in `store/useSettingsStore.ts` (now 4)
  and add a step to `migrateSettings`, with a test.
- UI text is plain and human ("Read today's Kural to keep it going"), not marketing copy.
- Version lives in both `app.json` and `package.json`; add a CHANGELOG section per release.

## Decisions and why

- **Daily Kural** (`services/DailyService.ts`): a fixed seeded shuffle of all 1330
  (`buildDailyOrder`), indexed by days since 2024-01-01. Same Kural for everyone on a day, no
  repeat until all have been shown, never two from the same chapter in a row. Changing the seed
  or epoch changes everyone's Kural, so don't.
- **When a Kural counts as read** (`hooks/useReadTracker.ts`): after 6 s on screen with the app
  in front, or at once on any interaction (listen, open the meaning, learn, save, share). Today's Kural counts
  too. Opening and closing straight away doesn't.
- **Text size** (`hooks/useReadingSizes.ts`, `theme/readingSizes`): default follows the phone's
  font scale (`DEVICE_TEXT_SIZE = 0`); S–XL are fixed sizes. The couplet is always the largest
  reading text. `FitLines` keeps each couplet line on one line without going below the meaning
  size.
- **Defaults**: text size = device, page = Auto, accent = Indigo, voice = best available,
  font = device, bold couplet off.
- **Hidden words** in Learn use the Telegram-style particle spoiler (`components/ui/Spoiler.tsx`).
  The owner loves it; keep it.
- **Welcome tour** (`components/WelcomeScreen.tsx`): 5 short hands-on steps, shown once.

## Open items

- 3-button navigation bar (gesture handle off): content sat too low on one device. A fix went
  in but was never confirmed on a real 3-button phone; check it in the device test.
- Bundled Tamil/English explanations and translations (`assets/data`) belong to their authors.
  Before any paid version, confirm the rights to use them commercially or replace them.
- 1.3.0 release, in progress: final device test on a preview APK (uninstall old builds first,
  the signing key changed), production build, Play Internal testing, GitHub release `v1.3.0`,
  then Galaxy Store. Steps in `docs/releasing.md`.
- Store listing text (English and Tamil) not written yet.
