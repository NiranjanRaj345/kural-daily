# Changelog

## Unreleased

### Learn by heart (new)
- **Memorize mode (மனப்பாடம்)**: read the couplet, then recite it as words are hidden step by step (every other word, first words only, nothing), tapping any word to peek. Listen slowly, see the meaning as a hint.
- **Spaced review**: Kurals you learn come back after 1, 2, 4, 7, 15, 30 and 60 days (Leitner boxes). Forget one and it starts again; remembered after a 15-day gap counts as known by heart.
- **Learn tab** with today's review, your Kurals and their progress, how it works, and the quiz. The tab shows a badge when reviews are due.

### Reading
- New look built for reading: Noto Serif Tamil for the couplets and Lora for English, set like a printed verse with a margin rule.
- **Page** (Auto, Paper, Palm leaf, Night) and **Accent** (Indigo, Kumkum, Leaf, Saffron) choices, previewed in their own colours. Every combination meets WCAG AA contrast.
- Each Kural shows its place in the book: chapter number, position in the chapter (9/10), book.
- **Reading language** (Both / தமிழ் / English) and **reading speed** for Listen.
- **Font** choice: Classic (book serif), Modern (clean sans) or Device (the phone's own font throughout the app). Shared images follow it too.

### Listening
- **Most natural Tamil voice by default**: Automatic picks the best Tamil voice installed (higher-quality and neural voices first, offline voices preferred), instead of whatever the phone defaults to.
- Couplets are recited line by line with a short pause between, without reading out punctuation; Memorize plays a little slower to repeat after.
- Voice picker lists Tamil voices best first, marks the natural-sounding ones, previews each with the first Kural, and explains how to install a better Tamil voice (with a shortcut to the text-to-speech settings on Android).
- If the phone has no Tamil voice at all, Listen explains how to add one instead of reading Tamil with an English voice.
- Browse shows the parts (இயல்) of each book; Today offers the rest of today's chapter with a 10-dot progress line.
- **About the Thirukkural**: the poet, the couplet form (with the seven feet marked) and the full structure of books, parts and chapters.

### Reminders
- **Pick any time**: a clock and keyboard time picker replaces the preset list, for both reminders, on the welcome screen and in You → Reminders.
- **Streak reminder** (new): an evening nudge, at a time you choose, only on days you haven't read yet and your streak is about to end. Turned on with "Remind me daily"; separate switch and its own Android notification channel.
- Reminders now look 30 days ahead (was 14), skip today's once you've read, and re-plan as soon as you read or change a setting. Unchanged plans aren't rescheduled.
- If notification permission is refused (now or later in system settings) the switches turn off to match; a background check never turns them off while permission simply hasn't been asked yet.

### Voice
- **Install Tamil voices** is always available: in You → Listening and at the top of the voice picker. On Android it opens Google's voice download screen directly, with the text-to-speech settings as a second option; on iPhone it shows where to download one.

### App icon
- New icon: a bundle of palm-leaf manuscripts (ஓலைச்சுவடி) with a couplet of 4 + 3 marks, binding hole and cord, on indigo. Full-bleed for iOS; Android adaptive foreground/background plus a monochrome layer for themed icons; matching splash, notification icon and favicon. The old icon had baked-in corners and a white background that showed on both platforms.

### Habit and sharing
- **Welcome** on first launch: what the Thirukkural is, how you want to read, and an optional daily reminder.
- **Week strip** on Today showing the days you read, current and best streak.
- **Milestones**: ten reading goals from your first Kural to all 1330, with progress.
- **Share the app** from Today and You; share sheet gains palm-leaf, ink, indigo, kumkum and leaf styles and a Copy text button.

### Fixed
- Reminder times are always saved as a valid time (the picker can return 24 for midnight).
- Android: the voice settings shortcuts are declared for Android 11+ package visibility; the unneeded "draw over other apps" permission is blocked; the window background follows the theme (expo-system-ui).
- The data spelled the part படையியல் as "படையில்".
- The web build no longer pre-renders pages (it showed hydration errors with saved settings).

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
