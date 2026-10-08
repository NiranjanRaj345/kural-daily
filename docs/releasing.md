# Releasing

## Version and notes

1. Bump the version in **both** `app.json` (`expo.version`) and `package.json` (`version`).
   The You tab shows the version from app.json.
2. Add a section to `CHANGELOG.md` for it.
3. If the privacy policy changed, update `PRIVACY.md` and You → Privacy policy in
   `app/(tabs)/profile.tsx` together, with the new date.
4. `npm run check` passes, and the [device test plan](testing.md) passes on a real phone.
5. Merge to `master`, date the changelog section (e.g. `## 1.3.0 (2026-10-08)`), and create the
   GitHub release `vX.Y.Z` from `master` with that section as the notes.

## Store builds

Build from `master` after merging. `production` builds bump `android.versionCode` in app.json
(EAS `autoIncrement`); commit that change after each build so the next build goes higher.

**Google Play** (Android App Bundle):

1. `npx eas-cli@latest build --profile production --platform android` → an `.aab`.
2. Play Console → create the app (*Kural Daily*, free, app). Package name comes from the first
   upload: `com.mrmonk.kuraldaily`, and can never change.
3. Upload the `.aab` to **Internal testing** first, install it from the Play link on your phone,
   then promote to Production. (New personal developer accounts must run a closed test with
   testers for a set period before Production is unlocked; the Console shows the current rule.)
4. Store listing: title, short and full description, the 512×512 icon (`assets/images/icon.png`
   scaled), a 1024×500 feature graphic, and at least two phone screenshots.
5. App content: privacy policy URL
   `https://github.com/NiranjanRaj345/kural-daily/blob/master/PRIVACY.md` (keep it in sync with
   You → Privacy policy in the app), Data safety: *no data collected or shared*, content rating
   questionnaire, target audience, no ads.
6. Once live, check `STORE_URL` in `constants/app.ts` matches the listing (it's used by
   *Share the app*).

**Samsung Galaxy Store** (Seller Portal, seller.samsungapps.com):

1. Build what Seller Portal asks for: an APK with
   `npx eas-cli@latest build --profile production-apk --platform android`, or the same `.aab`
   as Play if the upload page accepts bundles.
2. Use the same package name and EAS signing key as Play, so users can move between stores.
3. Same listing details, screenshots and privacy policy URL (`PRIVACY.md`). Samsung reviews each release; allow
   a few days.

Keep the version (`expo.version`) the same in both stores for a release.

**Forks** must use their own package name, EAS project (`expo.extra.eas.projectId` in app.json) and app name and icon; see the README.
