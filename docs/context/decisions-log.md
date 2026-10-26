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
- Dev phone is connected with USB debugging; `adb`/Android SDK not found on PATH yet (needs setup before first build).
