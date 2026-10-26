# Features

Last updated: 2026-10-27

Plain-language feature plan. Priorities: **Must** = MVP can't ship without it. **Should** = right after. **Later** = parked.
Anything clinical is `NEEDS DRASHTI REVIEW` until she signs off.

## The core loop (what the app is really for)
1. She logs what happens (period starts, ends, how heavy, how she feels).
2. The app learns her pattern from those logs.
3. The app tells her when to expect the next one, honestly (a range, not a fake exact date).
4. When something looks unusual, it says so calmly and records it.
5. All of it can be handed to a doctor as a clean history.

## Phase 1 — MVP (Must)
| Feature | In plain words |
|---|---|
| Log period start | "My period started today" (or any past date) |
| Log period end | "It ended" |
| Daily flow level | None / spotting / light / medium / heavy, per day |
| Today screen | Where she is in the cycle ("Day 12") and what's next |
| Calendar | See past periods and predicted ones at a glance |
| History list | Every past cycle with its length |
| Edit / delete | Fix mistakes in any entry |
| Prediction | "Next period expected Nov 12–15" based on her own history |
| Irregularity notes | Gentle flags: late, early, unusually long/short, big variation |
| Backup export | One button saves all her data as a file she can keep |
| Restore import | Load that file back, no duplicates |

Not enough data yet? The app says "I need 2-3 cycles to predict" instead of guessing.

## Cycle phases (added 2026-10-27, in Phase 1)
Everything below is **calculated from her own period start dates and predicted next start**, never stored. Always labelled "estimate". `NEEDS DRASHTI REVIEW` for the exact day counts.

| Phase | How it's worked out |
|---|---|
| Period | Day 1 to her logged end date (assume ~5 days if no end logged) |
| Follicular | After the period ends, until the fertile window begins |
| Fertile window | About 5 days before ovulation up to 1 day after |
| Ovulation (estimated day) | About **14 days before the next predicted period** (not "day 14"; works for longer/shorter cycles) |
| Luteal | After ovulation until the next period |

- Ovulation and fertile window shown as a **range** that widens when her cycles vary; if cycles are very irregular the app says it can't estimate reliably.
- Today screen shows the current phase (colour + icon + word); Calendar tints the days.
- **"Safe period" is deliberately not used.** Calendar-based estimates are unreliable (especially for irregular cycles) and the wording invites relying on it as contraception. Proposed name: **"Lower-fertility days (estimate)"**, always with "not a method of contraception". Awaiting Drashti's confirmation (see open questions).

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
