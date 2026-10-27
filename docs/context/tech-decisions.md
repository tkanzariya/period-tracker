# Tech Decisions

Last updated: 2026-10-27

## Stack (CONFIRMED 2026-10-27)
- **React Native with Expo (TypeScript)**, scaffolded in `app/` from the `blank-typescript` template. Installed: Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6. Expo = framework/toolchain on top of React Native that handles native config, dev workflow and builds. Tirth already knows RN.
- **expo-sqlite** for on-device storage (installed).
- Android package id `dev.cadence.app` (placeholder; changing it later means a fresh install, fine while Drashti is the only user).
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

### Working without the phone: browser preview (added 2026-10-27)
- The app runs in a browser: from `app/` run `npx expo start --web --port 8082` (needs `react-native-web`, `react-dom`, `@expo/metro-runtime`; `app/metro.config.js` adds the WebAssembly + cross-origin headers that web SQLite needs; it does not affect the phone build). Data lives in the browser's own storage, separate from the phone.
- `node scripts/preview-shots.js [outDir]` (uses `playwright-core` + the Edge already on Windows, headless) loads sample data and screenshots Today, Calendar, My cycles, Settings. `SCHEME=dark` for dark mode. Use this instead of Claude's browser pane, which does not run properly while the Claude window is hidden.
- Web-only dev hook: `window.__cadence.restore(text)` (in `state/data.tsx`, `__DEV__` + web only) loads a backup file's text; the screenshot script uses it for sample data.
- `ui/dialog.ts` wraps alerts/confirms (React Native's `Alert` does nothing on web); `platform/files.ts` saves (share sheet on phone, download on web) and picks files.
- Browser preview does not replace phone testing (native SQLite, share sheet, file picker, system fonts and safe areas differ).

### Backup file (built 2026-10-27)
- JSON `{format:"cadence-backup", schema_version, exported_at, app_version, data:{periods, daily_logs, settings}}`; rows keep UUIDs and timestamps, including deleted rows. Logic is pure and tested in `domain/backup.ts`; DB part in `db/backup.ts`.
- Restore merges by id (newer `updated_at` wins), skips a second active period/note for the same date, rejects files from a newer schema or with any bad row (nothing changes), ignores unknown fields. Running it twice changes nothing.
- CSV for doctors: `periodsToCsv` (Period started, Period ended, Period length, Cycle length, Note).

### Dev loop lessons (2026-10-27)
- After the first install, edit code and it reloads on the phone only if the dev server is a normal one: `npx expo start --dev-client` from `app/` (NOT with `CI=1`, which stops file watching). Reopen the app with `adb shell am start -a android.intent.action.VIEW -d "cadence://?__expo_url=http%3A%2F%2F<PC-IP>%3A8081" dev.cadence.app`.
- Only rebuild (`android-run.ps1`) after adding native modules, changing `app.json`, or changing icons (then run `npx expo prebuild --platform android --clean --no-install` first so the generated `android/` is regenerated).
- A "completed" background task does not mean the build worked; read the log for `BUILD SUCCESSFUL` and check the phone. Old dev servers can lock `build.log`; stop them first.
- If `adb devices` is empty/hangs: `taskkill /F /IM adb.exe`, restart `adb start-server`, unlock the phone and replug USB.
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
