# Cycle Saathi — Claude Instructions

Read this file first in every session. It tells you how to work in this repo and where context lives.

**Naming:** the app is called **Cycle Saathi** ("saathi" = companion in Hindi/Gujarati; chosen by Tirth 2026-10-27). Never call the product "Period Tracker" or the old working name "Cadence" in code, UI or docs (old history entries in `decisions-log.md` may mention it). Android package id `com.cyclesaathi.app`, URL scheme `cyclesaathi`. Keep the name in as few places as possible (`app/app.json`, `app/package.json`, `ui/copy.ts` `STR.appName`) so renaming stays easy. The guide lady is "your Saathi" in the app's words.

**Layout:** docs and context at the repo root (`docs/context/`); the Expo app lives in `app/`. Run app commands from `app/`.

## What this project is (30-second version)
An Android cycle-tracking app built solo by Tirth (semi-technical PM, knows native Android + React Native) for his wife Drashti (a nurse, the clinical expert and first user). Local-first, zero cost, APK distribution. Long-term: predictions that adapt to irregular cycles, and a doctor-ready medical history export.

Full detail lives in `docs/context/`. Do not duplicate it here.

## Context files (the project's memory)
| File | Holds |
|---|---|
| `docs/context/people.md` | Who is involved, roles, skills, how to talk to them |
| `docs/context/product-vision.md` | The idea, goals, target user, principles, non-goals |
| `docs/context/constraints.md` | Budget, platform, privacy stance, timeline, working style |
| `docs/context/features.md` | Feature plan by phase, in plain language, and behaviour rules |
| `docs/context/data-model.md` | What we store vs calculate, portability rules in plain terms |
| `docs/context/tech-decisions.md` | Stack, architecture, data-portability rules and why |
| `docs/context/roadmap.md` | Phases, current phase, status of each item |
| `docs/context/research.md` | Competitor and clinical research (Drashti's findings go here) |
| `docs/context/design.md` | Brand, logo, UI direction, screens, design decisions |
| `docs/context/release-process.md` | Versioning policy, changelog rule, the release checklist (every release), Play Store extras |
| `docs/context/decisions-log.md` | Dated, append-only log of every decision and why |
| `docs/context/open-questions.md` | Unresolved questions and who owns them |

## RULE: Keep context current (mandatory)
Context is only useful if it stays true. Whenever something is learned or decided in conversation, **update the relevant file in the same turn, before ending it**. Do not wait to be asked.

1. **New fact about people, vision, budget, platform, constraints** → update the matching file.
2. **A decision is made** (even a small one) → append a dated entry to `decisions-log.md` (what, why, alternatives rejected) and reflect it in the topical file.
3. **A question is raised but not answered** → add to `open-questions.md` with an owner. When answered, move it to `decisions-log.md` and remove it from open questions.
4. **Work finishes or scope changes** → update status in `roadmap.md`.
5. **Something becomes outdated** → fix or delete it. Never leave contradicting statements in two files; the topical file is the source of truth, the log is history.
6. **A new kind of context appears** that fits no file → create a new file in `docs/context/` and add it to the table above.
7. Each context file starts with `Last updated: YYYY-MM-DD`; bump it on every edit.
8. Keep files short and skimmable. Facts and decisions, not chat transcripts.
9. At the end of a turn that changed context, say in one line which files you updated.

## Working agreements
- Tirth is non-expert in medicine; Drashti is non-technical. Explain tech to Drashti plainly; defer to Drashti on anything clinical. Never invent medical thresholds: mark them `NEEDS DRASHTI REVIEW` until she confirms.
- Cost must stay at zero or near-zero. Do not introduce paid services, subscriptions, or required accounts without asking.
- The app tracks and informs; it never diagnoses. Predictions are shown as ranges, never false-precision single dates.
- Data portability is a hard requirement (see `tech-decisions.md`). Don't make schema or storage choices that break it.
- Ask before: adding dependencies with ongoing cost, committing/pushing, anything outward-facing.
- **Git**: all code and docs go through git on `main` at https://github.com/tkanzariya/period-tracker and must be pushed; commit after each meaningful unit of work with a clear message. Never commit secrets, keystores, APKs or personal cycle data.
- **UI**: follow `docs/context/design.md` (Apple-HIG-based principles, colour tokens). Use tokens, never raw hex, in app code; WCAG AA contrast; 48dp touch targets; colour is never the only signal.
- **Changelog and releases (mandatory)**: keep `CHANGELOG.md` (Keep a Changelog format, Semantic Versioning) current. Every change the user can notice gets one plain-language line under `## [Unreleased]` in the SAME commit as the change. Every release follows `docs/context/release-process.md` (versioning policy, versionCode formula, the full checklist); do not skip steps. `0.y.z` = test builds for Drashti (GitHub "pre-release"), `1.0.0` = the public Play Store launch. Never reuse or move a published tag. The cloud build refuses a release whose tag, `app.json` version, versionCode or changelog section disagree.
- **File locations**: keep everything inside the project folder in subfolders (`local/` for private things, `dist/` for built files); never create new folders at the root of D:. The only exceptions are the two short-path build caches `D:\cs` and `D:\c`, which must stay short (see `tech-decisions.md`).
- **Signing key**: `local\keys\` holds the release key and its passwords. Never read the passwords aloud, print them, commit the folder, or type them into web pages; never delete or regenerate the key (it cannot be recovered and would strand Drashti's installs). Each release bumps `android.versionCode` and `version` in `app.json`.
- Never use the phrase "safe period" in the app; use "lower-fertility days (estimate)". Phase/fertility output is always an estimate and never contraception advice.
- **Code layout** is described in `tech-decisions.md`. Cycle maths lives only in `app/src/domain/` (pure, unit-tested; add tests with any change); never put it in screens. Run `npm test` and `npm run typecheck` in `app/` before committing. Build/run on phone: `powershell -File scripts\android-run.ps1` (moves the C++ build output to a short folder to avoid Windows' 260-char path limit; see tech-decisions).
- **Checking UI without a phone**: use the browser preview + `node scripts/preview-shots.js` (see tech-decisions). Always verify a UI change by looking at a screenshot or the phone, not just that it compiles or a build "completed".
- Expo changes between SDK versions. Before writing code against an Expo/RN API, check the installed `expo` version in `app/package.json` and the matching docs (https://docs.expo.dev/llms.txt); install packages with `npx expo install`; run `npx tsc --noEmit` before calling work done.
- Explain things to Tirth logically and plainly, not in heavy technical detail, unless he asks.
- Prefer simple over clever; this is a solo project that must stay maintainable.
