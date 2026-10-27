# Release Process

Last updated: 2026-10-28

Followed for EVERY release. The changelog is `CHANGELOG.md` at the repo root (Keep a Changelog format).

## Versioning policy (proposed 2026-10-28, see decisions-log)
- **Semantic Versioning: `MAJOR.MINOR.PATCH`**, tags are `vMAJOR.MINOR.PATCH` (no suffixes).
- **`0.y.z` = pre-release builds for testers** (Drashti), flagged as "Pre-release" on GitHub. Not the public launch.
  - `0.MINOR.0`: new features or noticeable changes. `0.MINOR.PATCH`: fixes only.
- **`1.0.0` = the first public launch** (the Play Store release), only after: Drashti signs off the cycle rules and wording, the privacy/legal basics are done, and the checklist's Play Store section is complete. After 1.0.0: MAJOR = a change that breaks existing users' data or habits, MINOR = new features, PATCH = fixes.
- **`versionName`** (`version` in `app/app.json`) = the version above.
- **`versionCode`** (`android.versionCode` in `app/app.json`) = `MAJOR*10000 + MINOR*100 + PATCH` (0.1.0 is 100, 0.2.3 is 203, 1.0.0 is 10000). Android and the Play Store need it to always go UP, so it is derived, never typed freehand. The cloud build checks it.
- Never reuse or move a published tag. A mistake in a release is fixed by a new PATCH release.
- Never change the signing key (see `tech-decisions.md`).

## The changelog rule
- Every change a user can notice gets one plain-language line under `## [Unreleased]` in `CHANGELOG.md`, **in the same commit as the change**.
- Sections: Added / Changed / Deprecated / Removed / Fixed / Security.
- At release time the Unreleased lines move under the new version heading with the date, and the comparison links at the bottom are updated.
- Pure internal work (refactors, docs, build scripts) is not listed unless it changes what the user sees or the app size/compatibility.
- The cloud build FAILS a release if its version has no section in `CHANGELOG.md`, and uses that section as the GitHub release notes.

## Release checklist (copy this for each release)
**Before**
- [ ] Decide the version number (policy above) and what is in it.
- [ ] `CHANGELOG.md`: everything user-visible is under Unreleased; wording is plain and accurate.
- [ ] In `app/`: `npm test` and `npm run typecheck` pass; `npx expo-doctor` is 20/20.
- [ ] Cycle rules or wording changed? Regenerate the review sheet (`npm run review-sheet`) and re-send it to Drashti if needed.
- [ ] Docs up to date (`roadmap.md`, `decisions-log.md`, `open-questions.md`).
- [ ] Signing key folder `local/keys/` exists and is backed up in two places; the four GitHub secrets are present.

**Cut the release**
- [ ] Move Unreleased lines under `## [X.Y.Z] - YYYY-MM-DD`; add an empty `## [Unreleased]`; update the links at the bottom.
- [ ] Set `version` and `android.versionCode` in `app/app.json` (formula above).
- [ ] Commit `Release vX.Y.Z` and push `main`.
- [ ] Create the annotated tag: `git tag -a vX.Y.Z -m "Cycle Saathi vX.Y.Z"` and `git push origin vX.Y.Z`.

**Verify**
- [ ] The GitHub Actions run succeeds; the run shows "Signed with key (SHA-256)" equal to `86:24:DE:65:51:32:37:3B:10:35:2E:11:72:DC:AA:4C:31:0B:2C:2F:FB:D0:E4:B5:86:33:73:5B:2A:9E:04:B0`.
- [ ] The Release page has the right notes, the .apk, and "Pre-release" ticked for 0.x versions.
- [ ] Download the public .apk and check it with `apksigner verify --print-certs` and `aapt2 dump badging` (package `com.cyclesaathi.app`, correct versionName/versionCode).
- [ ] Note the file size (target: stay near 14 MB; investigate any jump over ~2 MB).
- [ ] Install on a real phone: (a) over the previous version (data kept, no uninstall needed), (b) fresh install. Smoke test: first run asks the name; tell a period start and end; add a note; Calendar and My cycles show it; Settings "Save a copy" opens the share menu; "Bring my information back" works; dark mode looks right.

**Deliver and record**
- [ ] Send Drashti the Releases link (and the review sheet if it changed). Tell her what is new in plain words.
- [ ] Update `roadmap.md` (release published, size) and add a `decisions-log.md` entry for anything decided.
- [ ] Add problems found to `open-questions.md` and fix them in the next PATCH release.

## Extra steps for 1.0.0 and any Play Store upload (not done yet)
- [ ] Google Play developer account (one-time fee, a cost decision for Tirth: the project is zero-cost until now).
- [ ] The Play Store wants an **app bundle (.aab)**, not an .apk: add a `bundleRelease` build to the workflow.
- [ ] Privacy policy page (the app keeps data only on the phone; say so), Data safety form, content rating, target-audience answers.
- [ ] Store listing: name, short and long description, screenshots (the cloud screenshot job can make them), feature graphic, icon.
- [ ] Health-app rules: medical-disclaimer wording reviewed by Drashti; no diagnosis or contraception claims.
- [ ] Start with an internal or closed testing track before production.
- [ ] Check the name "Cycle Saathi" for trademark and Play Store clashes.
