# What a user can and cannot do (problem scenarios)

Last updated: 2026-11-18

**There is no "period ended" in the app (Tirth, 2026-11-18).** A cycle starts on the day she says a period started and ends the day before the next start. The only thing she tells the app is "a period started on this day" (plus optional notes). The first 5 days of every cycle are drawn as the Bleeding phase (an estimate, never asked; `config/cycleRules.ts` `period.assumedLengthDays`, NEEDS DRASHTI REVIEW). Older end dates saved by earlier test builds stay in the backup file but are ignored.

Every row is a real situation, the rule and the exact words. **Tirth: change any rule or wording; words live in `app/src/i18n/en.ts` (Hindi `hi.ts`), rules in `app/src/domain/validation.ts`, numbers in `app/src/config/cycleRules.ts`.** Each is a named test in `validation.test.ts`; screenshots come from `node scripts/scenario-shots.js`.

Style: calm amber box inside the sheet (never red, never an Android popup), say what is true, then the next step. Only two kinds of popup: "Is that right?" and "Remove this period?".

| # | Situation | What the app does | What it says (title / body) |
|---|---|---|---|
| S1 | Day has not come yet | Blocks | "That day has not come yet" / "Please pick today or an earlier day." |
| S2 | Same start twice | Blocks, offers **Change that period** | "A period already starts on 6 Oct" / "You have already told me about it." |
| S3 | New start fewer than 15 days after another start | Asks "is that right?" | "Only 6 days after another period started" / "Most cycles are 21 to 35 days long. Is this a new period?" Yes "Yes, save it" / No "No, go back" |
| S4 | New start 60+ days from the nearest other start (missed cycle) | Asks "is that right?" | "101 days from your other periods" / "A cycle can be missed or late (illness, stress, pregnancy, some medicines). Is that right?" |
| S5 | Empty note | Blocks | "Write something first" / "e.g. cramps, travelling, took medicine" |
| S6 | Note over 500 letters | Stops typing at 500 | "That note is too long" / "Please keep it under 500 letters." |
| S7 | Phone storage full / save fails | Amber box; nothing lost | "I could not save that. Your phone may be full. Please try again." |
| S8 | Removing a period | Own popup, red button with trash, then Undo toast | "Remove this period?" / "10 Nov will be taken out of your cycles. You can undo this right after." |
| S9 | Every save | Toast top-right with **Undo** for 6 seconds | "Saved: period started 28 Oct" |
| S10 | Restoring a copy twice | Adds only what is missing | "All done" / "I added 2 periods and 1 note." or "Everything in that file is already here, so nothing changed." |
| S11 | Wrong or newer file when restoring | Changes nothing | "I could not use that file" / "That file does not look right. Please choose the file you saved from this app." |
| S12 | First run, skipping name or last period | Allowed; the Saathi asks again on Today | "Hi! Tell me the day your last period started. I will learn from it." |
| S13 | Starts told in any order | Sorted automatically | no message |
| S14 | A period in the future when changing a start | Blocks | same as S1 |

## First open and history (decided 2026-11-06, simplified 2026-11-18)
| # | Situation | Decision |
|---|---|---|
| F1 | Very first step | Ask only "When did your last period start?" with chips Today, 1, 2, 3 weeks ago, and the calendar. |
| F2 | Not sure of the day | A rough day is fine; it is treated as a guess. |
| F3 | Adding history | "Earlier cycles": one row per earlier period, just the start date (no bleeding days any more). Add or remove rows; one Undo removes all. |
| F4 | A 60+ day gap in the list | "Is that right?" (S4) per row. |
| F5 | Two starts under 15 days apart in the list | "Is that right?" (S3). |
| F6 | The same start twice in the list | Blocked on the second row, Save stays off. |
| F7 | Dates not in order | Sorted automatically. |

## Still open (Tirth to decide)
- A start more than a year old is allowed without a question. OK?
- Phone clock or time zone changes: "today" follows the phone, no warning. OK?
- A note on a day with no period: allowed. OK?
- Should the Bleeding days (first 5) be adjustable in Settings? Drashti to confirm 5.

Health-related numbers (15 days, 60 days, 21 to 35, 5 bleeding days) are **NEEDS DRASHTI REVIEW**.
