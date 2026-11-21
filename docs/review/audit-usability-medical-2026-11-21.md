# Cycle Saathi: usability, medical accuracy and safety audit

> **This is the evidence report (a dated record).** The action items from sections D to G are now tracked, with Tirth's approvals, in `docs/context/improvements.md` (items M1 to M10, U6, U9 to U13, X6 and others). Do not keep a second to-do list here.

Date: 2026-11-21. Build tested: 0.2.0 (the 21 Nov build with test ads) on Tirth's phone (1080x2340, Android), English and Hindi, light/dark not compared.

## How this was done, and the limits
- **Method:** I used the installed app only, through the phone: first-run welcome, the tour, Today, Calendar and its day sheets, My cycles, Settings, Add/Change/Remove, the reminders switch and the Android permission prompt, the restore feature, Hindi, 200% text size. To get realistic histories I loaded seven backup files through the app's own "Bring my information back" (normal user feature). I read what the screen says; I did not open code, database or developer docs during this audit.
- **Not independent:** I built this app in earlier sessions. I tried to judge only what appeared on screen, but you should treat this as a strong self-review, not a third-party audit. A real clinician (Drashti) and real first-time users should confirm it.
- **Not verified (stated plainly):** (1) the words of a reminder when it actually fires (I verified only that reminders get scheduled for 9:00 the next morning); (2) the content of the PDF on the phone (I verified the share sheet opens with `cycle-report-<date>.pdf`; the layout was checked earlier in a browser); (3) TalkBack/screen reader use; (4) behaviour for people outside my seven test histories; (5) the exact age bands in FIGO's "regularity" rule (see section C).
- **Personas were simulated** with test data (A: 3 periods with cycles of 35 and 42 days; B: four periods, 28-day cycles; C: cycles of 24, 41, 29, 48 days; D: cycles of 26, 33, 41, 58 days; plus E: one period 204 days ago; F: four 18-19 day cycles then 99 days without an entry).

## A. First impression, per persona
- **A (16-18, new to periods):** The welcome is short, warm and plain English ("I am your Saathi, your friend"), asks only for a name (skippable) and the last period start with quick chips ("1 week ago"). The tour is six short cards. She would understand it. Two problems: she is told a **42-day cycle is something to "tell your doctor"** about, and she is shown **"Ovulation is likely around 30 Nov"**. Both are wrong for the first years after periods start (section C).
- **B (23-30, busy):** Opens to the answer ("Your period may start in 10 to 12 days, 1-3 Dec") and a big "Period started" button. Two taps to record. Efficient. The 1-3 December window is narrower than real life (section D). The banner ad and the "Want a gentle reminder?" card use a lot of the first screen.
- **C (irregular):** The app communicates uncertainty well here: "Likely between 5-25 Dec", "Your cycles are not always the same length. They changed by 24 days". Calm tone. But it still shows a phase ("Follicular") and "Ovulation is likely around 1 Dec (a guess)" for a woman whose cycles run 24-48 days, which is not meaningful.
- **D (38-45, changing):** She gets "Your period may start any day now" for 24 days in a row and "Luteal: your body is waiting for your next period" on day 45 of a cycle. Nothing explains that changing cycles are expected at this age or when to seek care. She would likely lose trust.

## B. Usability findings (what actually happened)
Worked well: onboarding length; date chips; the Undo toast; the Tell me sheet; the "Is that right?" questions (e.g. "Only 7 days after another period started" / "99 days from your other periods"); Change this period / Remove (with confirmation); Hindi throughout (very good); the app stays readable at 200% text; the day sheet explains each day in words.
Friction: see the table in E.

## C. Medical accuracy audit

| Medical topic | What the app shows | Clinical reference | Finding | Recommended correction |
|---|---|---|---|---|
| Cycle length counted start to start; a cycle ends the day before the next start | "10 Oct - 9 Nov, 31 days"; "Day 9 of your cycle" | Standard definition: first day of bleeding to the day before the next ([NHS](https://www.nhs.uk/conditions/periods/)) | Accurate | None |
| "Usual" cycle range | "Most cycles are between 21 and 35 days" for everyone | NHS England: 21-35 days normal ([NHS](https://www.nhs.uk/conditions/irregular-periods/)); NI/Wales sites accept 21-40 ([nidirect](https://www.nidirect.gov.uk/conditions/period-problems)); FIGO normal frequency 24-38 days ([Merck summary of Munro 2018](https://www.merckmanuals.com/professional/multimedia/table/normal-menstrual-parameters)) | Generally accurate for adults, but **age-blind** and one source among several | Say "most adults' cycles are 21-35 days" and make the flag depend on life stage (below) |
| Adolescents | Same 21-35 flag; a 42-day cycle told "You may want to tell your doctor" | In the first years after periods start cycles of 21-45 days are normal; irregularity is expected in the first year ([ACOG CO 651](https://pubmed.ncbi.nlm.nih.gov/26595586/) (the exact 21-45 figure is from secondary summaries of it, which I could not re-open); the international adolescent PCOS guideline tiers: [BMC Medicine table](https://bmcmedicine.biomedcentral.com/articles/10.1186/s12916-020-01516-x/tables/4)) | **Potentially misleading** (causes needless worry) | Ask once "When did your periods start (year)?" or "Under 20?"; use 21-45 for the first 3 years; wording "Periods are often irregular in the first years" |
| Variation / regularity | Flags a spread of more than 7 days between shortest and longest cycle, for all ages | FIGO regularity: 7-9 days depending on age band ([Merck summary](https://www.merckmanuals.com/professional/multimedia/table/normal-menstrual-parameters)). The summaries I found disagree on which band gets 7 vs 9, and I could not open the primary paper | **Unable to verify the exact age bands**; single threshold is in the right range | Check the Munro 2018 paper before changing; show the flag only after 3+ cycles |
| Phase labels (Bleeding / Follicular / Ovulation / Luteal) | Assigned for every day, including day 45, 100 and 205 of a cycle | Phase timing varies by person and cycle; a "cycle day 205" has no luteal phase | **Medically incorrect in long gaps; incomplete otherwise** | Stop assigning phases after about 45-60 days with no new start; say "No period recorded for N days" |
| Ovulation date | "Ovulation is likely around 28 Nov (a guess)"; a day is marked "Likely ovulation day (a guess)" | Calendar methods assume ovulation 14 days before the next period; real luteal phases vary widely (10 days or more, not fixed at 13-14; short luteal phases were common in a 2024 cohort) ([Human Reproduction 2024](https://academic.oup.com/humrep/article/39/11/2565/7775370)); in a large app dataset the mean cycle was 29.3 +/- 5.2 days across 612,613 cycles, so a 28-day cycle is not universal ([Bull 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6710244)) | "(a guess)" is honest, but shown for irregular and teen cycles | **Potentially misleading** | Hide ovulation estimates when cycles vary by more than 7 days, or for under-20s; say "can be off by days or weeks" |
| Fertile window | Sheet text "A fertile day (a guess)" exists | Conception occurred only with intercourse in the six days ending on ovulation ([Wilcox NEJM 1995](https://www.ovid.com/journals/nejm/pdf/10.1056/nejm199512073332301~timing-of-sexual-intercourse-in-relation-to-ovulation---)); timing varies cycle to cycle even in regular women ([BMJ 2000](https://www.bmj.com/lookup/volpage/321/1259)) | The window length is consistent with the evidence; I did not see it prominently on screen | Keep the "not birth control" line; do not promote the window for irregular users |
| Next-period range | One logged cycle: guess +/-3 days ("typical 28-day"). Four identical cycles: only +/-1 day. Irregular: very wide | Real cycles vary even in regular users (SD of 5.2 days across all cycles in the 600k dataset, [Bull 2019](https://pmc.ncbi.nlm.nih.gov/articles/PMC6710244)) | **Overconfident** for regular users with few cycles; honest for irregular users | Widen minimum to about +/-3 days until 6+ cycles |
| "Usual cycle" statistic | "Usual cycle 35 days, From-to 18-99" after one 99-day gap | n/a | Misleading: one outlier changes the "usual" | Use the median and show outliers separately |
| Late / missed period | "Your period is a little late. This can happen." next to "79 days later than my guess" and "173 days later" | Pregnancy and stress are the most common causes; GP if 3 periods missed (negative test) ([NHS missed or late periods](https://www.nhs.uk/conditions/missed-or-late-periods/)); ACOG: a gap of 90 days even once is abnormal ([ACOG CO 651 summaries](https://rrmacademy.org/library/acog-committee-opinion-no-651-menstruation-in-girls-and-adolescents-using-the-me-recwnkz9cmxxz7f5b/)) | **Potentially misleading and self-contradictory** | See the Critical items |
| Heavy or prolonged bleeding, pain, bleeding between periods | Not mentioned anywhere; the app records only start dates | NHS: pad changes every 1-2 hours, clots over 2.5 cm, bleeding between periods or after sex, periods lasting more than 7 days: see a GP ([NHS heavy periods](https://www.nhs.uk/conditions/heavy-periods/), [period problems](https://www.nhs.uk/conditions/periods/period-problems/)); FIGO normal duration 8 days or less | **Incomplete (safety gap)** | Add a short "When to see a doctor" page and a heavy/long-bleeding check-in |
| Changing cycles in the late 30s-40s | A single "tell your doctor" flag, no explanation | Early menopausal transition: cycle length differing by 7 days or more in consecutive cycles; late transition: 60+ days without a period ([STRAW+10](https://www.asrm.org/practice-guidance/practice-committee-documents/executive-summary-of-the-stages-of-reproductive-aging-workshopd10-addressing-the-unfinished-agenda-of-staging-reproductive-aging-2012/), [Climacteric 2007 validation](https://pubmed.ncbi.nlm.nih.gov/17453859/)) | **Incomplete** | Add one calm sentence for 40+: "Cycles often change in your 40s"; keep the doctor prompt |
| Mood and energy by phase | "Many women feel more energetic now" (follicular); "Some women feel tired or moody around now. That is normal." (luteal) | Evidence for consistent phase effects on mood/performance is weak and inconsistent ([McNulty 2020 meta-analysis summary](https://pmc.ncbi.nlm.nih.gov/articles/PMC9328165/) and related reviews; I read summaries only) | **Oversimplified** | Reword as "some people notice...; many notice nothing", and add "if it is severe, tell a doctor" |
| Disclaimers | "Guesses only. Not medical advice, and not birth control." / "cannot stop you getting pregnant" | n/a | Accurate and visible | Keep |

## D. Medical safety concerns
1. **A late or absent period is under-explained and contradictory.** After 79 or 173 silent days the app says "a little late. This can happen." while also saying "79 days later than my guess". It never mentions pregnancy. Someone who is pregnant, or whose periods have stopped, could be falsely reassured. (Impact: delayed testing or care. Fix in the Critical section.)
2. **Missing entries look like body signals.** If a user simply stopped logging, Today shows "Day 205 of your cycle" and "Luteal". A made-up phase on a made-up cycle day is misleading.
3. **Teens are alarmed for normal variation** (42-day cycle flagged to the doctor); older women get the same flag with no context. Anxiety, and the flag loses meaning.
4. **Over-trust in ovulation guesses** for irregular cycles, in a country where a calendar app is sometimes used to avoid pregnancy. The "not birth control" line is present, but the screen still says "Ovulation is likely around...".
5. **Narrow predicted windows** (+/-1 day) can lead a regular user to be surprised by a period a few days early or late.
6. **No safety net for heavy/long bleeding or pain**, because the app does not collect it and does not tell people when to seek care.
7. **"That is normal"** after "tired or moody" can dismiss severe premenstrual symptoms.

## E. UI/UX improvements

| Screen | Existing experience | Problem | Suggested improvement |
|---|---|---|---|
| Today (top) | Headline card, then "Want a gentle reminder?" card, then Saathi bubble, then ring | The reminder question pushes the ring far down for every new user until answered; with the banner ad little of the answer remains visible | Move the reminder offer to the bottom or to a one-time popup after day 2; show ring and next period first |
| Today, Persona D/E/F | Phase and "Day 205" shown | Nonsense long-gap state | Add a "No period recorded for N days. Did it come?" state with one button |
| Calendar | Coloured bands, a drop on start days | The legend names phases but not what they mean; many colours at once | Tap a legend chip to read a one-line meaning; keep the day sheet (it explains well) |
| My cycles | "Usual cycle 35 days, From-to 18-99" | One long gap distorts the average | Median, and mark the 99-day cycle as "long gap" |
| Tell me / Add earlier cycles | Calendar sheet per date | Several taps per back-dated entry; no "N weeks ago" chips in the Earlier cycles rows | Add the same chips there |
| Settings | No "Delete all my information"; no app lock | Privacy control gap for a shared phone | Add both |
| Hindi mode | The guide's image label stays English ("Your friendly guide") | Screen-reader users hear English | Localize accessibility labels |
| Ads | Small banner on three tabs; native cards in My cycles/Calendar | Banner shares space with the bottom of Today | Acceptable now; keep ads off the first screen of Today for new users |

### Wording

| Existing | Why it may confuse | Suggested replacement | Medically accurate? |
|---|---|---|---|
| "Your period is a little late. This can happen." (also at 79 / 173 days) | Contradicts the number; plays down a long gap | Up to 7 days late: "Your period is a few days late. This can happen." After 7 days: "Your period is late. If there is any chance you are pregnant, a pregnancy test is a good next step. If it keeps being late, please talk to a doctor." After 60 days: "I have not heard about a period for N days. Did you forget to log one? If not, please see a doctor." | Yes (NHS missed periods page) |
| "173 days later than my guess" | Sounds like a computer error | "No period recorded for 173 days" | Yes |
| "Your last cycle was 42 days. Most cycles are between 21 and 35 days." (to a teen) | Alarms normal variation | "Your last cycle was 42 days. When periods are new, cycles up to about 45 days are common. If they stay this long after your first 2-3 years, or you are worried, tell a doctor." | Yes (adolescent ranges above) |
| "Ovulation is likely around 28 Nov (a guess)" | Looks precise | "My guess is that ovulation is around 28 Nov. This can be off by days or weeks, more so if your cycles change." | Yes |
| "Many women feel more energetic now." | Stronger than the evidence | "Some people feel more energetic around now; many notice nothing." | Yes |
| "Some women feel tired or moody around now. That is normal." | Can dismiss severe symptoms | "Some people feel tired or moody before a period. If it is strong or stops you doing daily things, tell a doctor." | Yes |
| "99 days from your other periods" | Unclear whose days | "99 days since your last period started" | Yes |
| "Usual cycle 35 days" | Outlier-driven | "Typical cycle (middle value): 28 days" | Yes |
| "Your body is getting ready to release an egg" (Follicular) | Fine, but stated as certain | Keep, add "may" for irregular cycles | Yes |

## F. Missing functionality (only what solves a real problem)
1. **"When to see a doctor" page and a heavy/long-bleeding check-in** (essential; ACOG/NHS/FIGO treat bleeding volume, length and pain as the key signs). Privacy: keep local.
2. **Missed-period state with a pregnancy-test prompt** (essential).
3. **Life stage question** (new periods / adult / 40+): changes the thresholds and wording (essential for A and D).
4. **Delete all my information; app lock** (high; shared phones).
5. **Symptoms/pain per day** (optional; helps the doctor; already planned as the day check-in).
6. **Reminder wording check** on the real lock screen (needed to verify discretion).

## G. Prioritized action plan
**Critical:** (1) late/missed period states and wording, including no phases after a long gap and a pregnancy-test prompt; (2) stop showing "Day N" and a phase when no period has been recorded for 60+ days.
**High:** (3) age/life-stage aware flag and ovulation display (teens, 40+, irregular); (4) wider next-period window for few cycles; (5) "When to see a doctor" + heavy/long bleeding and pain guidance; (6) median-based "usual cycle".
**Medium:** (7) reorder Today so the answer comes first; (8) legend meanings; (9) accessibility labels in Hindi; (10) delete-all-data and app lock.
**Nice to have:** per-day symptoms; legend help; chips in Earlier cycles.

## H. Final verdict
1. **Would a first-time user understand it without help?** Yes for the welcome, Today, recording and editing a period. Less so for what the phases mean and why a number is flagged.
2. **Would I recommend it?** Not yet to a teenager or to anyone with long gaps or changing cycles; yes with caveats to a regular adult tracking dates.
3. **Is the medical information trustworthy?** The facts it states (cycle length definition, 21-35 range, "not birth control", "talk to your doctor") are accurate. Its behaviour in edge cases is not: long gaps, young users, irregular and perimenopausal cycles. Several age-band thresholds could not be verified from primary sources.
4. **Before public release:** the Critical and High items in G, plus a clinician review of every threshold (21-35, 7-day variation, 15-day and 60-day questions, 5 bleeding days, 28-day typical, +/-3 days).
5. **Top five changes:** (1) late/missed/long-gap handling; (2) life-stage aware flags and ovulation guesses; (3) honest windows (+/-3 minimum) and median "usual"; (4) "When to see a doctor" with heavy-bleeding and pain check-in; (5) Today layout with the answer first.
6. **What would stop regular use?** On Today: nothing new to read each day (no symptom check-in); two ads plus a reminder card before the answer; no reason to open it between periods; privacy controls missing (delete, lock).

Separate conclusions: **Usability: good for the basic job, needs polish for edge cases. Medical reliability: not approved; accurate where it states facts, unsafe or misleading in the situations listed above. I give no overall medical approval.**

## What I changed on the phone, and put back
Cleared the app's data several times; restored your two periods (10 Oct, 11 Nov) and the reminders switch; the screen timeout (1 minute), stay-awake (off) and text size (100%) are back to what they were; the seven test files I put in Downloads are deleted. Side effects: the app's "installed" date for ad frequency restarted (full-screen ads wait 3 more days), and the Android notification permission is granted.
