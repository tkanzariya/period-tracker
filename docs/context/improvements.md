# Improvements: the one list

Last updated: 2026-11-21

This is the **only** place for planned improvements (it replaces `improvement-plan.md`, the improvement parts of `ux-standards.md` section 10, the Unreleased ideas in `roadmap.md` and `features.md`, and the to-do parts of the 2026-11-21 audit). Every item says **what is happening now** and **what we will change**.

## How Tirth decides (two ways, same result)
1. **Easy way:** open `docs/review/improvements.html` in a browser, pick **Approve / Later / Reject / Discuss** on each item, type a comment if you like, press **Copy my decisions** and paste it to Claude.
2. **Direct way:** edit the `Decision:` and `Comment:` lines of any item below (write one of Approve, Later, Reject, Discuss).

Claude then: records decisions in `decisions-log.md`, builds the **Approve** items (health ones wait for Drashti first, see "Needs Drashti"), keeps **Later** items listed, drops **Reject** items to the "Rejected" list, and answers **Discuss** items before building. Status words: `Open` (waiting for a decision), `Approved`, `Discuss`, `Built` (in the code, in the next test build), `Built, Drashti to review` (needs her yes before it goes beyond test builds), `Done` (released), `Later`, `Rejected`.

Rules that apply to every item: health wording and numbers stay `NEEDS DRASHTI REVIEW` until she confirms; no cost; nothing is pushed or released without Tirth's go-ahead; each user-visible change gets a `CHANGELOG.md` line.

Sources: `audit` = `docs/review/audit-usability-medical-2026-11-21.md` (kept as the evidence and the medical table); `plan` = the old improvement plan (2026-11-17); `ux` = the 2026-11-02 UX audit; `scn` = open rules in `scenarios.md`.

---

## A. Safety and medical accuracy (found by the audit; Drashti must review the wording and numbers)

### M1. A late or missed period is explained badly
- **Area:** Today, reminders
- **Priority:** Critical
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0
- **Now:** After 79 or 173 days with no new period, Today says "Your period is a little late. This can happen" and, next to it, "79 days later than my guess". It never mentions pregnancy, so someone could be falsely reassured.
- **Change:** Wording by lateness: up to 7 days "a few days late, this can happen"; after 7 days "late. If there is any chance you are pregnant, a pregnancy test is a good next step. If it keeps being late, please talk to a doctor"; after 60 days "I have not heard about a period for N days. Did you forget to log one? If not, please see a doctor". Includes the calm "Is my period late?" list of common reasons (old idea F3). No diagnosis.
- **Source:** audit D1, G1; plan F3
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:**

### M2. Phase and "Day N" shown after a long silence
- **Area:** Today, Calendar
- **Priority:** Critical
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0
- **Now:** If nothing is recorded for months, Today shows "Day 205 of your cycle" and the Luteal phase, which is made up.
- **Change:** After a long silence stop showing the cycle day and phase. The cut-off depends on her age group (from M3): about 60 days for under 20 and 20 to 39, longer for 40 and over because gaps are common near menopause (numbers NEEDS DRASHTI REVIEW). Show "No period recorded for N days. Did it come?" with one button to record it. The Calendar stops drawing phases beyond that point.
- **Source:** audit D2, E (Today), G2
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:** Yes but according to age

### M3. Teenagers and women over 40 get the same "tell your doctor" flag
- **Area:** Today, My cycles, flags
- **Priority:** High
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0
- **Now:** A 42-day cycle is flagged "You may want to tell your doctor" for everyone, but cycles up to about 45 days are common in the first years of periods. Women in their 40s get the same flag with no explanation that cycles often change then.
- **Change:** Ask once "How old are you?" (under 20 / 20 to 39 / 40 and over, no exact age). Under 20: the normal range is wider for the first years and the wording says so. 40 and over: one calm line "Cycles often change in your 40s", the doctor prompt stays. Also say "most adults' cycles are 21 to 35 days" instead of "most cycles". This also covers the old "life stages" idea.
- **Source:** audit C, D3, F3, G3; plan "Later: life stages"
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:**

### M4. Ovulation guessed for irregular and teenage cycles
- **Area:** Today, Calendar
- **Priority:** High
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0
- **Now:** "Ovulation is likely around 28 Nov (a guess)" appears even when cycles vary from 24 to 48 days, in a country where calendar apps are sometimes used to avoid pregnancy.
- **Change:** Hide the ovulation and fertile-day guess when her cycles vary by more than 7 days, or for under-20s. Otherwise say "My guess is ovulation is around 28 Nov. This can be off by days or weeks." The "not birth control" line stays.
- **Source:** audit C, D4, E wording
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:**

### M5. The next-period window is too narrow for regular users
- **Area:** Prediction
- **Priority:** High
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0
- **Now:** With four identical cycles the window is only 1 day each side, so a regular user can be surprised by a period a few days early or late.
- **Change:** Never narrower than 3 days each side until she has 6 or more cycles (the number is NEEDS DRASHTI REVIEW).
- **Source:** audit C, D5, G4
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:**

### M6. One odd cycle ruins the "usual cycle"
- **Area:** My cycles
- **Priority:** High
- **Needs Drashti:** No (maths); wording yes
- **Suggested for:** 0.3.0
- **Now:** After one 99-day gap, My cycles says "Usual cycle 35 days, from 18 to 99".
- **Change:** Use the middle value (median) as "Typical cycle" and show a very long or short cycle as "long gap" on its own, not inside the average.
- **Source:** audit C, E (My cycles), G6
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:**

### M7. "When to see a doctor", and a heavy or long bleeding check
- **Area:** New page, Settings > Good to know, day check-in
- **Priority:** High
- **Needs Drashti:** Yes (her list and wording)
- **Suggested for:** 0.3.0 (the page); the check-in goes with F1
- **Now:** Nothing in the app says when bleeding, pain or bleeding between periods needs a doctor. Because period end was removed on 2026-11-18, a period lasting more than 7 days cannot be noticed at all. Pads per day is still COMING SOON.
- **Change:** A short "When to see a doctor" page (changing a pad every 1 to 2 hours, clots over 2.5 cm, bleeding between periods or after sex, bleeding over 7 days, severe pain, no period for 3 months). Then, with the day check-in (F1), a one-tap "heavy" and "bleeding longer than 7 days" check that turns into one plain line for the doctor report (merges old X4 heavy-bleeding helper). Keeps the COMING SOON promise for pads per day.
- **Source:** audit C, D6, F1, G5; plan X4
- **Status:** Discuss
- **Decision:** Discuss
- **Comment:**

### M8. Mood and energy lines sound surer than the evidence
- **Area:** Today (phase lines), Calendar day sheet
- **Priority:** Medium
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0
- **Now:** "Many women feel more energetic now" and "Some women feel tired or moody around now. That is normal." The second can dismiss strong premenstrual symptoms.
- **Change:** "Some people feel more energetic around now; many notice nothing." and "Some people feel tired or moody before a period. If it is strong or stops you doing daily things, tell a doctor."
- **Source:** audit C, D7, E wording
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:**

### M9. Unclear and robotic sentences in the "Is that right?" and range text
- **Area:** Add/Change period sheets, My cycles
- **Priority:** Medium
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0
- **Now:** "99 days from your other periods" (whose days?), "173 days later than my guess" (sounds like an error).
- **Change:** "99 days since your last period started" and "No period recorded for 173 days". Hindi follows.
- **Source:** audit E wording
- **Status:** Built, Drashti to review
- **Decision:** Approve
- **Comment:**

### M10. Check every health number with Drashti and the original papers
- **Area:** All cycle rules (`config/cycleRules.ts`)
- **Priority:** High (before any public release)
- **Needs Drashti:** Yes
- **Suggested for:** before 0.3.0 ships to anyone but Drashti
- **Now:** The 21 to 35 range, 7-day variation, 15-day and 60-day questions, 5 bleeding days, 28-day typical and the plus or minus 3 days are all unreviewed. The exact FIGO age bands for the 7 or 9-day rule could not be confirmed from the original paper; the 21 to 45 day teen range comes from secondary summaries.
- **Change:** Improve the existing review sheet `docs/review/cycle-review.html` (no second document) so it is easy for a non-technical nurse: every number and message in plain words, a worked example with a small diagram for each rule (for example a timeline showing what the app says on day 5, 20, 35 and 70 of a cycle), and Looks right / Needs a change with a Copy button. Claude also opens the FIGO (Munro 2018) and ACOG (Committee Opinion 651) papers and records the exact figures. Nothing is called approved until she signs it. In progress.
- **Source:** audit C, H4; open questions 1, 4
- **Status:** Built, Drashti to review
- **Decision:** Discuss
- **Comment:** Draft a simple doc for her to review that is easy to understand, maybe use examples/diagrams. Do not make a separate doc; improve the same doc.

---

## B. Screens: what to fix

### U2. The floating button covers the next-period card
- **Area:** Today
- **Priority:** Medium
- **Needs Drashti:** No
- **Suggested for:** 0.3.0
- **Now:** Partly fixed (the button now sits above the ad strip). The page still has no extra bottom room, so the last card can sit under the button.
- **Change (Tirth's decision):** no floating button any more. The main action ("Period started" / "Add my last period") becomes a round button in the centre of the bottom tab bar, like HomeHisab's. Copy HomeHisab's look after checking it on the phone.
- **Source:** plan U2
- **Status:** Approved
- **Decision:** Approve
- **Comment:** Instead of the floating button, keep it in the centre of the bottom nav bar. Check the HomeHisab app on the phone.

### U12. Today: the answer should come first, with no cards in the way
- **Area:** Today
- **Priority:** Medium
- **Needs Drashti:** No
- **Suggested for:** 0.3.0
- **Now:** For a new user the order is headline, "Want a gentle reminder?" card, Saathi bubble, ring. With the banner ad there is little of the answer left on the first screen.
- **Change:** Move the reminder offer to the bottom of Today (or a one-time popup after day 2). Keep the ring and next period in view first. The ad banner stays exactly where it is (above the tab bar); only the cards move.
- **Source:** audit A, E (Today, Ads), G7
- **Status:** Approved
- **Decision:** Approve
- **Comment:** Approve, but the ad placement should not move.

### U5. Tap a ring arc to read what it means
- **Area:** Today ring
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** 0.4.0
- **Now:** The colours of the ring are not explained on Today and the arcs cannot be tapped.
- **Change:** Tap an arc to see its phase in a small popup; show the expected-period arc.
- **Source:** plan U5
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### U6. Calendar: make guesses look different from facts
- **Area:** Calendar
- **Priority:** Medium
- **Needs Drashti:** No
- **Suggested for:** 0.3.0
- **Now:** Recorded days and guessed days differ only by being fainter. The legend names the colours but not what they mean.
- **Change:** Guessed days get a dashed edge and the word "guess" in the legend; the ovulation day gets a ring; tap a legend chip to read a one-line meaning (the day sheet already explains each day well and stays).
- **Source:** plan U6; audit E (Calendar), G8
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### U7. Calendar: back to today, swipe between months
- **Area:** Calendar
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** 0.4.0
- **Now:** Months change only with the arrows; there is no quick way back to today.
- **Change:** A "Today" chip, and swipe left or right between months.
- **Source:** plan U7
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### U9. My cycles: say "longer than usual" in words
- **Area:** My cycles
- **Priority:** Medium
- **Needs Drashti:** No
- **Suggested for:** 0.3.0
- **Now:** The "unusual" mark is an icon alone, and all bars are one colour.
- **Change:** Icon plus words ("Longer than usual"); unusual bars in the amber tone; a line for her typical length; filter (last 6 / 12 cycles / all) and the trend numbers next to the chart (old UX item B6).
- **Source:** plan U9; ux B6
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### U10. Earlier cycles: compact rows and "weeks ago" chips
- **Area:** Add earlier cycles
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** 0.4.0
- **Now:** Each earlier cycle is a tall card, and every back-dated date needs several taps in the calendar.
- **Change:** One compact row per cycle (date plus quick chips like "3 weeks ago"), same chips as the welcome step.
- **Source:** plan U10; audit E (Tell me / Add earlier cycles)
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### U13. Block permissions the app does not need
- **Area:** Android build (`app.json`)
- **Priority:** Medium
- **Needs Drashti:** No
- **Suggested for:** 0.3.0
- **Now:** The app has no permission list set, so Android may get extra permissions by default (internet is needed for ads, but storage and overlay are not). Not reviewed in a health-privacy app.
- **Change:** List the permissions in the built APK, block every one not needed, and say so in the privacy text.
- **Source:** ux A4
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

---

## C. New features

### F1. One-tap day check-in (pain, mood, symptoms)
- **Area:** Today, Calendar day sheet
- **Priority:** High
- **Needs Drashti:** Yes (symptom list)
- **Suggested for:** 0.3.0
- **Now:** She can only write a free-text note for a day. There is no quick way to say how a day was, which is why other apps are opened daily and this one is not. Bleeding heaviness / pads per day is **COMING SOON** (Tirth, 2026-11-17, keep on the list).
- **Change:** Icons, no typing: pain (none, some, strong), mood, and 6 to 8 symptoms from Drashti's list (cramps, headache, back pain, bloating, tender breasts, tired, acne, spotting); heaviness joins when Drashti agrees. Feeds F2, M7 and the doctor pack (X3).
- **Source:** plan F1; open question 1p
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### F2. Patterns from her own data
- **Area:** Today
- **Priority:** Medium
- **Needs Drashti:** Yes (wording)
- **Suggested for:** 0.3.0 (needs F1 data first)
- **Now:** Nothing is learned from what she records beyond cycle length.
- **Change:** Lines such as "Cramps usually come on day 1 and 2" or "Headaches often come 2 days before your period", shown the day before they usually happen. Only after enough entries.
- **Source:** plan F2
- **Status:** Discuss
- **Decision:** Discuss
- **Comment:** Need to understand the new behaviour in detail, with an example.

### X1. "Will I have my period on...?" date checker
- **Area:** New screen
- **Priority:** Medium
- **Needs Drashti:** Yes (wording)
- **Suggested for:** 0.4.0
- **Now:** A common real question (wedding, trip, puja, exam) has no answer in the app; other apps show one fake date months ahead.
- **Change:** She picks a date; the app says Likely / Possible / Unlikely with the honest range, getting less sure the further away it is. Never suggests medicine to move a period.
- **Source:** plan X1
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### X2. The app shows how good its guesses were
- **Area:** My cycles
- **Priority:** Medium
- **Needs Drashti:** No
- **Suggested for:** 0.3.0
- **Now:** The app never says whether its past guesses were right.
- **Change:** "My last 3 guesses: on time, 1 day early, 2 days late." No popular app does this; it fits our "honest guesses" rule and builds trust.
- **Source:** plan X2
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### X3. Doctor visit pack
- **Area:** PDF report
- **Priority:** Medium
- **Needs Drashti:** Yes (she decides the content)
- **Suggested for:** 1.0.0
- **Now:** The PDF shows the summary, the cycle table and the disclaimer only. It is in the app's language (Hindi users get a Hindi report).
- **Change:** Add symptoms and pain per cycle, unusual cycles marked, a "questions I want to ask" box, and always write the report in English (doctors read English).
- **Source:** plan X3; open question 5
- **Status:** Later
- **Decision:** Later
- **Comment:**

### X5. Irregular-cycle mode
- **Area:** Today, prediction
- **Priority:** Medium
- **Needs Drashti:** Yes
- **Suggested for:** 0.4.0 (partly covered by M2, M4, M5)
- **Now:** For women whose cycles vary a lot (PCOS, after a baby, near menopause, teen years) the app still shows a next-period window and a phase, which looks surer than it is.
- **Change:** When cycles vary a lot, stop showing a sure-looking window; say "your cycles vary, so anytime between..." and count the days since the last period instead.
- **Source:** plan X5; audit A (persona C, D)
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### X6. Privacy on a shared phone: app lock, delete everything, discreet name
- **Area:** Settings
- **Priority:** High (audit) / question 6 asks if it is for v1
- **Needs Drashti:** No (Tirth + Drashti decide scope)
- **Suggested for:** 0.4.0
- **Now:** No PIN or fingerprint lock, no "Delete all my information", and the app name shows on the home screen. Reminders are already discreet on the lock screen by default.
- **Change:** App lock (PIN or fingerprint), a "Delete all my information" button with a clear confirmation, an optional plain app name and icon.
- **Source:** plan X6; audit E (Settings), F4, G10; open question 6
- **Status:** Later
- **Decision:** Later
- **Comment:**

### X8. Share a picture card without an account
- **Area:** Today
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** later
- **Now:** She can only share the PDF or the backup file.
- **Change:** A picture card ("next period likely 12 to 18 Dec") she can send on WhatsApp to a partner or mother. No sign-up, no server; she chooses whether to show the date.
- **Source:** plan X8
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### X10. Home-screen widget
- **Area:** Android widget
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** later
- **Now:** She must open the app to see the next period.
- **Change:** "Day 12, period in about 16 days", with a discreet version that does not say "period".
- **Source:** plan X10
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### L2. Year view
- **Area:** Calendar or My cycles
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** later
- **Now:** She can see one month at a time or the list of cycles.
- **Change:** One screen showing the whole year with each period marked.
- **Source:** plan "Later"
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### C1. Optional account and cloud backup
- **Area:** Settings, backup
- **Priority:** Medium
- **Needs Drashti:** No (Tirth decides cost and privacy)
- **Suggested for:** to be decided
- **Now:** Backup is a file she saves and restores by hand (Settings, "Save a copy"). Nothing leaves the phone and there are no accounts.
- **Change:** Tirth wants an optional account so she can save her data in the cloud and reconnect it on a new phone (this replaces the rejected "monthly copy to a folder"). **This changes the promise "your cycle information stays on this phone" and the zero-cost rule, so it needs a decision first:** which service (for example Google sign-in with a private backup in her own Google Drive, which costs nothing and the app's maker never sees the data, or Firebase with our own servers, which has a free tier but we would hold her health data), end-to-end encryption, and the privacy wording and Play Data safety form. Claude will bring a short comparison before any building.
- **Source:** Tirth 2026-11-21
- **Status:** Discuss
- **Decision:** Discuss
- **Comment:**

---

## D. Notifications (all on the phone, no server, no cost; max one a day, 9 in the morning, discreet lock-screen text)

Already built in 0.2.0: coming soon (N1), did it start (N2), later than my guess (N4), keep a copy (N5), we miss your data (N9). The "did it end" reminder (N3) was removed with the period end. Real lock-screen text has not been seen on a phone yet.

### N6. Supplies reminder
- **Area:** Reminders
- **Priority:** Nice to have
- **Needs Drashti:** Yes (wording)
- **Suggested for:** 0.4.0
- **Now:** Nothing reminds her to have supplies ready.
- **Change:** 5 days before the window: "Period likely next week. Do you have what you need?" Off by default, own switch in Settings.
- **Source:** plan N6, X7
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### N7. Evening check-in
- **Area:** Reminders
- **Priority:** Nice to have
- **Needs Drashti:** Yes
- **Suggested for:** 0.3.0 (needs F1)
- **Now:** No daily reminder.
- **Change:** "How are you feeling today?" at the time she chooses, only during her period and the week before. Off by default.
- **Source:** plan N7
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### N8. Fertile days
- **Area:** Reminders
- **Priority:** Nice to have
- **Needs Drashti:** Yes
- **Suggested for:** later (only if M4 allows it)
- **Now:** Not built.
- **Change:** "Your fertile days are likely starting (a guess)." Off by default, never shown for irregular cycles, never birth-control advice. Needs Drashti's view on open question 7 (tracking only, or fertility too?).
- **Source:** plan N8; open question 7
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### N10. Check the real notification on a phone
- **Area:** Reminders
- **Priority:** Medium
- **Needs Drashti:** Yes (wording and whether 9 am is right, question 1o)
- **Suggested for:** 0.3.0
- **Now:** The audit confirmed reminders get scheduled for 9:00, but the wording on a real lock screen has not been seen.
- **Change:** Let one fire on Tirth's phone and check the discreet and detailed text; ask Drashti about 9 am.
- **Source:** audit "not verified"; open question 1o
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

---

## E. Ads and going public

Placement (banner above the tabs, native cards in My cycles and Calendar, a full-screen ad at most once a day after the PDF share or saving earlier cycles, none in the first 3 days, none on forms or the welcome, no app-open ad, no rewarded ad) is decided and built with Google **test** ads. The steps Tirth does on the AdMob website are in `admob-setup.md`.

### G1. Go live with real ads
- **Area:** Ads, Play Store
- **Priority:** Medium
- **Needs Drashti:** No (Tirth)
- **Suggested for:** 1.0.0
- **Now:** `USE_TEST_ADS` is on in every build; your real IDs are stored but unused. The app is not on Google Play, which AdMob needs to serve real ads. Privacy policy page, Data safety form, health-apps declaration, `app-ads.txt` and the one-time developer fee are not done.
- **Change:** Do the website steps in `admob-setup.md` (consent message, payments, blocked ad categories; decide with Drashti about pregnancy and fertility products), publish the Play listing, then switch to real IDs in a separate release.
- **Source:** plan section 4; `admob-setup.md`; open question 1r
- **Status:** Later
- **Decision:** Later
- **Comment:**

---

## F. Small rules for Tirth to settle (from `scenarios.md`)

### R1. A period start more than a year old
- **Area:** Adding a period
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** any
- **Now:** Allowed without a question.
- **Change (Tirth's decision):** block a start date more than 1 year ago with "That is too long ago" and a plain line (the limit is one number in `config/cycleRules.ts`). Earlier cycles use the same limit.
- **Source:** scn
- **Status:** Built
- **Decision:** Approve
- **Comment:** Do not allow such ridiculously long dates.

### R2. The phone's date or time zone changes
- **Area:** Whole app
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** any
- **Now:** "Today" follows the phone with no warning.
- **Change:** Keep as is (recommended).
- **Source:** scn
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### R3. A note on a day with no period
- **Area:** Notes
- **Priority:** Nice to have
- **Needs Drashti:** No
- **Suggested for:** any
- **Now:** Allowed.
- **Change:** Keep as is (recommended).
- **Source:** scn
- **Status:** Approved
- **Decision:** Approve
- **Comment:**

### R4. Change the number of Bleeding days (5) in Settings
- **Area:** Settings, phases
- **Priority:** Nice to have
- **Needs Drashti:** Yes (is 5 right?, question 1m)
- **Suggested for:** later
- **Now:** The first 5 days of every cycle are drawn as Bleeding and cannot be changed (`period.assumedLengthDays`).
- **Change (Tirth's decision, reverses the 2026-11-18 "no period end" rule in a safe form):** keep 5 days as the default. In "Change this period" and in the Calendar day sheet she may add "Bleeding ended on..."; if she does, that length is used for the Bleeding phase and for "bleeding more than 7 days" (M7), otherwise 5. It is never asked at start, there is no "Period ended" button, and a new start is never turned into an end (the cause of the 10 Oct / 10 Nov mix-up).
- **Source:** scn; open question 1m
- **Status:** Approved
- **Decision:** Approve
- **Comment:** Keep default 5 but give the option to add when bleeding ended. If she adds it we use that, if not we keep the default 5.

### R5. Week starts on Monday or Sunday
- **Area:** Calendar, Settings
- **Priority:** Nice to have
- **Needs Drashti:** No (Tirth + Drashti pick)
- **Suggested for:** 0.3.0
- **Now:** Monday, fixed (`config/display.ts`).
- **Change (Tirth's decision):** keep Monday as the default; the app follows the phone's light or dark theme. No Settings choice for now.
- **Source:** open question 1e
- **Status:** Approved
- **Decision:** Approve
- **Comment:** Default Monday. The app follows the phone's theme.

---

## Done (history, one line each)
- Today answer first with a late/overdue headline, one "typical cycle" line, shorter Tell me tabs (U1, U3, U4, U8; 0.2.0).
- Reminders N1, N2, N4, N5, N9 with Settings switches, discreet text, 9 am, max one a day (0.2.0).
- Own popups and a toast with Undo instead of Android dialogs; keyboard no longer hides Save; typed English and Hindi wording (ux A1, A2, A3, A5); Settings hub, three tabs, welcome and tour (ux B1 to B5, B7, B8).
- Period end removed; cycles run start to next start (2026-11-18).
- Ads built with test ads: banner, native cards, full-screen after PDF share and after saving earlier cycles; rewarded "no ads" removed (2026-11-19).
- Decisions of 2026-11-21 recorded for 36 items (see `decisions-log.md`).
- Built 2026-11-21 (test build, not released): M1 to M6, M8, M9 (late, silence, age group, ovulation, range, typical cycle, wording), R1 (no start older than a year), and the improved review sheet (M10).
- In-place updates keep her data (same package, same signing key, higher versionCode).

## Rejected (do not re-propose without a new reason)
Finishing the accessibility checks (TalkBack, small phones, Hindi spoken labels; Tirth 2026-11-21); more languages and read-aloud (Tirth 2026-11-21); the monthly copy to a folder (replaced by C1); App-open ads; ads that gate the report or backup; personalised ads; rewarded "No ads for 3 days"; streaks or guilt messages; a theme toggle; a "Period ended" button or optional end date; renaming it to "Cycle ended"; popups for common undoable actions.
