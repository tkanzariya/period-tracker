# Product Vision

Last updated: 2026-11-17

## The idea
A period/cycle tracking app that collects cycle data, learns the user's pattern, predicts the next cycle, and adapts to irregularities. Over time it produces useful insights and AI suggestions, and a medical-history record the user can share with doctors.

## Why
Drashti is a nurse and sees gaps in existing apps (to be documented in `research.md`). Tirth builds the solution.

## Target user
- Now: Drashti (first user, clinical reviewer).
- Next (Tirth, 2026-11-17): women in India in general. The app should be easy, really helpful during periods, and have a few things other apps do not do or do badly (see `improvement-plan.md`).

## Principles
1. **Honest predictions**: show ranges and confidence, widen for irregular cycles; never fake precision.
2. **Clinically sound**: thresholds and wording validated by Drashti.
3. **Her data stays hers**: local-first, easy export/import, no required account.
4. **Doctor-ready**: history exportable as a clean report (PDF/CSV).
5. **Simple first**: do basic tracking really well before adding AI.

## Non-goals (for now)
- Diagnosis or medical advice.
- Social features. (Ads are no longer a non-goal: Tirth wants AdMob ads later, placement decided in `improvement-plan.md` section 4; not built.)
- iOS, web, cloud accounts, sync (planned later, not now).
- Public release / app store listing: not yet, but ads will need it (open question 1n).
- Privacy-law compliance work (deferred until a public release is considered).

## Feature scope by phase
See `roadmap.md`. Detailed feature planning is a Phase 0 deliverable (not yet done).
