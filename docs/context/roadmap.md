# Roadmap

Last updated: 2026-10-27

**Current phase: Phase 0 — Foundation & Planning**

## Phase 0 — Foundation & Planning (in progress)
- [x] Context system and CLAUDE.md rule
- [x] Confirm tech stack (Expo/RN, local SQLite)
- [ ] Drashti's competitor and clinical research -> `research.md`
- [x] Feature list draft (`features.md`) — needs Drashti's review
- [x] Data model draft (`data-model.md`) — needs Drashti's review
- [x] Project scaffolded in `app/` (installs, typechecks, doctor passes)
- [ ] App name (working codename: Cadence)
- [x] Logo concepts (3) and palette drafted -> pick one
- [x] UI direction + tokens drafted (`design.md`, `design/preview.html`) -> needs sign-off
- [x] Wireframes for all screens (Today, empty Today, Calendar, History, Log sheet, Settings) -> `design/wireframes.html`
- [ ] Sign-off on wireframes and palette (Tirth + Drashti), then lock design before building screens
- [ ] GitHub remote connected and pushed
- [x] Dev environment: JDK 17 + Android SDK installed on D:; phone detected (needs USB-debugging authorization)
- [x] First run on Tirth's phone (Samsung SM-S721B, Android 16): debug build via `npx expo run:android` installed and launched, 2026-10-27
- [ ] Runs on Drashti's phone (release APK, later)
- [ ] First git commit (waiting for Tirth's go-ahead)

## Phase 1 build progress (started 2026-10-27)
- [x] Cycle logic (dates, cycles, prediction, phases, irregularity flags, log validation) with 36 unit tests
- [x] SQLite schema v1 + repository (soft delete, UUIDs)
- [x] Expo Router shell: 4 tabs + Log modal; design tokens with light/dark
- [x] Today screen (empty state, cycle day, phase chip, next-period range, flags, log buttons)
- [x] Log screen (start / end / flow, note, date stepper, delete flow entry)
- [x] Calendar screen (phase tints, fertile bar, ovulation star, predicted-period outline, note on day, "Tell me about this day") — verified in browser preview 2026-10-27
- [x] My cycles screen (summary, last-cycles bar chart with usual range, list with tags, edit/delete a period)
- [x] Settings: name, save a copy (JSON), save a spreadsheet (CSV), bring information back (restore, safe to repeat) — verified in browser preview
- [ ] Rebuild and test on the phone (new native modules: expo-file-system, expo-sharing, expo-document-picker; phone not connected for this round)
- [ ] Settings still to do: theme choice, week start (Mon/Sun), reminders
- [x] App icon from logo A (adaptive + themed); splash uses the same mark
- [x] Plain-language rewrite, guide character, cycle ring, name on first run, flow removed (2026-10-27)
- [x] Review sheet for Drashti generated from the code (`npm run review-sheet`)
- [ ] Release APK for Drashti

## Phase 1 — MVP basic tracking
Log period start/end and flow, calendar + history, derived cycle stats, next-cycle range prediction, cycle phases (ovulation/fertile window estimates), irregularity flags, edit/delete, JSON/CSV export + import.

## Phase 2 — Richer data
Symptoms, pain, mood, notes, medications, reminders, fertile-window estimates (labelled as estimates).

## Phase 3 — Doctor-ready report
PDF/CSV medical-history export designed with Drashti.

## Phase 4 — Insights, AI, cloud
Pattern insights, AI summaries (Claude API; has a cost, decide later), optional cloud backup/sync.
