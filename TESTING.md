# Manual testing

Run this on a real phone before merging a release. Everything below can be checked
in about 45 minutes. Note anything that looks or behaves wrong with a screenshot.

## 0. Build and install

```bash
git fetch origin
git checkout claude/serene-wozniak-94n40c                        # or the branch being tested
git pull origin claude/serene-wozniak-94n40c                     # bring your copy up to date
npm install
npm run check                                                     # must pass; shows the version (kural-daily@1.3.0)
npx eas-cli@latest build --profile preview --platform android    # installable APK
```

Open the build link on the phone (or scan the QR code) and install.

Test both paths if you can:

- **Upgrade**: install the new APK *over* the version already on your phone (same signing key, so
  Android allows it). Your data must survive.
- **Fresh install**: uninstall (or Settings → Apps → Kural Daily → Storage → Clear data), then
  install again. This shows the welcome screens.

You → bottom of the screen should read **Kural Daily 1.3.0**.

## 1. First launch (fresh install)

- [ ] Splash: indigo background with the palm-leaf icon, no white flash.
- [ ] Welcome 1 shows திருக்குறள், 1330 / 133 / 3 and the first Kural.
- [ ] Welcome 2: choose தமிழ் மட்டும், then Tamil and English; the selection moves.
- [ ] Welcome 3: **Change time** opens the clock. Set an unusual time (e.g. 6:47) using the
      keyboard icon; the card shows it after **Ok**.
- [ ] **Remind me daily** shows the Android notification permission prompt. Allow it.
- [ ] The app opens on Today. You → Reminders shows both Daily Kural and Streak reminder on,
      daily at the time you chose.
- [ ] Repeat with **Not now, start reading** (after clearing data): no permission prompt; Today
      shows the "A Kural every morning?" card.

## 2. Upgrade from 1.2

- [ ] No welcome screens.
- [ ] Streak, saved Kurals, reading history and quiz scores are all still there.
- [ ] Theme: if you had Light / Dark / Sepia, you now have Paper / Night / Palm leaf.
- [ ] If daily reminders were on before, Streak reminder is now on too.

## 3. Today

- [ ] வணக்கம், today's date, and the week strip with today ticked.
- [ ] Today's Kural: number, அதிகாரம் and position (e.g. 9/10), chapter in Tamil and English.
- [ ] Meaning is open; switch தமிழ் / English.
- [ ] "Keep reading this chapter" opens the chapter's first unread Kural; **Next** goes through
      the chapter; the 10 dots fill as you read.
- [ ] Your journey numbers go up after reading.
- [ ] Random Kural opens a sheet; Share the app opens the share sheet with the store link.
- [ ] The search button opens Search; back returns to Today.
- [ ] Pull down to refresh works.

## 4. Kural card actions

- [ ] **Save** turns to Saved (saffron); the Kural appears in the Saved tab.
- [ ] **Listen** reads line 1, a short pause, then line 2, in a Tamil voice. Tap again to stop.
      Closing the sheet while it speaks stops it.
- [ ] **Share** → Share image: try each style, toggle Tamil / English / Explanation; the image
      shared to WhatsApp or Photos matches the preview. Share text and Copy text work.
- [ ] Android back closes any open sheet (Kural, share, voice).

## 5. Learn by heart

- [ ] On a Kural, **Learn** opens Memorize at Step 1 of 4.
- [ ] Next step hides every other word; tap a hidden word to peek.
- [ ] Step 3 shows first words only; Step 4 hides everything.
- [ ] Listen slowly is slower than normal Listen. Meaning shows the English hint.
- [ ] Check my recall → I knew it → "Committed to memory". The card's button now says Learning.
- [ ] Learn tab: "All caught up · Next review: tomorrow"; your Kural is listed with 7 dots.
- [ ] **Review tomorrow, today**: set the phone's date one day ahead (Settings → System → Date &
      time, turn off automatic). Reopen the app: Today shows "1 Kural to review today", the Learn
      tab has a badge, and Start review opens the Kural fully hidden ("From memory"). Grade it.
      Set the date back to automatic afterwards.
- [ ] Tapping a Kural in Your Kurals that isn't due opens practice: it ends with Again / Done and
      doesn't change its next review.

## 6. Quiz (Learn → Quiz)

- [ ] Missing word, Meaning, Chapter, Jumbled: each gives sensible questions.
- [ ] Right/wrong colours are clear; the screen scrolls to the result and Next question.
- [ ] Jumbled: tap a placed word to take it back; Check answer needs every word.

## 7. Browse and Search

- [ ] Browse: All / Virtue / Wealth / Love filters; part (இயல்) labels inside each book.
- [ ] Chapter 71 shows only Kurals 701–710.
- [ ] Inside a chapter: ‹ › move to the previous/next chapter; Android back returns to the list.
- [ ] A fully read chapter shows a tick.
- [ ] Search `7` shows only Kural 7; a Tamil word (அன்பு) and an English word (Patience) give
      results; suggested topics and recent searches work; Clear empties recents.

## 8. Saved and You

- [ ] Saved: newest first; tapping the bookmark removes it, **Undo** brings it back.
- [ ] You: stat tiles, milestones (First step is earned), Reading history, About the Thirukkural.
- [ ] Look → Page: Auto, Paper, Palm leaf, Night; Accent: Indigo, Kumkum, Leaf, Saffron. Check a
      few combinations across Today, Learn and a share image.
- [ ] Look → Font: Classic, Modern, Device change the couplet, explanation and headings.
- [ ] Reading: language (Both / தமிழ் / English), text size S–XL (preview updates), reading speed.
- [ ] Auto page follows the phone's dark mode (toggle it in quick settings).
- [ ] Reset progress asks first, clears history / streak / learning / quiz, keeps Saved.

## 9. Reminders

- [ ] You → Reminders → **Send a test reminder**, lock the phone: within ~10 seconds a
      notification shows today's Kural with the palm-leaf icon in the status bar.
- [ ] Tapping it opens the app on Today.
- [ ] **Daily**: set the daily time 2–3 minutes ahead, close the app (swipe it away), wait.
      The notification names that day's Kural. Android may deliver it a few minutes late.
- [ ] **Streak** (opening the app counts as reading, so don't open it after changing the date):
      1. In You → Reminders set the streak reminder to, say, 8:00 PM.
      2. Read today's Kural, then close the app (swipe it away).
      3. In Android settings turn off automatic date & time and set **tomorrow, 7:58 PM**.
      4. Wait about two minutes: "Keep your N-day streak" arrives.
      5. Set date & time back to automatic.
- [ ] Open the app on a day you haven't read yet before the streak time, read, and confirm no
      streak reminder arrives that evening.
- [ ] Restart the phone with reminders on; the next one still arrives.
- [ ] Turn notifications off for the app in Android settings, return to the app: both reminder
      switches turn off. Turning one on again asks for permission.
- [ ] Android Settings → Apps → Kural Daily → Notifications lists **Daily Kural** and
      **Streak reminder** as separate categories.

## 10. Voice

- [ ] You → Listening → Reading voice lists Tamil voices, best first, with Natural/Recommended
      labels; ▶ previews each; picking one changes Listen.
- [ ] **Install Tamil voices** (and the Download voices button in the voice sheet) opens Google's
      voice download screen. Download Tamil (India), come back, tap refresh: new voices appear.
- [ ] Voice settings opens Android's text-to-speech settings.

## 11. Icon and system

- [ ] Home screen icon: palm leaves with அ, nothing cropped (try your launcher's icon shapes if it
      has them).
- [ ] Android 13+: turn on Themed icons (wallpaper settings) — a single-colour palm-leaf icon.
- [ ] Airplane mode: everything except sharing to other apps still works.
- [ ] Phone font size set to Largest: text stays readable, nothing overlaps badly.

## Reporting

For each problem note: the step number, what you expected, what happened, and a screenshot or
screen recording. Phone model and Android version help too.

## After testing

1. Merge the pull request.
2. Change `## 1.3.0 (in testing)` in CHANGELOG.md to the release date.
3. `npx eas-cli@latest build --profile production --platform android`, then commit the bumped
   `versionCode` in app.json.
4. Create the GitHub release `v1.3.0` from `master` with the 1.3.0 changelog section.
5. Check `STORE_URL` in `constants/app.ts` matches the live store listing.
