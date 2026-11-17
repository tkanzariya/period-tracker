# Improvement plan: UI, features, notifications, ads

Last updated: 2026-11-17

Analysis asked for by Tirth on 2026-11-17. **Nothing here is built yet.** Health wording and numbers are `NEEDS DRASHTI REVIEW`. Order of work is in section 6.

## 1. UI: what to fix in the current screens
Found by going through the latest screenshots (`app/.tmp/shots-*`).

| # | Screen | Problem today | Change |
|---|---|---|---|
| U1 | Today | The answer she opens the app for ("when is my next period?") is below the fold; the Saathi bubble takes the top third | Answer first: one big line under the greeting ("Period likely in 3 to 9 days" / "Period day 2" / "4 days later than my guess"). Saathi bubble becomes one short line under it |
| U2 | Today | The floating button covers the text of the next-period card | Give the page bottom room for the button, and shrink it to an icon while scrolling |
| U3 | Today | "Based on a typical 28-day cycle…" is printed twice (ring card and next-period card) | Say it once, in the next-period card |
| U4 | Today | When late, the ring is simply full and says "Day 32" | A "late" state: ring shows the expected window passed, text says how many days later than the guess |
| U5 | Ring | Colours are not explained on Today; arcs cannot be tapped | Tap an arc to read its phase in a small popup; show the expected-period arc |
| U6 | Calendar | Logged days and guessed days differ only by faintness; fertile days and ovulation day share one colour | Guesses get a dashed edge and the word "guess" in the legend; ovulation day gets a ring |
| U7 | Calendar | No quick way back to today; months change only with arrows | "Today" chip; swipe left/right between months |
| U8 | Tell me | The three choices wrap onto two lines; the note box is always open | Shorter labels ("Started", "Ended", "Note"); note box opens when tapped |
| U9 | My cycles | The "unusual" mark is an icon alone; bars are all one colour | Icon + word ("Longer than usual"); unusual bars in the amber tone; a line for her usual length |
| U10 | Earlier cycles | Each cycle is a tall card; the day chips wrap | One compact row per cycle (date + days stepper) |
| U11 | Everywhere | Not yet checked: 200% text size, TalkBack, small phones, the real phone | Check on the phone before 0.1.0 goes to Drashti |

## 2. Features: what makes the app more helpful
Biggest gap against every other app: **she can only write a free-text note**. There is no quick way to record how a day was.

### Next (make daily use worth it)
- **F1 One-tap day check-in** (icons, no typing): pain (none / some / strong), mood, and 6 to 8 symptoms from Drashti's list (cramps, headache, back pain, bloating, tender breasts, tired, acne, spotting). Bleeding heaviness was parked by Tirth on 2026-10-27; ask Drashti again, because doctors ask "how many pads a day".
- **F2 Patterns from her own data**: "Cramps usually come on day 1 and 2", "Headaches often come 2 days before your period". Shown on Today the day before they usually happen.
- **F3 "Is my period late?" helper**: calm list of common reasons and when to see a doctor (Drashti writes it). No diagnosis.

### Unique (others do not do it, or do it badly)
- **X1 "Will I have my period on…?" date checker.** She picks a date (wedding, trip, puja, exam) and the app answers Likely / Possible / Unlikely, with the honest range, getting less sure the further away it is. Very common real question in India; other apps show a single fake date months ahead. Never suggests medicines to move a period.
- **X2 The app shows how good its guesses were.** "My last 3 guesses: on time, 1 day early, 2 days late." No popular app shows its own track record; it fits our "honest predictions" rule and builds trust.
- **X3 Doctor visit pack.** The PDF plus: symptoms and pain per cycle, unusual cycles marked, "questions I want to ask", and the report in English even when the app is in Hindi (doctors read English). Drashti decides the content.
- **X4 Heavy-bleeding helper** (if Drashti agrees to F1 bleeding): pads per day, clots, more than 7 days, turned into one plain line for the doctor. Clinically useful and missing elsewhere.
- **X5 Irregular-cycle mode.** When her cycles vary a lot (PCOS, after a baby, near menopause, teen years) the app stops showing a window that looks sure, says "your cycles vary, so anytime between…", and tracks the gap in days since the last period instead.
- **X6 Privacy for a shared phone.** App lock (PIN or fingerprint), notifications that do not say "period" on the lock screen, optional plain app name. Matters in Indian households; big apps ask for an account instead.
- **X7 Supplies reminder.** "Your period may come next week. Do you have what you need?" Simple, practical, nobody does it.
- **X8 Share without an account.** A picture card ("next period likely 12 to 18 Dec") she can send on WhatsApp to a partner or mother. No sign-up, no server.
- **X9 More languages, icon-first.** Gujarati next, then others; the Saathi can read her message aloud for women who read little.
- **X10 Home-screen widget** ("Day 12 · period in about 16 days", with a discreet version).

### Later
Life stages (teen, trying for a baby, after a baby, on the pill, near menopause) so the notes fit her; automatic monthly copy to a folder she picks; year view.

## 3. Notifications (all made on the phone: no server, no cost)
Rules: at most **one a day**; quiet hours 9 pm to 8 am; each kind has its own switch in Settings; lock-screen text is **discreet by default** ("A note from your Saathi") with an option to show details; permission is asked after she adds her first period, with the reason, never on first launch. Re-planned every time her data changes (pure function in `domain/`, tested).

| # | Kind | When | Example (details on) | Default |
|---|---|---|---|---|
| N1 | Period coming | 2 days before the earliest likely day | "Your period may start in the next few days." | On |
| N2 | Did it start? | Morning of the likely day, then every 2 days in the window | "Did your period start? Tap to tell me." | On |
| N3 | Did it end? | Day 5 of an open period, again on day 8 | "Has your bleeding ended? Tap to tell me." | On |
| N4 | Later than my guess | 1 day after the window ends, once | "Your period is later than my guess. That can happen." | On |
| N5 | Keep a copy | Once a month if no copy was saved | "Save a copy of your information, so it is never lost." | On |
| N6 | Supplies (X7) | 5 days before the window | "Period likely next week. Do you have what you need?" | Off |
| N7 | Evening check-in (needs F1) | Her chosen time, only during the period and the week before | "How are you feeling today?" | Off |
| N8 | Fertile days | Start of the fertile days | "Your fertile days are likely starting (a guess)." Never birth-control advice | Off |
| N9 | We miss your data | No entry for 40 days | "Tell me about your last period so my guesses stay right." | On |

N2 and N3 also fix the "period never ended" problem. Each one opens the app on the right sheet (that is also the ad impression).

## 4. Ads (AdMob): final placement, built later
Goal: every app open gives an impression; logging a period is never slowed.

| Format | Where | Why there |
|---|---|---|
| **Banner** (anchored adaptive) | A fixed strip **above the bottom tab bar on Today, Calendar and My cycles**, with a thin line and gap from the tabs; the floating button sits above it | Seen on every open and every tab without covering anything; one strip, refreshed about once a minute |
| **Native** (styled as our card, labelled "Ad") | **My cycles list, after the 3rd period row** (only when she has 4 or more). Second slot, add only if needed: **Calendar, under the Colours card** | In-feed where she is reading, not acting |
| **Interstitial** (full screen) | Only after a finished side task: **after the PDF report is shared**, **after saving earlier cycles**. Max 1 a day, none in her first 3 days | A natural pause; nothing is waiting to be typed |
| **Rewarded** (her choice) | Settings row and an occasional Saathi card: **"Watch a short video: no ads for 3 days"**; later also to unlock extras (year review, Saathi looks) | Opt-in, gives her something real |
| App-open ad | **Not used** | First thing a woman in pain would see; also slows opening |

**Never an ad on:** welcome, first tour, the Tell me / Change period / Earlier cycles forms, popups, problem messages, the PDF, notifications. Never gate the doctor report or the backup behind an ad. Offline: the strip collapses, no empty box.

### What ads change (must be accepted before building)
1. **The promise "nothing is sent anywhere" stops being true.** Google's ad code sends an advertising ID and device details. Wording must become "Your cycle information stays on this phone. Ads come from Google and never get your cycle information." Only non-personalised ads; nothing about her cycle is ever passed to the ad code.
2. **Ads need the Play Store.** AdMob serves properly only to an app listed in a store: one-time developer fee (about $25), a privacy policy page, the Data safety form, the health-apps declaration, and a consent prompt. This ends "zero cost" and "APK only".
3. Block ad categories that feel wrong in a health app (dating, gambling, alcohol; decide on pregnancy and fertility products with Drashti). Keep ads off in tester builds for Drashti.
4. App size grows by a few MB. Check Google's current ad and Play health policies again when building.

## 5. Engagement without being pushy
Daily reason to open: F1 check-in + the phase line for today. Weekly: X2 track record and F2 patterns. Monthly: N1 to N4 around the period, N5 copy. Avoid streaks and guilt messages: this is a health app.

## 6. Suggested order
1. **0.2.0**: U1 to U4, U8 (Today answer-first, button fix), notifications N1 to N5 and N9, Settings switches.
2. **0.3.0**: F1 check-in (after Drashti's list), F2 patterns, X2 track record, N7.
3. **0.4.0**: X1 date checker, X5 irregular mode, X6 app lock and discreet mode, X7/N6.
4. **1.0.0 (Play Store)**: X3 doctor pack, Gujarati, then ads as in section 4.
