# Decisions Log (append-only)

Last updated: 2026-11-17

## 2026-10-26
- Project goal set: cycle-tracking app for Drashti, built solo by Tirth. Start with basic tracking, then improve.
- Drashti researches existing apps in parallel while Tirth builds the foundation.

## 2026-10-27
- **Platform: Android only**, APK distribution. Why: Tirth's choice; avoids Play Store fee.
- **Storage: local on-device**, with easy export/import for later cloud migration. Why: zero cost, privacy, simplicity.
- **Audience: Drashti only for now.** Privacy-law work deferred.
- **Budget: zero/minimal** is a hard constraint.
- **Phase 0 must be solid**: plan features, design, logo before development.
- **Context rule**: all context kept in `docs/context/*.md`, updated every turn (rule in CLAUDE.md).
- **Stack confirmed**: Expo + React Native + TypeScript + expo-sqlite. Scaffolded in `app/`; typecheck and `expo-doctor` (20/20) pass.
- **Not named "Period Tracker"**: name will change. Working codename "Cadence" (placeholder, easy to rename).
- **Repo layout**: docs at root, Expo app in `app/`.
- **Feature plan** written (`features.md`) and **data model draft** (`data-model.md`): store only user input, calculate everything else.
- Tirth wants explanations logical rather than technical.

## 2026-10-27 (later)
- **Cycle phases added to Phase 1** (period, follicular, fertile window, ovulation estimate, luteal), calculated from start dates; ovulation ≈ 14 days before next predicted start. Why: requested by Tirth/Drashti; cheap to compute.
- **"Safe period" wording rejected**; proposed "Lower-fertility days (estimate)" + not-contraception note. Why: calendar method is unreliable and the word invites contraception use. Pending Drashti's confirmation.
- **Drashti reviewed** features.md and data-model.md: data model approved. Her phase feedback was not found in the repo files (asked Tirth for it).
- **Design principles** follow Apple HIG (dickwu/apple-design-skill), adapted for Android. Palette: primary rose #C9265F (dark #F2708F), off-white background #FBF6F2; AA contrast verified. Lock UI direction before building.
- **Git**: remote is https://github.com/tkanzariya/period-tracker. Rule: all code goes through git and is pushed.
- **Logo locked: concept A (Ring).** Git commit identity: `tkanzariya` (repo-local config; first commit was authored as kyrithbuilds).
- **Android toolchain** installed on D: (C: has only ~13 GB free): JDK 17 (Temurin, via winget) and Android SDK at `D:\Android\Sdk`.
- **Phases confirmed (Tirth):** Menstrual, Follicular, Ovulation, Luteal. Fertile window and lower-fertility days are overlays. "Lower-fertility days (estimate)" accepted instead of "safe period".
- **Day counts are configurable** in `app/src/config/cycleRules.ts`; defaults from published ranges (cycle 21-35d, luteal 14d, fertile window -5/+1 around ovulation, variation flag 7d). Why: Drashti isn't available to confirm; Tirth can tune later. Still `NEEDS DRASHTI REVIEW`.
- **First end-to-end run succeeded** on Tirth's phone (debug build, template screen). Pipeline proven: edit, build, install via USB.
- **Wireframes drafted** for 6 screen states (`design/wireframes.html`, specs in `design.md`). Decisions: 4-tab bottom nav, Log as bottom sheet, lower-fertility days hidden by default (opt-in in Settings), calendar uses non-colour markers (bar/star/dashed outline) so phases are not colour-only.
- **Build started**: domain logic first (pure, tested), then SQLite, then Today + Log screens. Navigation: Expo Router. Prediction range = expected ± max(1, ceil(std-dev of recent cycles)). Phase after the predicted start with no new period keeps showing luteal and raises a calm "past the expected range" flag. Logging rules: no future dates; a period start inside an existing period is refused; "period ended" closes the latest open period.
- **Feedback round (Tirth, relaying Drashti):** (1) wording too technical: rewrite everything in plain, personal, basic-English; (2) add a friendly guide lady and more graphics, app felt dull; (3) skip "flow" completely; (4) Drashti must be able to review all calculations without reading `cycleRules.ts`; (5) logo not visible (app icon was default). Actions: all wording moved to `ui/copy.ts` and rewritten; guide avatar + speech bubble + cycle ring built; flow removed (DB migration v2 drops the column); generated plain-language review sheet `docs/review/cycle-review.html`; icons generated from logo A; asks her name on first run; tabs renamed (History -> My cycles); Log sheet -> "Tell me".
- **Phone-free build (Tirth: "work on it without connecting my phone")**: built backup/restore, Settings, My cycles (+ edit/remove period) and Calendar, verified through a browser preview + headless Edge screenshots and scripted flow checks (add note, edit period, overlap refused, backup/CSV download, restore twice, bad file, delete). Not yet tested on the phone.
- Bug found and fixed by the flow checks: the edit-period screen showed today's dates when opened before data loaded (state initialised too early); the form now only mounts once the period is known. Also added `goBackOrHome` so closing a screen opened directly lands on Today.
- Decision: restore keeps what she already has when a row exists with the same id or the same date (never overwrites newer data); deleted rows travel in backups so a future cloud sync can learn about deletions.
- **Phone test (2026-10-27)**: new build installed and checked by screenshots on the real phone. Works: all four tabs, dark mode follows the phone, share sheet for the backup file, file picker, restore. Small fix after seeing it on device: a one-day period now reads "27 Oct", not "27–27 Oct" (test added, 72 tests). The test backup file I pushed to the phone's Download folder was removed again. Android Play Protect asks "Send app for a security check?" after each install; "Don't send" chosen.
- **Tirth's notes after the phone test (2026-10-27)**: (1) new logo supplied and applied (commit 621c00b, by a forked session); (2) rename the app to something relatable, not generic, containing "Cycle", and confirm with him before changing anything; (3) builds are slow and show no progress: wants a way to see progress and ideally generate builds himself in a few clicks to save tokens; (4) needs a way to test on the PC without the phone; (5) keep APK size minimal where possible. Actions: one-click scripts with live progress (`scripts/*.bat`), 64-bit-only + minify + shrink + more Gradle memory, browser preview as the PC test path (emulator not possible: BIOS virtualization off), name shortlist researched, release APK paused until the name is confirmed.
- **App name chosen: Cycle Saathi** (Tirth, 2026-10-27), from the shortlist Cycle Saathi / Cyclekind / Cycle Mitra. Why: contains "Cycle", relatable (saathi = companion in Hindi/Gujarati, fits the guide lady), no existing app found in a web search (trademark, Play Store and domain not checked). Rejected: names with "Sakhi" (several period trackers already use it), CycleWise (several iOS apps). Applied: app name/slug/scheme, Android package id com.cyclesaathi.app (installs as a new app), database file, backup format name (old cadence-backup files still readable), build output name, Settings footer shows the name, the guide introduces herself as "your Saathi".
- **Cloud builds approved (Tirth, 2026-10-27)**: builds on this PC are slow and fragile (2013 CPU, memory pressure, Windows path limit); connecting the phone does not help because the PC does the build. Added a free GitHub Actions workflow (`build-apk.yml`) so the APK can be built with a few clicks off-PC. Local builds kept as a fallback (short-path copy at D:\cs; Gradle 3 GB). Lessons: leftover Gradle daemons ate RAM and made the C++ compiler crash; a "completed" background task never proves a build worked.
- **Signing key and first release for Drashti (Tirth approved, 2026-10-28)**: generated one release key (outside the repo) so updates keep Drashti's data; builds sign with it locally and in the cloud; a `v*` tag publishes a signed APK as a GitHub Release (refuses without the key secrets). Passwords were generated by script and stored only in the key folder, never shown in chat. Secrets must be entered into GitHub by Tirth himself. Public Releases page chosen as the easiest way for Drashti to download (repo is currently public).
- **Changelog, release process and versioning (Tirth asked, 2026-10-28)**: added `CHANGELOG.md` (Keep a Changelog 1.1.0 + Semantic Versioning), `docs/context/release-process.md` (policy + checklist for every release + Play Store extras) and a mandatory rule in `CLAUDE.md` (changelog line in the same commit as each user-visible change; follow the checklist every release). The cloud build now refuses a release unless the tag, `app.json` version, versionCode (= MAJOR*10000 + MINOR*100 + PATCH) and a changelog section all agree, uses the changelog section as the release notes, and marks 0.x as a GitHub pre-release. Tirth's question: the first build is a test version, so should 1.0.0 be kept for the official Play Store launch? Recommendation: yes. Use 0.y.z for testers and 1.0.0 for the public launch. PENDING his confirmation: re-label the published v1.0.0 as v0.1.0 (nobody has installed it yet).
- Dev phone is connected with USB debugging; `adb`/Android SDK not found on PATH yet (needs setup before first build).

## 2026-10-27: Logo changed to Tirth's own sketch (drop + flowing line + sparkle + crescent)
- **Decision:** Replace concept A "Ring" with Tirth's sketch, redrawn as vector. Icon is full colour on blush `#FCEDE7`; themed icon is single colour; logo also shown in Settings.
- **Why:** Tirth had a specific design in mind; the Ring was a stand-in.
- **Alternatives rejected:** keeping the Ring on rose (superseded); keeping the "no gradients" icon rule (the sketch's gradients are the design).

## 2026-11-02: Adopt the same UX and wording standards as HomeHisab
- **Decision:** Tirth asked for the design, UX and wording standards decided for HomeHisab to apply here too, adapted to a health app. Written as `docs/context/ux-standards.md` (identical core in both repos, an app-specific table, and an audit of this app with a refresh plan). `CLAUDE.md` and `design.md` now point to it.
- **Why:** HomeHisab's first phone test showed what users notice first: too much reading, stacks of generic buttons, ugly Android dialogs, no examples in inputs, settings scattered. The same test found a keyboard-hides-Save bug that this app very probably has on the same phone.
- **What changes (planned, not yet built):** three tabs + a gear for Settings, floating "Tell me", answer-first Today, own popups and Undo toasts, examples under inputs, typed English/Hindi wording, permissions reviewed.
- **Alternatives rejected:** a full visual redesign (the tokens, phase colours, logo and guide already work and Drashti is attached to them); copying HomeHisab's screens (different job: health tracking, not budgeting).
- **Not touched:** the cycle maths, predictions, phase logic and every health threshold.

## 2026-11-05: UX refresh built (before the first release), version relabelled 0.1.0
- **Decisions (Tirth's feedback):** (1) label the first build v0.1.0, keep 1.0.0 for the Play Store launch; (2) never an empty app: a typical 28-day cycle (range ±3 days) fills next date, phases and ring until her own pattern is known, labelled "Typical cycle"; (3) calendar-style date picker; (4) the main button follows the stage (none / in period / unfinished / between); (5) no Android alerts: own popups, amber inline notes, Undo toasts; (6) separate soft gradient colour per phase, no underlines or stars; (7) first-run welcome and a replayable tour; (8) language in Settings; (9) follow `ux-standards.md` and the Apple HIG skill (alerts rare, onboarding short and optional, no theme toggle: follow the system).
- **Why:** "feels empty and useless", "I can start my periods twice, no validation", "I hate the Android popup", "I cannot edit dates from the calendar".
- **How:** structured validation in `domain/validation.ts` (codes, wording separate in `i18n`), `ActionResult` with undo from every action, three-tab shell, sheets for Tell me and Change period, typed English/Hindi with a parity test. 201 tests; every flow checked by screenshots in light, dark and Hindi (`scripts/scenario-shots.js`).
- **Rejected:** a theme toggle (follow the system), a separate date typing field, popups for common undoable actions.
- **Still NEEDS DRASHTI REVIEW:** all new thresholds (15 / 14 / 10 days, typical 28 and ±3) and every health sentence; Hindi needs a Hindi speaker's review. Pending Tirth: scenario rules and texts in `scenarios.md`, then push and release as 0.1.0.

## 2026-11-06: Drashti's first feedback on the refresh
- **Done:** (1) Saathi's hair fixed (face peeked above the hair); (2) tour wording "See how long each cycle was" (no period); (3) "Save a spreadsheet" (CSV) replaced by "Save a PDF report", branded (logo, name, date, summary, history table, disclaimer), made with `expo-print` (free, small), words in `i18n` (`report.*`), tested; (4) `docs/review/cycle-review.html` regenerated from code with new sections 4-6 (checks and every problem message, Saathi lines and main button, welcome/tour/report) so it matches the app.
- **Open:** Drashti asked to say "Cycle ended" / "Current cycle end" instead of "Period ended" / "Did your period end?", because a cycle only starts and ends at the next start. Meaning unclear (rename only, or drop the period end day). Question put to Tirth; see `open-questions.md`.

## 2026-11-06: Bleeding, and first-open/history rules
- **Decisions (Tirth):** phase "Menstrual" renamed **Bleeding** (English and Hindi); keep the end-of-period day because history entry asks start date + bleeding days; first open asks only the current cycle start with rough-day chips; 60+ day gaps and starts under 15 days apart ask "Is that right?". See `scenarios.md` F1-F6.
- **Built (same day):** welcome rough-day chips + history offer, "Earlier cycles" screen (also from My cycles), 60-day gap question (`longGapDays`), one-Undo bulk add; 217 tests. History rows always get bleeding days (default 5) so no earlier cycle is left open (an open older period would block later starts).

## 2026-11-17: Direction: helpful for all women, notifications, ads later
- **Tirth asked** for an analysis of UI and features, unique features other apps lack, notifications for engagement, and final AdMob placements (to be added later).
- **Decided:** ad placement (banner above the tab bar on the three main screens; native in the My cycles list; interstitial only after the PDF share or saving earlier cycles, max 1 a day; rewarded "no ads for 3 days"; no app-open ad; never on forms, welcome, popups or the report). Notification set N1-N9, all on-device, max one a day, discreet by default.
- **Changes earlier decisions:** ads and a wider audience were non-goals (`product-vision.md`); "no data leaving the device" and zero cost are affected by ads (`constraints.md`). Flagged as open question 1n; nothing built.
- **Rejected:** app-open ads; ads that gate the doctor report or backup; personalised ads; streaks or guilt messages.
- Full plan: `improvement-plan.md`.

## 2026-11-17: Tirth's decisions on the improvement plan; 0.2.0 built
- **Accepted:** the ad changes (open question 1n): privacy wording will change and the Play Store listing and fee are accepted. An AdMob account exists; **test ads only for now**; full guide in `admob-setup.md`. Plain AdMob first: no mediation or waterfall until real traffic.
- **Keep, coming soon:** bleeding heaviness (pads per day), parked in October, now marked COMING SOON in the plan, features and open questions.
- **Agreed:** the order of work in `improvement-plan.md` section 6.
- **Built as 0.2.0:** answer-first Today (headline, late and unfinished states, one "typical cycle" line, shorter Tell me tabs); reminders N1-N5 and N9 (planned by `domain/reminders.ts`, 11 tests; scheduled on the phone with expo-notifications; 9 am, max one a day, discreet lock-screen text by default, per-kind switches in Settings, permission asked only when she says yes on Today or turns the switch on); tapping a reminder opens the right sheet. 234 tests.
- **Why:** the plan; Drashti and Tirth want the app to help every day, not only when she opens it.
- **Not verified:** real notifications on a phone (the browser preview has none).

## 2026-11-18: 0.2.0 crashed on the phone at start-up; fixed
- **What happened:** the first 0.2.0 build closed itself right after opening. Phone log: `Failed to create an instance of androidx.work.impl.WorkDatabase` from `androidx.startup.InitializationProvider`. Cause: the ad library brings in Android's WorkManager (Room database), and the release size-shrinking step (R8 minify) removed code it needs.
- **Fix:** keep rules for `androidx.work`, `androidx.room`, `androidx.startup` in `app.json` (`expo-build-properties` `extraProguardRules`). Checked on Tirth's phone (Samsung, `adb`): installs over the old app, opens, no crash, welcome and Today show. First attempt failed in the cloud because I wrote the rules with real line breaks inside the JSON; now `
` escapes.
- **Lesson (add to every release):** after any new native library, install the release APK on the phone and read `adb logcat -b crash` before telling anyone it works. A build "success" and a static APK check do not show start-up crashes.
- **Still untested on the phone:** reminders and the permission prompt, the PDF share, add-earlier-cycles.

## 2026-11-18: No "period end" at all (Tirth, after testing on his phone)
- **Decision:** the app has no period end. A cycle starts on the day a period started and ends the day before the next start. She only ever tells the app "a period started on this day". This overrides the 2026-11-06 choice to ask for bleeding days in history.
- **Why (found on the phone):** Tirth entered a period on 10 Oct and one on 10 Nov. The big button said "Period ended" (because 10 Oct had no end), so the second entry became an END of the first: one 31-day "bleeding" period, Today said "Day 40", and the calendar showed Bleeding, Ovulation, Bleeding, Follicular. The old rule also made her add end dates before a new start. With only starts, the same data gives Day 9 and a clean Bleeding, Follicular, Ovulation, Luteal order (test `twoCycles.test.ts`).
- **Changes:** removed the "Period ended" button, End date fields, bleeding-day chips, period-length stats and flags, "unfinished period" notice, the "Has it ended?" reminder, all end validation. The first 5 days of each cycle are still drawn as the Bleeding phase (an estimate). Old end dates stay in saved files but are ignored. Calendar: pure phases (no fertile recolouring), days that have not come yet are softer, a drop marks each cycle start, the day sheet says "Day N of your cycle". My cycles lists each cycle as a range ("10 Oct - 9 Nov", "10 Nov - Today, Day 9 so far"). PDF report loses the period-days column. 200 tests.
- **Rejected:** keeping an optional end date (it caused this mix-up); renaming the button to "Cycle ended" (a cycle end is just the next start).
- **Open:** Drashti to confirm 5 bleeding days and that doctors do not need period length (open question 1m).

## 2026-11-18: Ads added to the app with TEST ads (Tirth asked)
- **Built:** banner, native cards, interstitials, rewarded "no ads for 3 days" at the placements decided on 2026-11-17, all using Google test ads (`USE_TEST_ADS = true`), consent at start-up, non-personalised, PG, privacy text changed in two places. Browser preview has no ads (the library is phone-only).
- **Why test ads:** no risk of invalid traffic on the real account, and the real app is not on Google Play yet.
- **Not verified yet:** how the ads look and behave on the phone (needs the new build installed).

