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
- From `app/`, with `JAVA_HOME`/`ANDROID_HOME` set: `npx expo run:android` builds a debug APK, installs it and starts Metro. First build is slow (Gradle, NDK, C++ compile); later builds are fast and code edits hot-reload.
- `app/android/` is generated (gitignored); the source of truth is `app.json` and config plugins.
- Gradle cache lives on C: (`C:\Users\Hp\.gradle`, C: is tight); move with `GRADLE_USER_HOME` to D: if it grows.
- A shareable release APK for Drashti is a later step (needs a signing key kept out of git).

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
