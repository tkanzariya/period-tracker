# Features

Last updated: 2026-10-27

Plain-language feature plan. Priorities: **Must** = MVP can't ship without it. **Should** = right after. **Later** = parked.
Anything clinical is `NEEDS DRASHTI REVIEW` until she signs off.

## Feedback that applies to EVERYTHING (Tirth, 2026-10-27)
1. **Wording must be plain and personal.** Someone with basic English should understand every screen. No technical words ("log", "cycle day", "phase" as headings). Short sentences. Friendly, warm, instructive: the app should say what to do and why.
2. **A friendly guide character** (an illustrated lady) talks to her in speech bubbles, uses her name, and makes the app feel alive, not dull. More graphics wherever they help (e.g. the cycle ring on Today).
3. **No "flow" feature at all** (no none/spotting/light/medium/heavy). Parked: if Drashti wants bleeding heaviness for doctors later, revisit then.
4. **Drashti must be able to review every calculation and every message without reading code.** Done via the generated review sheet `docs/review/cycle-review.html` (rebuild with `npm run review-sheet` in `app/` after any rule or wording change). Her answers come back as copied text.
All wording lives in `app/src/ui/copy.ts`.

## The core loop (what the app is really for)
1. She logs what happens (period starts, ends, how heavy, how she feels).
2. The app learns her pattern from those logs.
3. The app tells her when to expect the next one, honestly (a range, not a fake exact date).
4. When something looks unusual, it says so calmly and records it.
5. All of it can be handed to a doctor as a clean history.

## Phase 1 — MVP (Must)
| Feature | In plain words |
|---|---|
| "My period started" | Tell the app the day it started (today or an earlier day) |
| "My period ended" | Tell the app the day it ended |
| "Just a note" | Write a note for any day |
| Today screen | Greets her by name; guide's message; cycle ring with today's marker; current phase in plain words; next period range |
| Calendar | See past periods and predicted ones at a glance |
| History list | Every past cycle with its length |
| Edit / delete | Fix mistakes in any entry |
| Prediction | "Next period expected Nov 12–15" based on her own history |
| Irregularity notes | Gentle flags: late, early, unusually long/short, big variation |
| Backup export | One button saves all her data as a file she can keep |
| Restore import | Load that file back, no duplicates |

Not enough data yet? The app says "I need 2-3 cycles to predict" instead of guessing.

## Cycle phases (added 2026-10-27, in Phase 1)
Four phases (confirmed by Tirth): **Menstrual, Follicular, Ovulation, Luteal**. Everything is **calculated from her own period start dates and the predicted next start**, never stored. Always labelled "estimate".

**All day counts live in one editable file: `app/src/config/cycleRules.ts`** (source of truth; change numbers there, no logic changes). Defaults, from published ranges, all `NEEDS DRASHTI REVIEW`:

| Phase | How it's worked out (default) |
|---|---|
| Menstrual | Day 1 to her logged end date (assume 5 days if none logged) |
| Follicular | After the period ends until the Ovulation phase begins |
| Ovulation | Estimated ovulation day ±1 day. Ovulation day = **14 days before the next predicted period** (luteal length, not "day 14") |
| Luteal | After the Ovulation phase until the next period |

Overlays (not phases):
- **Fertile window**: 5 days before ovulation to 1 day after (sperm survive up to ~5 days; egg ~12-24 hours).
- **Lower-fertility days (estimate)**: days outside the fertile window plus a 2-day margin, shown only when her cycles are regular. Always with "not a method of contraception".

Other rules:
- Estimates are shown as a **range** that widens when cycles vary; very irregular cycles → the app says it can't estimate reliably.
- Today screen shows the current phase (colour + icon + word); Calendar tints the days.
- **"Safe period" is not used** (confirmed: "Lower-fertility days" is acceptable). Calendar estimates are unreliable and the wording invites contraception use.
- Why the luteal length is the anchor: the luteal phase is fairly constant (about 12-14 days) while the follicular phase causes most of the cycle-length variation.

## Phase 2 — Richer picture (Should)
- Symptoms (cramps, headache, bloating, etc. — list from Drashti)
- Pain level, mood, free-text notes
- Medications / supplements
- Reminders: period expected soon, daily "log today?"
- Refine phase estimates with logged signs (e.g. basal temperature, cervical mucus) if Drashti wants
- App lock (PIN / fingerprint)

## Phase 3 — Doctor-ready (Should)
- PDF report: cycle lengths, period lengths, irregularities, symptoms, notes, date range chosen
- CSV export for spreadsheets
- Report layout designed with Drashti

## Phase 4 — Insights (Later)
- Patterns ("cramps cluster 2 days before")
- AI plain-language summary (costs money via API; decide later)
- Cloud backup / sync
- Other languages (e.g. Hindi, Gujarati)

## Explicit non-features
Diagnosis, treatment advice, ads, social/community, selling data, accounts.

## Behaviour rules the app must follow
- Predictions are ranges; the range widens when cycles vary.
- Fewer than 2 completed cycles → no prediction, only encouragement to keep logging.
- Never alarm. Flags say "worth mentioning to a doctor", not "you have X".
- Missing a day of logging is normal; nothing breaks or nags.
- Every user entry can be edited or deleted.
