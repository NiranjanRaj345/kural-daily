# Changelog

## 1.3.0 (in testing)

### From the first round of device testing
- **Reading has to be real**: a Kural counts as read (history, journey, streak) after about 6 seconds on screen with the app open, or straight away when you listen, open its meaning, save, share or learn it. Opening one and closing it at once no longer counts. Opening the app no longer counts as reading either; it only ends a streak that has already lapsed. A green ✓ Read on the card shows when a Kural has counted.
- **Listen to the meaning**: a Listen button under the explanation reads the Tamil meaning in the Tamil voice and the English one in the phone's English voice, sentence by sentence.
- **The couplet keeps its two lines** on Today, in Kural sheets and in shared images: the text shrinks a little where needed so each line fits on one line. On Today it never goes below about 60% of your text size; with L or XL on a narrow phone the lines wrap rather than get tiny.
- **Memorize hides words like a chat spoiler**: each hidden word becomes a shimmer of drifting particles (the word itself isn't drawn, so nothing shows through); tap it to reveal. Replaces the boxes that showed where the words were.
- **Accent colour everywhere**: selected buttons, chips, the review banner, the Learn badge, milestones, Saved, read-chapter ticks, By heart, the Read mark, the reading calendar and streak dots now follow the accent. In the quiz, right answers and Accuracy use the accent and wrong answers a quiet grey (a red would be confused with Kumkum). Filter and mode chips are outlined, with only the selected one filled. Only the flame icon stays saffron (and with the Saffron accent it is the accent),.
- **Text size works on all the reading text**: S–XL now scales the couplet, the English translation and the meaning together (it used to change only the couplet, which the two-line fitting then shrank back, so S, M and L looked the same). The couplet stays larger than the meaning, and with the Device font it is now bold (Android has no semi-bold for most system fonts). Memorize follows the text size too.
- **Match my phone's text size** (new, and the default): the reading text follows the phone's font-size setting. Turn it off to pick S–XL, which then stay exactly that size whatever the phone is set to.
- **Bold couplet** (optional, off by default): You → Appearance → Couplet weight sets the Kural in bold for any font. Off keeps the usual book weight.
- **New defaults for a new install**: page Auto, accent Indigo, the phone's font and text size, and the best Tamil voice available. Existing settings are kept on upgrade.
- **Reading calendar** can go back a year (more if your reading goes back further), and forward again to this month.
- **Today is shorter**: the week strip is now a one-line streak pill; tap it for the full calendar on You.
- **You, reorganised**: streak and a month-by-month reading calendar at the top, then Kurals read / chapters done / by heart, Progress (milestones, history, About), Settings (Appearance, Reading, Listening voice, Reminders, each in its own sheet with a one-line summary) and More.
- **About the Thirukkural rewritten**: the poet, the work's names, its place among the பதினெண்கீழ்க்கணக்கு, the verse form, the arrangement, commentaries and translations, and the sources used in the app.

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
- **Install Tamil voices** is always available at the top of the voice picker (You → Listening voice). On Android it opens Google's voice download screen directly, with the text-to-speech settings as a second option; on iPhone it shows where to download one.

### App icon
- New icon: a bundle of palm-leaf manuscripts (ஓலைச்சுவடி) tied with a saffron cord, with அ inscribed on the top leaf in the app's couplet serif. The Thirukkural opens with அ (Kural 1: அகர முதல எழுத்தெல்லாம்), and was preserved for centuries on palm leaves. Drawn flat, without gradients or shadows.
- Proper assets for every platform: full-bleed iOS icon (no transparency), Android adaptive foreground and background inside the safe zone, a monochrome layer for themed icons (the letter and hole cut out, the leaves kept apart), matching splash, notification icon and favicon. The old icon had baked-in corners and a white background that showed on both platforms.

### Habit and sharing
- **Welcome** on first launch: what the Thirukkural is, how you want to read, and an optional daily reminder.
- **Streak** on Today (a one-line pill) and a reading calendar on You.
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
