# What a user can and cannot do (problem scenarios)

Last updated: 2026-11-05

Every row is a real situation, the rule the app follows today, and the exact words it says. **Tirth: change any rule or wording you do not like; the words live in one file (`app/src/i18n/en.ts`, Hindi in `hi.ts`), the rules in `app/src/domain/validation.ts` (numbers in `app/src/config/cycleRules.ts`).** Each scenario is a named test (`validation.test.ts`), and the screenshots in `app/.tmp/shots-*` (made by `node scripts/scenario-shots.js`) show them on screen.

Style: calm, amber box inside the sheet (never red, never an Android popup), say what is true, then the next step. Only two kinds of popup exist: "Is that right?" (yes/no) and "Remove this period?".

| # | Situation | What the app does | What it says (title / body) |
|---|---|---|---|
| S1 | Day is in the future | Blocks. The calendar only offers up to today. | "That day has not come yet" / "Please pick today or an earlier day." |
| S2 | "Period started" on a day a period already starts | Blocks, offers **Change that period** | "A period already starts on 6 Oct" / "You have already told me about it." |
| S3 | "Period started" on a day inside an earlier period (the double-start bug) | Blocks, offers **Change that period** | "That day is inside your period (6–10 Oct)" / "A new period cannot start while one is going on." |
| S4 | "Period started" while the last period has no end yet | Blocks, offers **Tell me the end day** | "Your period from 3 Nov has not ended" / "Tell me when it ended first. Then you can add the new one." |
| S5 | Start would run into a period that begins later | Blocks | "This runs into your period that starts on 8 Sep" / "Please pick an earlier day." |
| S6 | New period only a few days after another began (fewer than 15) | Asks "is that right?" (popup, yes/no) | "Only 14 days after another period started" / "Most cycles are 21 to 35 days long. Is this a new period?" Yes: "Yes, save it". No: "No, go back" |
| S7 | "Period ended" when no period is going on | Blocks, offers **Period started** | "No period is going on" / "Tell me when a period started first." |
| S8 | End day is before the start day | Blocks | "That is before the period started (6 Oct)" / "Please pick a day on or after it." |
| S9 | Period already has an end | Blocks, offers **Change that period** | "That period already ended on 10 Oct" / "You can change its days if that is not right." |
| S10 | Period would be very long (over 14 days) | Asks "is that right?" | "That makes your period 15 days long" / "Is that right?" |
| S11 | Changing a period so it overlaps another | Blocks | "This overlaps your period from 6–10 Oct" / "Periods cannot overlap. Please check the days." |
| S12 | Empty note | Blocks | "Write something first" / "e.g. cramps, travelling, took medicine" |
| S13 | Note over 500 letters | Stops typing at 500; shows "0 of 500" | "That note is too long" / "Please keep it under 500 letters." |
| S14 | Period started long ago, never ended (over 10 days) | Today shows an amber note; the big button stays "Period ended" | "Did your period end?" / "You told me it started on 3 Oct." Button: "Tell me the end day" |
| S15 | Phone storage is full / save fails | Amber box in the sheet; nothing is lost | "I could not save that. Your phone may be full. Please try again." |
| S16 | Removing a period | Own popup, red button with trash icon, then toast with **Undo** | "Remove this period?" / "6–10 Oct will be taken out of your cycles. You can undo this right after." |
| S17 | Every save | Toast top-right with **Undo** for 6 seconds | "Saved: period started 28 Oct" |
| S18 | Restoring a copy twice | Adds only what is missing; says what happened | "All done" / "I added 2 periods and 1 note." or "Everything in that file is already here, so nothing changed." |
| S19 | Wrong or newer file chosen when restoring | Changes nothing; own popup | "I could not use that file" / "That file does not look right. Please choose the file you saved from this app." |
| S20 | First run, skipping the name or the last period | Allowed; the Saathi asks again on Today | "Hi! Tell me the day your last period started. I will learn from it." |

## Still open (Tirth to decide)
- **S21 double tap on Save**: the button is disabled while saving (done). Is a second identical entry also to be blocked? (Today S2 does.)
- **S22 phone clock or time zone changes**: "today" follows the phone. Should the app warn if the date jumps back a lot? (Not built.)
- **S23 backdating a first period very far back** (for example 2 years ago): allowed now. Cap it?
- **S24 12-month-old open period**: S14 still shows; should it auto-close after a long time?
- **S25 note on a day with no period**: allowed. OK?

Health-related numbers (15 days, 14 days, 10 days, 21 to 35) are **NEEDS DRASHTI REVIEW**.

## First open and history (decided by Tirth, 2026-11-06; NOT built yet)
| # | Situation | Decision |
|---|---|---|
| F1 | Very first step | Ask only "When did your current cycle start?" History can be added later. |
| F2 | She does not remember the exact day | Calendar picker plus rough chips ("1 week ago", "2 weeks ago"); labelled as an estimate. |
| F3 | Adding history | For each past cycle: start date **and** how many days the bleeding lasted (so the end-of-period day stays). |
| F4 | A gap of 60+ days (missed cycle, pregnancy, illness, pill) | Ask "Is that right?"; if yes, allow and mark the cycle as long (not an error). |
| F5 | Two starts under 15 days apart | Ask "Is that right?" (today's rule S6). |
| F6 | Not chosen as "ask": very old start (1+ year), dates added out of order | Out of order: sort automatically. Very old start: allowed without a question; to confirm. |
