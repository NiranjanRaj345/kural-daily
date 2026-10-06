# Kural Daily

An offline mobile app for reading the **Thirukkural**: all 1330 couplets in 133 chapters, with Tamil text, English translation, and Tamil (Mu. Varadarajan) and English explanations.

## Features

- **Today**: one couplet per day, cycling through all 1330 in order, with a week strip, streaks and the rest of the day's chapter
- **Learn by heart**: a memorize mode that hides words step by step, and spaced review (1, 2, 4, 7, 15, 30, 60 days)
- **Quiz**: Missing Word, Meaning Match, Find Chapter, Jumbled Kural
- **Browse** by book, part (இயல்) and chapter; **search** by Tamil or English text, chapter name, or Kural number
- **Saved** Kurals, reading history and milestones
- **Listen**: Tamil text-to-speech that picks the most natural installed voice, recites line by line, with voice and speed choices
- **Share** as a styled image or as text; share the app
- **Reminders** (optional, local only): each day's Kural at any time you choose, and an evening streak reminder on days you haven't read
- Page styles (Paper, Palm leaf, Night, Auto) × accent colours; Classic, Modern or device font; adjustable text size; Tamil, English or both

There is no backend, account, analytics or network use. All settings are stored on the device.

## Tech stack

Expo SDK 54 · React Native 0.81 · TypeScript · expo-router · react-native-paper (Material 3) · zustand + AsyncStorage
Fonts: Noto Serif Tamil (couplets), Lora (English reading text), Inter and Noto Sans Tamil (interface)

## Project structure

```
app/                 Screens (expo-router). (tabs)/: Today, Browse, Learn, Saved, You (+ Search)
components/          KuralCard, KuralVerse, MemorizeSheet, QuizPanel, ShareModal, SheetModal,
                     KuralDetailModal, WelcomeScreen, AboutKuralSheet; ui/ and profile/ building blocks
constants/app.ts     App name, version and the store link used by "Share the app"
theme/               Page × accent theme builder, spacing, radii and reading typography
services/            DataService (bundled data, search, chapters), DailyService (daily pick),
                     QuizService, NotificationService (daily reminders), SpeechService (Listen)
store/               useSettingsStore: persisted settings, favorites, history, streaks
utils/               date (local-timezone dates, streaks), srs (spaced review), milestones, voices (Tamil voice ranking),
                     reminderPlan (which notifications to schedule)
plugins/             Expo config plugin declaring the Android voice-settings intents
assets/data/         thirukkural.json, the full text (generated, see below)
scripts/             transform_data.js, which rebuilds the data file from raw sources
__tests__/           Unit tests
```

## Development

```bash
npm install
npm start            # Expo dev server (press a / i / w for Android / iOS / web)
npm run check        # typecheck + lint + tests, run before every release
```

Individual checks: `npm run typecheck`, `npm run lint`, `npm test`.

## Building and releasing (EAS)

```bash
npx eas-cli@latest build --profile preview --platform android      # installable APK for testing
npx eas-cli@latest build --profile production --platform all       # store builds (AAB / IPA)
npx eas-cli@latest submit --profile production --platform android
```

- Versions are managed **locally** (`appVersionSource: "local"`). The production profile has `autoIncrement`, so EAS bumps `android.versionCode` / `ios.buildNumber` in `app.json` on each build. Commit that change after building.
- For a user-visible release, also bump `expo.version` in `app.json`. The Profile screen reads the version from there.

### Release checklist

The full device test plan is in [TESTING.md](TESTING.md).


1. `npm run check` passes
2. Bump `expo.version` in `app.json` if needed
3. Update the "Last Updated" date in the in-app privacy policy (`app/(tabs)/profile.tsx`) if it changed
4. Build with the `production` profile, then test on a real device: both reminders (set a time a few minutes ahead), Listen and the voice shortcuts, sharing an image, and the launcher icon (round and themed)
5. Store listing: link a hosted copy of the privacy policy; data-safety form answer is "no data collected"
6. Check `STORE_URL` in `constants/app.ts` points at the live store listing

## Regenerating the data

`assets/data/thirukkural.json` is generated from two source files that are not kept in this repo:

```bash
node scripts/transform_data.js path/to/thirukkural.json path/to/detail.json
```

The script fails unless it produces exactly 1330 kurals, each with chapter metadata.

Note: chapters 71 and 110 have the same Tamil name (குறிப்பறிதல்), so the app identifies chapters by number (`Math.ceil(kural / 10)`), not by name.
