# Changelog

All notable changes to Cycle Saathi are recorded here.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and the version numbers
follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). How we release is in
[docs/context/release-process.md](docs/context/release-process.md).

Write entries in plain words for the person using the app, not for developers.
Group them under: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.

## [Unreleased]

### Added
- A question "How old are you?" (under 20, 20 to 39, 40 and over; you can skip it), also in Settings. It only changes how wide "usual" is: for example cycles up to about 45 days are common in the first years of periods, and cycles often change in your 40s.
- When a period is late the words now go further: a few days late is "this can happen"; more than a week late mentions a pregnancy test and seeing a doctor if it keeps being late.
- After a long time with no period told (60 days; 90 for under 20 and 40 and over) Today stops showing a day number and a phase and asks "Did a period come that I do not know about?" with a button to tell it.
- My cycles marks a very long cycle as "Long gap" and shows the cycle's label in words next to the icon.
- A start more than a year ago is not accepted any more ("That day is too long ago").
- Ads (test ads for now): a small banner above the bottom tabs, a compact "Ad" card in My cycles and the Calendar, and an occasional full-screen ad after saving a PDF report or earlier cycles (at most once a day, never in your first 3 days). Never while you are telling the app about a period.
- Gentle reminders, made on your phone (nothing is sent anywhere): a heads-up before your period, "Did it start?", "Later than my guess", "Save a copy" and "Tell me about your last period". At most one a day, in the morning. The lock screen only says "A note from your Saathi" unless you choose to show details. Switch each one on or off in Settings, Reminders. Tapping a reminder opens the right screen.
- Today now starts with the answer: "Your period may start in 3 to 9 days", "Period day 2" or "4 days later than my guess".
- Today offers to turn reminders on (once, after your first period).
- Add earlier cycles: tap "Add earlier cycles" in My cycles (or after your first period in the welcome) to enter when each cycle started and how many days the bleeding lasted.
- A not-sure-of-the-day helper when telling the app your last period: Today, 1, 2 or 3 weeks ago.
- A missed or very late cycle (over 60 days from your other periods) now asks "Is that right?" instead of being refused.
- "Save a PDF report" in Settings makes a branded page (usual cycle, shortest to longest, every period with its cycle length and notes) to show a doctor. It replaces the spreadsheet.
- The app is never empty: after you tell it about one period, it shows a clearly marked "typical cycle" guess for your next period, your phases and your fertile days, and swaps to your own pattern as you add more.
- A calendar-style date picker everywhere you choose a day, with Today and Yesterday shortcuts.
- A walkthrough with your Saathi after you first open the app, and again any time from Settings, "How to use Cycle Saathi".
- Language (English or Hindi) is now chosen in Settings.
- Tap any day in the Calendar to change a period, say a period started or ended that day, or add a note.
- Undo after every save and every removal.

### Changed
- The next-period range is never narrower than 3 days each side until you have 6 cycles (then 2), because even regular cycles vary by a few days.
- "Typical cycle" is now the middle value of your cycles, so one very long or very short cycle does not change it. The next-period guess uses it too.
- No ovulation or fertile-day guess for under 20 or when your cycles change by more than a week; Today says why. Other ovulation lines now say the guess can be off by days or weeks.
- Gentler, more careful sentences: "Some people feel more energetic around now; many notice nothing", and tired or moody days now say to tell a doctor if it is strong. "Most adults have cycles between 21 and 35 days" for adults; under 20 is told that cycles up to about 45 days are common.
- The question about a start far from your other periods now says "N days from the closest period I know about".
- The privacy lines now say: "Your cycle information stays on this phone. There is no account. Ads come from Google and never get your cycle information."
- There is no "period ended" any more. You only tell the app when a period started; a cycle runs from one start to the next. No end dates to add.
- The Calendar is simpler: one soft colour per part of the cycle, days that have not come yet are softer, and a drop marks the day each cycle started. Tap a day to see "Day 9 of your cycle".
- My cycles shows each cycle as a range, for example "10 Oct - 9 Nov", and the current one as "10 Nov - Today, Day 9 so far".
- Add earlier cycles only asks for the start day of each one.
- The PDF report no longer has a "period days" column.
- Tell me tabs are shorter: Started, Ended, Note.
- The "typical cycle" sentence shows once on Today, not twice.
- Today is tidier: the "Guesses only" line is a quiet note with an icon, and the extra "Change this period" button is gone (you can still change a period in My cycles or the Calendar).
- Settings, About: the app name and version sit in one row, and "Good to know" opens in its own popup instead of a block of small text.
- The first phase is now called "Bleeding" instead of "Menstrual".
- The big button follows your situation: "Add my last period", then "Period started", then "Period ended".
- Each cycle phase has its own soft colour, in the ring and on the calendar, instead of one red cycle with marks.
- Problems are explained in calm boxes inside the screen, with a button for the next step, instead of Android pop-ups. Questions like "Is that right?" use the app's own popup.
- A new look for every screen: three tabs (Today, Calendar, My cycles) with Settings behind the gear, rounded cards and bigger buttons.
- The version is now labelled 0.1.0 (the test build); 1.0.0 is kept for the public launch.

### Fixed
- The switches in Settings are easy to see in dark mode.
- Adding a new period no longer turned into the "end" of the old one (this gave Day 40 and a calendar that went Bleeding, Ovulation, Bleeding, Follicular).
- The 0.2.0 test build closed itself right after opening on a real phone (the size-shrinking step removed code the ad library needs). Fixed.
- "Day 32" no longer wraps onto two lines inside the ring.
- "Save a PDF report" in the browser preview printed the current screen instead of the report; it now prints the report.
- Your Saathi's hair now covers her head (it looked bald).
- The tour no longer talks about period length on My cycles.
- You could start a second period inside a running one, or two periods on the same day. The app now stops this and says why.
- Dates could not be edited from the Calendar.

## [0.1.0] - 2026-10-28

First build for Drashti to try (a pre-release: not the public launch).

### Added
- Tell the app when a period started and ended, and add a note to any day.
- A guess for the next period, shown as a range (it needs 2 finished cycles first).
- The four cycle phases (Menstrual, Follicular, Ovulation, Luteal) and the fertile days, always called estimates. "Lower-fertility days" are hidden unless turned on.
- Calm notes when something looks unusual ("You may want to tell your doctor"), never a diagnosis.
- Today screen with your Saathi (a friendly guide who talks to you by name) and a ring showing where you are in your cycle.
- Calendar with phases, fertile days, ovulation day and the expected next period.
- My cycles: usual cycle and period length, a chart of recent cycles, and a list you can change or remove from.
- Settings: your name, save a copy of your information, save a spreadsheet to show a doctor, and bring your information back (safe to do twice).
- Light and dark looks that follow your phone, and simple everyday wording throughout.
- The Cycle Saathi name and logo.

### Notes
- Works on 64-bit Android phones (almost every phone from the last several years).
- All information stays on the phone. There is no account.

[Unreleased]: https://github.com/tkanzariya/period-tracker/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/tkanzariya/period-tracker/releases/tag/v0.1.0
