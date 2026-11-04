# How we build: standards learned from Tirth's feedback

Last updated: 2026-11-05

These apply to every feature, in this app and in HomeHisab. UX and wording detail is in `ux-standards.md`; this file is the short checklist of habits.

## Product and UX
1. **Look at it, never assume.** Every UI change is checked on a screenshot (`node scripts/scenario-shots.js`, light, dark, Hindi) or the phone. "It compiles" or "the build finished" proves nothing.
2. **No Android system dialogs.** Own popups only, a toast with Undo for anything reversible, calm amber notes inside a sheet for problems. Never red except the remove button.
3. **The main button follows the situation.** One label that says what happens next ("Period started" / "Period ended"), never a button that is wrong for the current state.
4. **Never leave an empty app.** If real data is missing, show a clearly labelled typical estimate (with an "estimate" tag), then replace it as the user's own data arrives.
5. **Validate every action.** For each thing a user can do, list what they must not be able to do (see `scenarios.md`), write the rule in one pure function, test it by name, and put the words in the wording file. Ask Tirth to decide the rules and texts.
6. **Dates are picked on a calendar**, never typed or stepped.
7. **Every input shows an example.** Wording is typed English and Hindi (same keys, a parity test); language is chosen in Settings, never on the home screen.
8. **Teach in one minute.** First-run welcome, then an optional tour, replayable from Settings.
9. **Colour has a job.** Each cycle phase has its own soft gradient colour; never a whole cycle in one alarm colour, and never colour as the only signal (icon and word too).
10. **Follow the system** for light and dark (no theme switch). Settings stay small and grouped.

## Engineering
1. Pure logic in `domain/` with tests; screens hold no cycle maths and no literal text.
2. Every action returns a result (done + undo, or a problem), so screens never guess.
3. Run `npx tsc --noEmit` and `npm test` before every commit; add a test with every rule.
4. One user-visible change = one plain line in `CHANGELOG.md` under Unreleased, in the same commit.
5. Never run broad process kills or touch the signing key; ask before anything outward-facing (push, release).
