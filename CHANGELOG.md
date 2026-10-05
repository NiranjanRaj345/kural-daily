# Changelog

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
