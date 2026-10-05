# Changelog

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
