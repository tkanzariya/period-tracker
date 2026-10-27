# Tech Decisions

Last updated: 2026-10-27

## Stack (CONFIRMED 2026-10-27)
- **React Native with Expo (TypeScript)**, scaffolded in `app/` from the `blank-typescript` template. Installed: Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6. Expo = framework/toolchain on top of React Native that handles native config, dev workflow and builds. Tirth already knows RN.
- **expo-sqlite** for on-device storage (installed).
- Android package id `com.cyclesaathi.app`, URL scheme `cyclesaathi`, database file `cycle-saathi.db`. (Renamed from the working name Cadence on 2026-10-27; the id differs, so the renamed app installs as a NEW app and does not see the old app's data. Fine: only test data existed. Changing the id after Drashti starts using it would lose her data on the phone.)
- The scaffold's `app/.claude/settings.json` enables the official `expo@claude-plugins-official` plugin (Expo's skills).
- **Navigation: Expo Router** (file-based, `app/src/app/`), bottom tabs (Today, Calendar, History, Settings) + a modal `log` route. Chosen 2026-10-27.
- Tests: **Vitest** for pure logic (`npm test`). Installed with `--legacy-peer-deps` because `react-dom` (pulled by router) wants React 19.3.1 while Expo pins 19.3.0; `vite` added explicitly for the same reason.
- Icons: `@expo/vector-icons` (Ionicons) + `expo-font`. IDs: `expo-crypto` `randomUUID()`.

## Code layout (`app/src/`)
- `config/cycleRules.ts`: every tunable number.
- `domain/`: pure TypeScript, no React or DB imports, fully unit-tested: `dates` (timezone-safe YYYY-MM-DD math), `cycles` (lengths, stats, regularity), `prediction` (next-period range, ovulation estimate), `phases` (`getDayInfo`: phase, fertile window, lower-fertility, predicted period, days late), `flags` (irregularity flags), `logging` (validation).
- `db/`: `migrations.ts` (append-only, version in `PRAGMA user_version`), `repository.ts` (soft deletes, UUIDs).
- `state/data.tsx`: React context loading periods/logs and exposing log actions.
- `theme/tokens.ts`, `ui/` (components, copy, formatting), `app/` (routes).
- Rule: screens contain no cycle maths; they call `domain/`. Wording lives in `ui/copy.ts`.
- **APK builds**: local Gradle build (free, needs Android Studio/SDK) or EAS Build free tier (limited, queued). Prefer local to guarantee zero cost.
- Alternative considered: native Kotlin + Room + Compose. Rejected for now: RN keeps iOS/web possible later and is faster solo.

## Source control
- Remote: https://github.com/tkanzariya/period-tracker (branch `main`). All code and docs go through git and are pushed.
- Never commit: keystores, `.env`, APKs, exported cycle data (see `.gitignore`).

## Dev environment
- Windows 10, Node v26, Git 2.55. `gh` CLI not installed.
- JDK 17 (Temurin) at `C:\Program Files\Eclipse Adoptium\jdk-17.0.20.101-hotspot`; `JAVA_HOME` set (user env).
- Android SDK at `D:\Android\Sdk` (C: is nearly full): cmdline-tools, platform-tools (adb), platform android-36, build-tools 36.0.0. `ANDROID_HOME` set and platform-tools on user PATH (open a new terminal to pick up). Licenses accepted.
- Test device: Tirth's Android phone (serial RZCY90LRNLA), USB debugging on. Must tap "Allow" on the phone's RSA prompt for adb to authorize.

## Build and run (verified 2026-10-27)
- **Use `scripts/android-run.ps1`** (it sets env vars incl. `ANDROID_CXX_STAGING_DIR=D:\cx`, then runs `npx expo run:android`, which builds a debug APK, installs it and starts Metro).
- Why: Windows' 260-character path limit broke the C++ build for `react-native-screens` once Expo Router was added; the build mirrors the long project path (`D:\Period Tracker\app\...`) inside its output folder. Fix: config plugin `app/plugins/withShortCxxDir.js` moves only the C++ build output to a short folder when that env var is set. Symptom if it recurs: ninja "No such file or directory" in a `.cxx` path.
- Tried and rejected: mapping the repo to a short drive letter with `subst`. Windows resolves it back to the real path for some tools (Gradle) but not others (Node codegen), giving "different roots" errors. Another fix: enable Windows long paths (system setting; Tirth would have to do it himself). First build is slow (Gradle, NDK, C++ compile); later builds are fast and code edits hot-reload.
- `app/android/` is generated (gitignored); the source of truth is `app.json` and config plugins.
- Gradle cache lives on C: (`C:\Users\Hp\.gradle`, C: is tight); move with `GRADLE_USER_HOME` to D: if it grows.
- A shareable release APK for Drashti is a later step (needs a signing key kept out of git).

### What runs where (2026-10-28)
- **Cloud (GitHub Actions, free):** building the APK, signing and publishing releases (done). Can also run, not yet set up: automatic tests + type check + `expo-doctor` on every push (~3 min), and headless-browser screenshots of every screen in light/dark.
- **Local only:** editing code with Claude, live reload while testing on the phone (needs the cable), the interactive browser preview, backing up the signing key, installing and trying the app on a phone.
- **Local fallback only:** `scripts/build-apk.bat` (use only if GitHub is unavailable). Nothing heavy should be left running: the build scripts stop Gradle helpers; the dev servers are stopped when not testing.

### Where files live (Tirth's preference, 2026-10-28: keep things inside the project folder in subfolders, not scattered on D:)
- Inside `D:\Period Tracker\`: `app/` (the app), `docs/`, `design/`, `scripts/`, `dist/` (built APKs, git-ignored), `local/` (private files, git-ignored; `local\keys\` = signing key).
- Outside, on purpose, because they cannot go inside: `D:\cs` (short-path copy used for release builds) and `D:\c` (C++ build output). Their paths MUST be very short: Windows rejects folder paths over 248 characters and the C++ build nests deeply, so putting them under `D:\Period Tracker\...` makes the release build fail. Both are disposable caches (safe to delete; the next build recreates them). `D:\Android\Sdk` (Android tools) and `C:\Program Files\Eclipse Adoptium\...` (Java) are installed tools.
- Leftovers safe to delete: `D:\cx` (old build cache, my delete was blocked), `D:\CycleSaathi-keys` (old key copy, after backups are done).
- New rule for Claude: save new files inside the project folder in a sensible subfolder; do not create new folders at the root of D:.

### Release signing key (created 2026-10-28)
- Why: Android only updates an installed app if the new file is signed with the SAME key. Lose or change the key and Drashti must uninstall (losing her data) to update. So: one key, for life, backed up.
- Where: `local\keys\` (inside the project folder but git-ignored via `/local/`; never commit, never paste in chat). Files: `cycle-saathi-release.jks` (the key, PKCS12, RSA 4096, valid to 2056, alias `cycle-saathi`), `signing.env` (what the local build reads), `keystore-for-github.txt` (base64, for the GitHub secret), `READ-ME-FIRST.txt`. **Tirth must back this folder up in two places** (e.g. private Drive + USB). Certificate fingerprint (public, for checking a file is ours) SHA-256: `86:24:DE:65:51:32:37:3B:10:35:2E:11:72:DC:AA:4C:31:0B:2C:2F:FB:D0:E4:B5:86:33:73:5B:2A:9E:04:B0`.
- How it is used: plugin `app/plugins/withReleaseSigning.js` signs the release when `CS_KEYSTORE_FILE`, `CS_KEYSTORE_PASSWORD`, `CS_KEY_ALIAS`, `CS_KEY_PASSWORD` are set. `scripts/build-apk.ps1` loads them from `signing.env` automatically. The GitHub workflow gets them from four repository secrets (`KEYSTORE_BASE64`, `KEYSTORE_PASSWORD`, `KEY_ALIAS`, `KEY_PASSWORD`, added by Tirth in repo Settings > Secrets and variables > Actions; Claude must not type secrets into web pages). Without the key, builds fall back to the Expo test key (fine for testing).
- Releases: pushing a tag like `v1.0.0` makes the workflow build, sign, check the signature (prints the key fingerprint) and publish a GitHub Release with the .apk. It refuses to publish if the secrets are missing. Each release needs a higher `android.versionCode` in `app.json` (and a new `version`), or Android will not treat it as an update.
- Test builds signed with the old test key cannot be updated in place by a release-signed file: uninstall the test version first.

### Cloud build on GitHub (added 2026-10-27, free)
- Workflow `.github/workflows/build-apk.yml` builds the release APK on GitHub's machines (Linux, more RAM/CPU than the dev PC, no Windows path-length problem). Cost: free (public repo: unlimited; private repo: ~2,000 minutes/month, a build is ~15 min).
- **How Tirth uses it:** GitHub repo > **Actions** tab > "Build app file (APK)" > **Run workflow** > wait ~10-20 min > open the run > download **CycleSaathi-apk** (a .zip containing `CycleSaathi-v<version>.apk`). The run also shows the APK size as a notice and in the summary. It runs by itself only when the workflow file changes.
- The APK is signed with the standard Expo debug key (fine for sideloading to test; a proper release key comes before Drashti relies on updates, see roadmap). A different signing key means Android refuses to update in place: she would have to uninstall first and lose her data, so settle the key before real use.
- Local fallback: `scripts/build-apk.bat` (copies the project to `D:\cs`, builds there: the release build's C++ folders exceed Windows' 248-character folder limit under `D:\Period Tracker\...`). The copy uses ~1.2 GB on D: (`node_modules`). Needs ~8 GB free RAM; the script stops leftover Gradle helpers first. Gradle memory is set to 3 GB (4 GB made the C++ compiler crash on this 16 GB PC).
- The repo is **public** (checked 2026-10-27): code and docs are readable by anyone. No health data is in it, but `people.md` names Drashti and her job. Making it private is Tirth's call (cloud builds still work).

### One-click scripts (added 2026-10-27; double-click in `scripts/`)
- `build-apk.bat`: builds a standalone release APK (code inside, runs on its own) with live Gradle progress, copies it to `dist\CycleSaathi-v<version>.apk`, prints its size, beeps, opens the folder. No phone needed. This is the file to give Drashti.
- `build-phone.bat`: builds the debug version, installs it on the connected phone, starts live reload. Only needed after native changes.
- `preview-web.bat`: makes fake sample data and starts the browser version (no phone). Load `app/sample-data/sample-backup.json` through Settings > "Bring my information back".
- Why progress used to be invisible: `expo run:android` hides Gradle's output. The scripts call `gradlew` directly, so the % bar and task names show.
- Why builds are slow: older 4-core CPU (i7-4770S, 2013), ~15 native libraries incl. C++, Gradle had only 2 GB memory, and release builds compiled for 4 CPU types. Typical now: first/clean build ~8 min, later ~3 min. JS-only changes (screens, wording, logic) need NO rebuild: the phone/browser reloads live.
- Build tuning is in `app.json` + `plugins/withFasterGradle.js` (more Gradle memory, build cache) and applies on every `expo prebuild`.

### APK size (kept small from the start)
- `buildArchs: ["arm64-v8a"]` (only 64-bit phones; drops 32-bit and PC-emulator CPU types, ~3/4 of native code), R8 minify + resource shrinking in release, GIF support off (unused), Hermes on, no unused image/font families. Debug builds are larger (~61 MB) and are not what Drashti gets.
- Measure with `build-apk.bat` (it prints the size) or the "App file size" notice on a cloud run. **Baseline (2026-10-27, first release build): 29.4 MB** (local) / ~30 MB (cloud). Most of it is native libraries stored uncompressed inside the APK: `libreactnative.so` 7.0 MB, `classes.dex` 5.1 MB (2.3 packed), JS bundle 2.7 MB, `libhermesvm.so` 2.6 MB, `libexpo-sqlite.so` 1.8 MB, `libexpo-modules-core.so` 1.5 MB, `libappmodules.so` 1.4 MB, Ionicons font 1.25 MB, `libc++_shared.so` 1.2 MB, screens/svg codegen libs ~2 MB. (GitHub's artifact download is a zip of the APK, so it shows ~13.5 MB: that is not the APK size.)
- Applied next: `useLegacyPackaging: true` (libraries compressed inside the APK: the file you share gets much smaller, installed size is a bit bigger) and `enableBundleCompression: true` (compressed JS bundle; slightly slower first start). **Result (cloud run on commit 5989b30, 2026-10-28): the APK is ~14 MB, down from ~30 MB.** Not yet installed and run on a phone: do that before trusting it (compressed libraries and a compressed JS bundle are standard Android features, but verify first start and that backup/restore, share sheet and file picker still work).
- Later ideas (not done): replace the Ionicons font (1.25 MB) with the few icons we use as SVG; trim languages in resources; review each Expo module for removal; re-check after Phase 2 features.
- Trade-off: a 32-bit-only phone or an x86 emulator cannot run it. To use an emulator later, add `x86_64` to `buildArchs` temporarily.

### Testing on the PC without a phone (decision 2026-10-27)
1. **Automated tests** (`npm test`, 72 now): all cycle/backup logic.
2. **Browser preview** (`preview-web.bat`, plus `node scripts/preview-shots.js` for screenshots): every screen and flow with real SQLite.
3. **Phone** only for native things (share sheet, file picker, fonts, safe areas) and final checks, using the built APK.
- Android emulator is NOT set up: this PC's CPU virtualization is switched off in the BIOS (`VirtualizationFirmwareEnabled: False`, no hypervisor), so an emulator would be unusably slow. It needs "Intel Virtualization Technology" enabled in BIOS plus Windows Hypervisor Platform (system changes Tirth must make himself) and a ~1.5 GB download. Low value given steps 1 and 2; revisit only if needed.

### Working without the phone: browser preview (added 2026-10-27)
- The app runs in a browser: from `app/` run `npx expo start --web --port 8082` (needs `react-native-web`, `react-dom`, `@expo/metro-runtime`; `app/metro.config.js` adds the WebAssembly + cross-origin headers that web SQLite needs; it does not affect the phone build). Data lives in the browser's own storage, separate from the phone.
- `node scripts/preview-shots.js [outDir]` (uses `playwright-core` + the Edge already on Windows, headless) loads sample data and screenshots Today, Calendar, My cycles, Settings. `SCHEME=dark` for dark mode. Use this instead of Claude's browser pane, which does not run properly while the Claude window is hidden.
- Web-only dev hook: `window.__cycleSaathi.restore(text)` (in `state/data.tsx`, `__DEV__` + web only) loads a backup file's text; the screenshot script uses it for sample data.
- `ui/dialog.ts` wraps alerts/confirms (React Native's `Alert` does nothing on web); `platform/files.ts` saves (share sheet on phone, download on web) and picks files.
- Browser preview does not replace phone testing (native SQLite, share sheet, file picker, system fonts and safe areas differ).

### Backup file (built 2026-10-27)
- JSON `{format:"cycle-saathi-backup" (files with the old "cadence-backup" format are still accepted), schema_version, exported_at, app_version, data:{periods, daily_logs, settings}}`; rows keep UUIDs and timestamps, including deleted rows. Logic is pure and tested in `domain/backup.ts`; DB part in `db/backup.ts`.
- Restore merges by id (newer `updated_at` wins), skips a second active period/note for the same date, rejects files from a newer schema or with any bad row (nothing changes), ignores unknown fields. Running it twice changes nothing.
- CSV for doctors: `periodsToCsv` (Period started, Period ended, Period length, Cycle length, Note).

### Dev loop lessons (2026-10-27)
- After the first install, edit code and it reloads on the phone only if the dev server is a normal one: `npx expo start --dev-client` from `app/` (NOT with `CI=1`, which stops file watching). Reopen the app with `adb shell am start -a android.intent.action.VIEW -d "cadence://?__expo_url=http%3A%2F%2F<PC-IP>%3A8081" dev.cadence.app`.
- Only rebuild (`android-run.ps1`) after adding native modules, changing `app.json`, or changing icons (then run `npx expo prebuild --platform android --clean --no-install` first so the generated `android/` is regenerated).
- A "completed" background task does not mean the build worked; read the log for `BUILD SUCCESSFUL` and check the phone. Old dev servers can lock `build.log`; stop them first.
- If `adb devices` is empty/hangs: `taskkill /F /IM adb.exe`, restart `adb start-server`, unlock the phone and replug USB.
- Phone checks without touching the user's files: screenshots via `adb exec-out screencap -p > file.png` (use Bash, not PowerShell, which corrupts the PNG), taps via `adb shell input tap x y` (screenshot is shown scaled; multiply by 1.17). Git Bash rewrites `/sdcard/...` paths: use `MSYS_NO_PATHCONV=1` or PowerShell for `adb push/shell` with phone paths. In the Android file picker, search for the test file name instead of browsing.
- Google Play Protect may show "Send app for a security check?" on install. "Don't send" is fine.

## Data portability rules (hard requirement)
So that moving to a cloud DB later is a script, not a rewrite:
1. **IDs are UUIDs** (generated on device), never auto-increment integers.
2. **Dates**: calendar days stored as `YYYY-MM-DD` (local date, no timezone); timestamps as UTC ISO-8601.
3. **Every row has** `id`, `created_at`, `updated_at`, `deleted_at` (soft delete) so sync/merge is possible later.
4. **Schema is versioned** with numbered migrations; DB records its schema version.
5. **Export format**: a single JSON file `{ schema_version, exported_at, app_version, data: { ... } }`, plus CSV per table for human/doctor use. Import must validate and be idempotent (re-importing doesn't duplicate, thanks to UUIDs).
6. **Tables are relational and Postgres-friendly** (simple types, no SQLite-only tricks), so the same shape maps to Supabase/Postgres or Firebase later.
7. **Derived values** (cycle length, predictions) are computed, not stored as source of truth; only raw logs are stored.
8. Automated backup file the user can copy off the phone (manual export button in Phase 1).

## Prediction approach (v1)
Rolling average of last 3-6 cycles; output a date range; range widens with cycle variability; irregularity flags per rules Drashti confirms. No AI in v1. Thresholds marked `NEEDS DRASHTI REVIEW`.

## Future cloud (not now)
Likely a free tier (e.g. Supabase or Firebase). Decide only when needed. Not a current commitment.
