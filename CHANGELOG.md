# Changelog

All notable changes to Cycle Saathi are recorded here.

The format follows [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/) and the version numbers
follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html). How we release is in
[docs/context/release-process.md](docs/context/release-process.md).

Write entries in plain words for the person using the app, not for developers.
Group them under: **Added**, **Changed**, **Deprecated**, **Removed**, **Fixed**, **Security**.

## [Unreleased]

### Added
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
- Today is tidier: the "Guesses only" line is a quiet note with an icon, and the extra "Change this period" button is gone (you can still change a period in My cycles or the Calendar).
- Settings, About: the app name and version sit in one row, and "Good to know" opens in its own popup instead of a block of small text.
- The first phase is now called "Bleeding" instead of "Menstrual".
- The big button follows your situation: "Add my last period", then "Period started", then "Period ended".
- Each cycle phase has its own soft colour, in the ring and on the calendar, instead of one red cycle with marks.
- Problems are explained in calm boxes inside the screen, with a button for the next step, instead of Android pop-ups. Questions like "Is that right?" use the app's own popup.
- A new look for every screen: three tabs (Today, Calendar, My cycles) with Settings behind the gear, rounded cards and bigger buttons.
- The version is now labelled 0.1.0 (the test build); 1.0.0 is kept for the public launch.

### Fixed
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
