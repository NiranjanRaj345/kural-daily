# Releasing

## Version and notes

1. Bump the version in **both** `app.json` (`expo.version`) and `package.json` (`version`).
   The You tab shows the version from app.json.
2. Add a section to `CHANGELOG.md` for it.
3. If the privacy policy changed, update `PRIVACY.md` and You → Privacy policy in
   `app/(tabs)/profile.tsx` together, with the new date.
4. `npm run check` passes, and the [device test plan](testing.md) passes on a real phone.
5. Merge to `master`, date the changelog section (e.g. `## 1.3.0 (2026-10-08)`), and create the
   GitHub release `vX.Y.Z` from `master` with that section as the notes. Attach the APK that
   Google Play signed (see *One signing key everywhere* below), not an EAS-built APK.

## One-time setup (Aatra Labs accounts)

Kural Daily is published by Aatra Labs, with package ID `com.aatralabs.kuraldaily`, from the
Aatra Labs Expo account and Google Play Console. Once, on your computer:

1. `npx eas-cli@latest login` with the Aatra Labs Expo account (`npx eas-cli@latest whoami` to
   check).
2. `npx eas-cli@latest init` creates the EAS project under that account and writes its ID into
   `app.json` (`expo.extra.eas.projectId`). Commit that change.
3. The first `production` build asks to generate an Android keystore: let EAS create and keep it.
   This is the **upload key**. Play App Signing is on: Google generated and holds the **app
   signing key** that users' installs are signed with, and a lost upload key can be reset.
4. Back up the upload key: `npx eas-cli@latest credentials` → Android → production → download
   the keystore, and store it somewhere safe, not in this repository.

Builds signed by the old personal Expo account can't be installed over builds from this one
(the package ID and key are different): uninstall old test builds first.

## One signing key everywhere

Android only installs an update signed with the same key as the installed app. EAS builds are
signed with the upload key, but Play installs are signed with Google's app signing key. So every
APK given to the public (GitHub release, Galaxy Store) must be the one **Google Play signed**:

1. Upload the `.aab` to Play (any track).
2. Play Console → Test and release → **App bundle explorer** → choose the version →
   **Downloads** → **Signed, universal APK** → Download.
3. Attach that APK to the GitHub release as `kural-daily_vX.Y.Z.apk`, and upload the same file to
   Galaxy Store.

Then Play, GitHub and Galaxy installs can update each other. EAS `preview` and `production-apk`
builds are for your own testing only; never publish them.

## Store builds

Build from `master` after merging. `production` builds bump `android.versionCode` in app.json
(EAS `autoIncrement`); commit that change after each build so the next build goes higher.

**Google Play** (Android App Bundle):

1. `npx eas-cli@latest build --profile production --platform android` → an `.aab`.
2. Play Console → create the app (*Kural Daily*, free, app). Package name comes from the first
   upload: `com.aatralabs.kuraldaily`, and can never change.
3. Upload the `.aab` to **Internal testing** first, install it from the Play link on your phone,
   then promote to Production. (New personal developer accounts must run a closed test with
   testers for a set period before Production is unlocked; the Console shows the current rule.)
4. Store listing: title, short and full description, the 512×512 icon (`assets/images/icon.png`
   scaled), a 1024×500 feature graphic, and at least two phone screenshots.
5. App content: privacy policy URL
   `https://github.com/aatralabs/kural-daily/blob/master/PRIVACY.md` (keep it in sync with
   You → Privacy policy in the app), Data safety: *no data collected or shared*, content rating
   questionnaire, target audience, no ads.
6. Once live, check `STORE_URL` in `constants/app.ts` matches the listing (it's used by
   *Share the app*).

**Samsung Galaxy Store** (Seller Portal, seller.samsungapps.com):

1. Upload the Play-signed universal APK from *One signing key everywhere*, not an EAS build, so
   users can move between stores.
2. Same package name as Play (`com.aatralabs.kuraldaily`).
3. Same listing details, screenshots and privacy policy URL (`PRIVACY.md`). Samsung reviews each release; allow
   a few days.

Keep the version (`expo.version`) the same in both stores for a release.

**Forks** must use their own package name, EAS project (`expo.extra.eas.projectId` in app.json) and app name and icon; see the README.
