# Tech Decisions

Last updated: 2026-10-27

## Stack (CONFIRMED 2026-10-27)
- **React Native with Expo (TypeScript)**, scaffolded in `app/` from the `blank-typescript` template. Installed: Expo SDK 58, React Native 0.88, React 19.3, TypeScript 6. Expo = framework/toolchain on top of React Native that handles native config, dev workflow and builds. Tirth already knows RN.
- **expo-sqlite** for on-device storage (installed).
- Android package id `dev.cadence.app` (placeholder; changing it later means a fresh install, fine while Drashti is the only user).
- The scaffold's `app/.claude/settings.json` enables the official `expo@claude-plugins-official` plugin (Expo's skills).
- Navigation (Expo Router vs plain) not yet chosen; decide at start of Phase 1.
- **APK builds**: local Gradle build (free, needs Android Studio/SDK) or EAS Build free tier (limited, queued). Prefer local to guarantee zero cost.
- Alternative considered: native Kotlin + Room + Compose. Rejected for now: RN keeps iOS/web possible later and is faster solo.

## Source control
- Remote: https://github.com/tkanzariya/period-tracker (branch `main`). All code and docs go through git and are pushed.
- Never commit: keystores, `.env`, APKs, exported cycle data (see `.gitignore`).

## Dev environment
- Windows 10, Node v26, Git 2.55. `gh` CLI and `adb` not installed/on PATH yet. Test device: Tirth's Android phone, USB debugging on.

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
