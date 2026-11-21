# Open Questions

Last updated: 2026-11-22

| # | Question | Owner |
|---|---|---|
| 1 | Drashti to fill in `docs/review/cycle-review.html` (every number and message in plain words, with Looks right / Needs a change, and a Copy button) and send the answers back. Her symptom list still needed. | Drashti |
| 1f | Guide lady: look, skin tone, hair and name OK? (first drawing is a simple flat illustration, easy to refine) | Tirth + Drashti |
| 1b | Drashti to sign off the colour palette and the wireframes (`design/wireframes.html`); logo already locked as A | Drashti |
| 1e | Week start: Monday (current default, `config/display.ts`) or Sunday? A Settings choice is planned. | Tirth + Drashti |
| 1h | The four GitHub secrets are added (Tirth, 2026-10-28). Still to do: confirm `local\keys\` is backed up in two places (private Drive + USB), then delete the old copy at `D:\CycleSaathi-keys` (left in place because it was open during the move; the copy in `local\keys` is byte-identical). | Tirth |
| 1j | **Version numbering**: re-label the first build from v1.0.0 to v0.1.0 (test build) and keep 1.0.0 for the Play Store launch? Needs: bump `app.json` to 0.1.0 / versionCode 100, delete the published v1.0.0 tag and (by Tirth, in the GitHub web page) its release, then publish v0.1.0. Also decide later whether to pay the one-time Google Play developer fee (the project has been zero-cost). | Tirth |
| 1k | **UX refresh is built** (see roadmap). Tirth: review the screenshots and the rules and texts in `scenarios.md` (including the open items S21-S25), then say go for push and the 0.1.0 release. Nothing is pushed or released without your go-ahead (public repo). | Tirth |
| 1m | Period end removed (decided 2026-11-18). Drashti to confirm: the Bleeding phase is drawn for the first 5 days of each cycle (okay?), and doctors do not need period length. If she wants it back it would be an optional field in a later version. | Drashti |
| 1o | **Reminders** (built in 0.2.0): Drashti to review the notification wording in the review sheet section 7, and say whether 9 in the morning is right. | Drashti |
| 1p | **Day check-in** (0.3.0) and **bleeding heaviness (pads per day): COMING SOON, keep it on the list** (Tirth 2026-11-17). Needs Drashti's symptom list and her yes on bleeding heaviness. | Drashti |
| 1l | **Drashti**: please review the health sentences that will change in the refresh (they stay NEEDS DRASHTI REVIEW) and say whether Hindi and Gujarati should come first or second. | Drashti |
| 1i | Make the GitHub repo private? (It is public; builds and releases still work if private, but then Drashti needs a GitHub login to download a release, so a public Releases link is easier for her. Decide knowingly.) | Tirth |
| 1g | Tirth's phone has the OLD test app "Cadence" (package dev.cadence.app) with test data. The renamed Cycle Saathi installs as a separate new app: uninstall the old Cadence app from the phone. | Tirth |
| 1d | First pushed commit is authored as `kyrithbuilds`. Rewrite it to `tkanzariya` (needs a force-push of a 1-commit repo) or leave it? | Tirth |
| 4 | Clinical thresholds for irregularity (cycle length, period length, variability) | Drashti |
| 5 | What must a doctor-ready report contain? | Drashti |
| 6 | Should the app lock (PIN/biometric) from v1? | Tirth + Drashti |
| 7 | Is this app for tracking only, or also contraception/fertility use? Affects wording and risk. | Drashti |
| 1r | AdMob: real App ID, six ad unit IDs, consent message, payments done and Play listing + `app-ads.txt` (`admob-setup.md`). Test ads only until then. | Tirth |
| 1s | **Audit findings (2026-11-21)**: M1 to M6, M8, M9 are built in the test build (see `improvements.md`). Drashti: open `docs/review/cycle-review.html` (rebuilt with pictures and examples), mark Looks right / Needs a change, especially every "Needs your yes" box (age ranges 45 / 35, silence 60 / 90 days, "a few days late" 7 days, range 3 then 2 days, no ovulation guess under 20, middle-value cycle, new sentences). | Drashti |
| 1t | **C1 optional cloud save (Google sign-in, data online):** decide where the data lives (her Google Drive app folder vs our own server), encryption, privacy wording and Data safety form, cost. Later. | Tirth |
