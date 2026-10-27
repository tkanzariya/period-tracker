# Decisions Log (append-only)

Last updated: 2026-10-27

## 2026-10-26
- Project goal set: cycle-tracking app for Drashti, built solo by Tirth. Start with basic tracking, then improve.
- Drashti researches existing apps in parallel while Tirth builds the foundation.

## 2026-10-27
- **Platform: Android only**, APK distribution. Why: Tirth's choice; avoids Play Store fee.
- **Storage: local on-device**, with easy export/import for later cloud migration. Why: zero cost, privacy, simplicity.
- **Audience: Drashti only for now.** Privacy-law work deferred.
- **Budget: zero/minimal** is a hard constraint.
- **Phase 0 must be solid**: plan features, design, logo before development.
- **Context rule**: all context kept in `docs/context/*.md`, updated every turn (rule in CLAUDE.md).
- **Stack confirmed**: Expo + React Native + TypeScript + expo-sqlite. Scaffolded in `app/`; typecheck and `expo-doctor` (20/20) pass.
- **Not named "Period Tracker"**: name will change. Working codename "Cadence" (placeholder, easy to rename).
- **Repo layout**: docs at root, Expo app in `app/`.
- **Feature plan** written (`features.md`) and **data model draft** (`data-model.md`): store only user input, calculate everything else.
- Tirth wants explanations logical rather than technical.

## 2026-10-27 (later)
- **Cycle phases added to Phase 1** (period, follicular, fertile window, ovulation estimate, luteal), calculated from start dates; ovulation ≈ 14 days before next predicted start. Why: requested by Tirth/Drashti; cheap to compute.
- **"Safe period" wording rejected**; proposed "Lower-fertility days (estimate)" + not-contraception note. Why: calendar method is unreliable and the word invites contraception use. Pending Drashti's confirmation.
- **Drashti reviewed** features.md and data-model.md: data model approved. Her phase feedback was not found in the repo files (asked Tirth for it).
- **Design principles** follow Apple HIG (dickwu/apple-design-skill), adapted for Android. Palette: primary rose #C9265F (dark #F2708F), off-white background #FBF6F2; AA contrast verified. Lock UI direction before building.
- **Git**: remote is https://github.com/tkanzariya/period-tracker. Rule: all code goes through git and is pushed.
- **Logo locked: concept A (Ring).** Git commit identity: `tkanzariya` (repo-local config; first commit was authored as kyrithbuilds).
- **Android toolchain** installed on D: (C: has only ~13 GB free): JDK 17 (Temurin, via winget) and Android SDK at `D:\Android\Sdk`.
- **Phases confirmed (Tirth):** Menstrual, Follicular, Ovulation, Luteal. Fertile window and lower-fertility days are overlays. "Lower-fertility days (estimate)" accepted instead of "safe period".
- **Day counts are configurable** in `app/src/config/cycleRules.ts`; defaults from published ranges (cycle 21-35d, luteal 14d, fertile window -5/+1 around ovulation, variation flag 7d). Why: Drashti isn't available to confirm; Tirth can tune later. Still `NEEDS DRASHTI REVIEW`.
- **First end-to-end run succeeded** on Tirth's phone (debug build, template screen). Pipeline proven: edit, build, install via USB.
- **Wireframes drafted** for 6 screen states (`design/wireframes.html`, specs in `design.md`). Decisions: 4-tab bottom nav, Log as bottom sheet, lower-fertility days hidden by default (opt-in in Settings), calendar uses non-colour markers (bar/star/dashed outline) so phases are not colour-only.
- **Build started**: domain logic first (pure, tested), then SQLite, then Today + Log screens. Navigation: Expo Router. Prediction range = expected ± max(1, ceil(std-dev of recent cycles)). Phase after the predicted start with no new period keeps showing luteal and raises a calm "past the expected range" flag. Logging rules: no future dates; a period start inside an existing period is refused; "period ended" closes the latest open period.
- **Feedback round (Tirth, relaying Drashti):** (1) wording too technical: rewrite everything in plain, personal, basic-English; (2) add a friendly guide lady and more graphics, app felt dull; (3) skip "flow" completely; (4) Drashti must be able to review all calculations without reading `cycleRules.ts`; (5) logo not visible (app icon was default). Actions: all wording moved to `ui/copy.ts` and rewritten; guide avatar + speech bubble + cycle ring built; flow removed (DB migration v2 drops the column); generated plain-language review sheet `docs/review/cycle-review.html`; icons generated from logo A; asks her name on first run; tabs renamed (History -> My cycles); Log sheet -> "Tell me".
- **Phone-free build (Tirth: "work on it without connecting my phone")**: built backup/restore, Settings, My cycles (+ edit/remove period) and Calendar, verified through a browser preview + headless Edge screenshots and scripted flow checks (add note, edit period, overlap refused, backup/CSV download, restore twice, bad file, delete). Not yet tested on the phone.
- Bug found and fixed by the flow checks: the edit-period screen showed today's dates when opened before data loaded (state initialised too early); the form now only mounts once the period is known. Also added `goBackOrHome` so closing a screen opened directly lands on Today.
- Decision: restore keeps what she already has when a row exists with the same id or the same date (never overwrites newer data); deleted rows travel in backups so a future cloud sync can learn about deletions.
- **Phone test (2026-10-27)**: new build installed and checked by screenshots on the real phone. Works: all four tabs, dark mode follows the phone, share sheet for the backup file, file picker, restore. Small fix after seeing it on device: a one-day period now reads "27 Oct", not "27–27 Oct" (test added, 72 tests). The test backup file I pushed to the phone's Download folder was removed again. Android Play Protect asks "Send app for a security check?" after each install; "Don't send" chosen.
- **Tirth's notes after the phone test (2026-10-27)**: (1) new logo supplied and applied (commit 621c00b, by a forked session); (2) rename the app to something relatable, not generic, containing "Cycle", and confirm with him before changing anything; (3) builds are slow and show no progress: wants a way to see progress and ideally generate builds himself in a few clicks to save tokens; (4) needs a way to test on the PC without the phone; (5) keep APK size minimal where possible. Actions: one-click scripts with live progress (`scripts/*.bat`), 64-bit-only + minify + shrink + more Gradle memory, browser preview as the PC test path (emulator not possible: BIOS virtualization off), name shortlist researched, release APK paused until the name is confirmed.
- **App name chosen: Cycle Saathi** (Tirth, 2026-10-27), from the shortlist Cycle Saathi / Cyclekind / Cycle Mitra. Why: contains "Cycle", relatable (saathi = companion in Hindi/Gujarati, fits the guide lady), no existing app found in a web search (trademark, Play Store and domain not checked). Rejected: names with "Sakhi" (several period trackers already use it), CycleWise (several iOS apps). Applied: app name/slug/scheme, Android package id com.cyclesaathi.app (installs as a new app), database file, backup format name (old cadence-backup files still readable), build output name, Settings footer shows the name, the guide introduces herself as "your Saathi".
- **Cloud builds approved (Tirth, 2026-10-27)**: builds on this PC are slow and fragile (2013 CPU, memory pressure, Windows path limit); connecting the phone does not help because the PC does the build. Added a free GitHub Actions workflow (`build-apk.yml`) so the APK can be built with a few clicks off-PC. Local builds kept as a fallback (short-path copy at D:\cs; Gradle 3 GB). Lessons: leftover Gradle daemons ate RAM and made the C++ compiler crash; a "completed" background task never proves a build worked.
- **Signing key and first release for Drashti (Tirth approved, 2026-10-28)**: generated one release key (outside the repo) so updates keep Drashti's data; builds sign with it locally and in the cloud; a `v*` tag publishes a signed APK as a GitHub Release (refuses without the key secrets). Passwords were generated by script and stored only in the key folder, never shown in chat. Secrets must be entered into GitHub by Tirth himself. Public Releases page chosen as the easiest way for Drashti to download (repo is currently public).
- **Changelog, release process and versioning (Tirth asked, 2026-10-28)**: added `CHANGELOG.md` (Keep a Changelog 1.1.0 + Semantic Versioning), `docs/context/release-process.md` (policy + checklist for every release + Play Store extras) and a mandatory rule in `CLAUDE.md` (changelog line in the same commit as each user-visible change; follow the checklist every release). The cloud build now refuses a release unless the tag, `app.json` version, versionCode (= MAJOR*10000 + MINOR*100 + PATCH) and a changelog section all agree, uses the changelog section as the release notes, and marks 0.x as a GitHub pre-release. Tirth's question: the first build is a test version, so should 1.0.0 be kept for the official Play Store launch? Recommendation: yes. Use 0.y.z for testers and 1.0.0 for the public launch. PENDING his confirmation: re-label the published v1.0.0 as v0.1.0 (nobody has installed it yet).
- Dev phone is connected with USB debugging; `adb`/Android SDK not found on PATH yet (needs setup before first build).

## 2026-10-27: Logo changed to Tirth's own sketch (drop + flowing line + sparkle + crescent)
- **Decision:** Replace concept A "Ring" with Tirth's sketch, redrawn as vector. Icon is full colour on blush `#FCEDE7`; themed icon is single colour; logo also shown in Settings.
- **Why:** Tirth had a specific design in mind; the Ring was a stand-in.
- **Alternatives rejected:** keeping the Ring on rose (superseded); keeping the "no gradients" icon rule (the sketch's gradients are the design).
