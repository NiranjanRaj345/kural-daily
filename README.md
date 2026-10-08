<p align="center">
  <img src="assets/images/icon.png" width="96" height="96" alt="Kural Daily icon: a bundle of palm-leaf manuscripts with அ" />
</p>

<h1 align="center">Kural Daily · திருக்குறள்</h1>

<p align="center">
  One Thirukkural a day: read it, hear it, understand it and learn it by heart.<br />
  Offline, private and free of ads.
</p>

<p align="center">
  <a href="LICENSE">GPL-3.0</a> · <a href="PRIVACY.md">Privacy</a> · <a href="CHANGELOG.md">Changelog</a> ·
  <a href="CONTRIBUTING.md">Contributing</a>
</p>

---

Kural Daily is a mobile app for the Thirukkural, Thiruvalluvar's 1330 couplets on virtue, wealth
and love. Each day brings a new Kural, set on its original two lines, with an English translation
and a clear explanation in Tamil and English. The app helps you come back every day and remember
what you read.

## Features

**Read**
- **A Kural a day**, in a fixed shuffled order of all 1330: a surprise each day, the same for
  everyone, and none repeats until every Kural has been shown.
- The couplet set like a printed verse on its two lines, with the English translation and the
  meaning in Tamil (Mu. Varadarasanar) or English.
- **Browse** by book (பால்), part (இயல்) and chapter (அதிகாரம்); **search** by Tamil or English
  words, chapter or number; **save** favourites.
- **About the Thirukkural**: the poet, the verse form, the book's structure and its history.

**Listen**
- The couplet and its meaning read aloud by the phone's most natural Tamil voice, line by line,
  with a voice picker and shortcuts to install better voices.

**Learn**
- **Learn by heart**: recite as words are hidden step by step behind a shimmering spoiler, then
  recall the whole Kural from memory.
- **Spaced review** (1, 2, 4, 7, 15, 30, 60 days) so learned Kurals stay learned.
- **Quiz**: missing word, meaning, chapter and jumbled-word games.

**Keep going**
- Streaks with a reading calendar, milestones and reading history. A Kural counts as read after a
  few seconds with it, not just by opening the app.
- Optional **reminders** at any time you choose: each day's Kural, and an evening nudge before a
  streak ends.
- **Share** a Kural as a styled image or as text.

**Make it yours**
- Page styles (Paper, Palm leaf, Night, Auto) and accents (Indigo, Kumkum, Leaf, Saffron), all
  meeting WCAG AA contrast.
- Classic, Modern or the phone's own font; optional bold couplet; text size that follows the phone
  or a fixed S–XL; Tamil, English or both.

**Private by design**: no account, no ads, no analytics, no network use. Everything stays on the
phone ([privacy policy](PRIVACY.md)).

## Getting started

Requirements: Node.js 20 or later, and the Expo Go app or an Android/iOS emulator.

```bash
git clone https://github.com/NiranjanRaj345/kural-daily.git
cd kural-daily
npm install
npm start            # press a (Android), i (iOS) or w (web)
```

| Command | What it does |
| --- | --- |
| `npm start` | Expo dev server |
| `npm run check` | Typecheck, lint and unit tests (run before every pull request) |
| `npm test` | Unit tests only |
| `npx eas-cli@latest build --profile preview --platform android` | Installable test APK |

Some features need a real device or a development build: notifications, voice settings
shortcuts and haptics. The web build is for quick previews.

## Tech

Expo SDK 54 · React Native 0.81 · TypeScript · expo-router · React Native Paper (Material 3) ·
zustand with AsyncStorage · Reanimated · react-native-svg · Jest

Fonts: Noto Serif Tamil and Lora (reading), Inter and Noto Sans Tamil (interface), all under the
SIL Open Font License.

## Project structure

```
app/                 Screens (expo-router): Today, Browse, Learn, Saved, You, Search
components/          KuralCard, KuralVerse, FitLines, MemorizeSheet, QuizPanel, ShareModal, …
  profile/           You tab: settings sheets, reading calendar, pickers, milestones
  ui/                Small building blocks: streak pill, spoiler, list items, tiles
hooks/               useReadTracker (when a Kural counts as read), useReadingSizes
services/            Data, daily order, quiz, notifications, speech
store/               Persisted settings, progress and migrations
theme/               Page × accent colours, typography, reading sizes
utils/               Dates and streaks, spaced review, milestones, reminder planning, voices
plugins/             Expo config plugin for the Android voice-settings intents
assets/data/         thirukkural.json: all 1330 Kurals (generated, see below)
scripts/             transform_data.js: rebuilds the data file from its sources
docs/                Device test plan and release steps
__tests__/           Unit tests
```

## The data

`assets/data/thirukkural.json` holds every Kural with its chapter, part and book, the Tamil
explanation and the English translation and explanation. It's generated from two source files
(not kept in this repo):

```bash
node scripts/transform_data.js path/to/thirukkural.json path/to/detail.json
```

The script fails unless it produces exactly 1330 Kurals with chapter details. Chapters 71 and 110
share a Tamil name (குறிப்பறிதல்), so the app identifies chapters by number
(`Math.ceil(kural / 10)`).

## Releasing

See [docs/releasing.md](docs/releasing.md) for versioning and the Google Play and Galaxy Store
builds, [docs/testing.md](docs/testing.md) for the device test plan, and
[docs/design.md](docs/design.md) for the design rules (colour roles, type, when to use a card).

## Contributing

Issues and pull requests are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) first.

## License

The source code is licensed under the **GNU General Public License v3.0 or later**; see
[LICENSE](LICENSE). You may use, study, change and share it, and anything you distribute that's
based on it must be released under the same license with its source.

**Name and icon.** "Kural Daily" and the palm-leaf icon identify the official app and aren't
licensed for other apps. If you publish a fork, give it a different name, icon and package name.

**Texts.** The Thirukkural itself is in the public domain. The explanations and translations
shipped in `assets/data` remain the work of their authors (the Tamil explanation is by
Mu. Varadarasanar) and are not covered by the code license; anyone reusing them should check their
terms.

Copyright © 2025–2026 Niranjan Rajkumar
