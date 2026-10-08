# Changelog

## 1.3.0 (2026-10-08)

A redesign around reading and learning the Thirukkural, and the first open-source release.

### Daily reading
- **Today's Kural is a surprise.** The days follow one fixed, shuffled order of all 1330 Kurals:
  none repeats until every Kural has been shown, two days in a row never come from the same
  chapter, and everyone sees the same Kural on the same day.
- **The couplet on its two original lines**, on Today, in every Kural sheet and in shared images.
  The text shrinks a little where needed. With large text on a narrow phone the lines wrap rather
  than get tiny.
- **A compact Today card** that fits on one screen on most phones. The meaning has one header row:
  பொருள் (fold or open), a தமிழ் / EN switch and a speaker button. Below it, the rest of today's
  chapter and a link to a random Kural.
- **Listen to the meaning**: the Tamil explanation in the Tamil voice, the English one in the
  phone's English voice.
- **Reading counts when you actually read**: a Kural counts (history, streak) after about six
  seconds on screen, or as soon as you listen, open its meaning, save, share or learn it. A ✓ Read
  badge shows when it has. Opening the app alone doesn't count.
- Each Kural shows its place in the book (chapter, position 1–10). Browse shows each book's parts
  (இயல்).

### Learn by heart (new)
- **Memorize (மனப்பாடம்)**: read the couplet, then recite it as words are hidden step by step
  (every other word, first words only, then all). Hidden words shimmer like a chat spoiler;
  tap one to check it. Listen slowly, or show the meaning as a hint.
- **Spaced review**: learned Kurals come back after 1, 2, 4, 7, 15, 30 and 60 days. Forget one and
  it starts again; remembered after a 15-day gap, it counts as known by heart.
- **Learn tab** with today's review, your Kurals and their progress, how it works, and the quiz.
  The tab shows a badge when reviews are due.

### Look and feel
- A quieter design: plain lists and rows instead of a box around everything, the couplet always
  the largest text on the card, and the design rules written down in `docs/design.md`.
- **Page** (Auto, Paper, Palm leaf, Night) and **Accent** (Indigo, Kumkum, Leaf, Saffron). The
  accent is used for everything you select, complete or get right; only the streak flame stays
  saffron. Every combination meets WCAG AA contrast.
- **Font**: Classic (book serif), Modern (clean sans) or Device (the phone's font), with an
  optional **Bold couplet**.
- **Text size**: match the phone's text size (default), or a fixed S, M, L or XL that scales the
  couplet, translation and meaning together.
- New installs start with Auto page, Indigo, the phone's font and text size, and the best Tamil
  voice installed. Existing settings are kept on upgrade.

### Welcome
- A short, hands-on tour on first launch: hear the first Kural, say it from memory with three words
  hidden, peek at today's Kural, then choose how to read and whether to be reminded.

### Listening
- **The most natural Tamil voice by default**: Automatic picks the best Tamil voice installed.
  Couplets are recited line by line with a short pause.
- The voice picker lists Tamil voices best first, previews each one, and leads straight to
  downloading a better voice (Android) or explains where to find one (iPhone). If there is no Tamil
  voice, Listen says how to add one instead of reading Tamil with an English voice.

### Reminders
- **Any time you choose**, with a clock and keyboard picker, on the welcome screen and in
  You → Reminders.
- **Streak reminder** (new): an evening nudge, only on days you haven't read while your streak is
  still alive. It has its own switch and Android notification channel.
- Reminders are planned 30 days ahead, name each day's Kural, skip today's once you've read, and
  re-plan when you read or change a setting. A test reminder lets you check they arrive.
- If notifications are refused, now or later in system settings, the switches turn off to match.

### You
- Streak and a month-by-month reading calendar, Kurals read / chapters done / by heart,
  milestones, reading history, and **About the Thirukkural** (the poet, the work's names, the
  verse form, how the book is arranged, commentaries and translations).
- Settings in sheets: Appearance, Reading, Listening voice, Reminders, each with a one-line summary.
- Share the app, the privacy policy, a link to the source code, and Reset progress.

### Sharing
- Share a Kural as an image in Paper, Palm leaf, Ink, Indigo, Kumkum or Leaf style, always with
  the couplet on two lines, or as text; Copy text.

### App icon
- A bundle of palm-leaf manuscripts (ஓலைச்சுவடி) tied with a saffron cord, with அ inscribed on
  the top leaf, the letter the Thirukkural begins with. Proper assets for every platform:
  - Android adaptive and themed (monochrome) icons
  - a full-bleed iOS icon
  - the splash screen, notification icon and favicon

### Open source and privacy
- Published by **Aatra Labs** with the package ID `com.aatralabs.kuraldaily`. This is a new app
  for Android: test builds of 1.2 or earlier (`com.mrmonk.kuraldaily`) can't update to it, so
  uninstall them first; their progress doesn't carry over.
- Kural Daily is open source under the GNU GPL v3.0 or later. See the README, CONTRIBUTING and
  PRIVACY (the privacy policy, also linkable from the app stores).
- Still no account, ads, analytics or network use: everything stays on the phone.

### Fixed
- Reminder times are always saved as a valid time (the picker can return 24 for midnight).
- Android: the voice-settings shortcuts work on Android 11+; the unneeded "draw over other apps"
  permission is blocked; the window background follows the theme.
- The part name படையியல் was spelled "படையில்".
- Today's Kural now counts as read on Android after a cold start (the reading timer could stay
  stopped).

## 1.2.0 (2026-10-05)

### Redesign
- New design system: brand colours from the app icon (ink blue + saffron) with matched light, dark and sepia themes, Inter for UI text and Noto Sans Tamil for Kurals. Fixes low-contrast hard-coded greys in dark/sepia.
- **Auto theme** follows the system light/dark setting (new default); status bar matches the theme.
- **Today**: greeting and date, streak badge, explanation open by default, reading progress (X of 1330), quick actions for a random Kural and the quiz.
- **Kural card**: chapter and book shown in Tamil and English, labelled actions (Save, Listen, Share, Copy), explanation with a Tamil/English switch.
- **Previous/Next** in every Kural sheet, stepping through the chapter, search results, saved list or history you opened it from.
- **Browse**: chapters grouped by book with filters, English chapter names, and per-chapter reading progress; previous/next chapter buttons.
- **Search**: recent searches, suggested topics, result count, results show the full couplet and chapter.
- **Saved** (was Favorites): newest first, remove with Undo.
- **Quiz**: modes as visible chips, A–D options with clear right/wrong states, Jumbled words can be tapped to take back, scrolls to the result.
- **You** (was Profile): streak, best streak, read and saved tiles; grouped settings; live text-size preview with an extra-large size; Reset progress.
- Tab bar: theme colours and haptic feedback; fixed content scrolling under a transparent bar on iOS.

### Fixed
- Text no longer risks falling back to the system font on iOS/Android (single-weight fonts are no longer paired with a bold font weight).

## 1.1.0 (2026-10-05)

### New
- **Daily reminder is opt-in**: a "Get a daily reminder?" card on the Daily tab. Permission is only requested when you tap Enable.
- **Choose your reminder time** in Profile (6 AM – 9 PM).
- **Reminders show the day's Kural** (number and both lines). Tapping one opens the app on today's Kural.
- **Share options**: Tamil / English / Explanation toggles in the share sheet, applied to both image and text and remembered for next time.
- **Share as Text** button (was a hidden long-press).
- Searching a number jumps straight to that Kural; search also covers English explanations.
- Browse shows chapter numbers and English chapter names.

### Fixed
- Day streak used the UTC date, so reading between midnight and 05:30 (IST) counted for the previous day.
- Streak and settings could be computed before saved data loaded and then overwritten.
- Chapters 71 and 110 (both named குறிப்பறிதல்) were merged into one 20-Kural chapter in Browse.
- Missing Word quiz: some questions had two blanks or two right answers, and punctuation gave answers away.
- The Android back button did not close pop-up sheets; it now closes them and returns from chapter and history views.
- Read-aloud kept playing after a card was closed.
- The daily Kural did not change if the app stayed open past midnight.
- The web build showed a blank page.

### Changed
- App name on the home screen is now "Kural Daily".
- Removed the storage permissions on Android (not needed for sharing).
- Added a proper Android notification icon and web favicon.
- Updated in-app privacy policy.

### Developer
- `npm run check` runs typecheck, lint (eslint-config-expo) and unit tests (jest-expo).
- README with build and release steps; `scripts/transform_data.js` takes source paths and validates its output.

## 1.0.0 (2025-11-30)

- Initial release.
