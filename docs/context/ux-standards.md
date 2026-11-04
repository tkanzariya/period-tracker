# UX and Wording Standards (shared by Tirth's apps)

Last updated: 2026-11-04
Applies to: HomeHisab and Cycle Saathi. **Keep the two copies in sync**: the core (sections 1-8) is identical in both repos (`docs/context/ux-standards.md`); section 9 is each app's own adaptation. These rules came out of HomeHisab's first phone test (2026-11-02), where Tirth called the first UI "blocky, generic, too much reading", and from the industry guides he asked us to compare with (Material 3, Android accessibility and quality guidelines, and the habits of the leading budgeting and tracking apps). Ease of use and clarity are the reason someone picks our apps over the market, so they are requirements, not polish.

## 1. Principles
1. **Answer the one question first.** Each main screen has one big answer (HomeHisab: *Safe to spend*; Cycle Saathi: *today's day and when the next period is expected*). Everything else supports it or sits below it.
2. **Show the sum, not just the answer.** When a number is derived, show the 2-3 lines it comes from directly underneath (no extra tap), and offer one tap for the full explanation.
3. **Less reading.** Short labels, one idea per line, an icon with every label, numbers in large type. If a paragraph is needed, it is secondary text in a muted colour, never the main content.
4. **Never leave a number without context.** "About ₹1,430" means nothing; "You can spend about ₹1,430 a week until 1 Dec." does.
5. **Examples everywhere.** Every input shows a real example in its hint ("e.g. ₹2,000 for a doctor visit"), so nobody has to guess what to type or why it matters.
6. **Do the common thing in the fewest taps; allow detail without forcing it.** Quick path first (amount + category), optional detail behind a "More details" or "List each item".
7. **Forgiving.** Every destructive or changing action shows its effect first, and every add/change/delete can be undone right away.
8. **Calm.** No alarm colours, no scolding, no "failed/invalid/error/overspent". Say what happened and what to do next.
9. **Familiar.** Use standard Android patterns so nothing has to be learned: bottom navigation, floating action button, bottom sheets, a gear for settings, back arrow top-left.
10. **Accessible by default** (section 6) and **both languages from the start** (section 2).

## 2. Wording standards
- **All text lives in one typed wording file per language** (`ui/strings/en.ts`, `hi.ts`). Hindi must have exactly the same keys (a test enforces it); screens contain no literal text. Dynamic text is a function (`(amount) => ...`), never string-glued in a screen.
- Reading level: Class 8 or lower. Everyday words. Hindi is spoken Hindi, not textbook; loan words people already use (bill, UPI, backup) stay.
- **Name things by what the person sees:** "Safe to spend" not "available balance"; "Payments every month" not "recurring transactions"; "Tell me" not "log".
- **Buttons say what will happen, with the value:** "Save ₹450", "Mark as paid", "Start the new month". Never a bare "Submit"/"OK". Secondary action is a plain text or tonal button.
- **Hints and examples:** label above the field (bold), example/purpose below it (muted, 14sp). Placeholders are examples, not instructions.
- **Errors and empty states:** what is missing + the next step ("Type the amount first."), never blame. Empty states say what will appear here and what to tap.
- **Effects are written in the person's terms:** "Safe to spend goes down by ₹320." not "balance updated".
- Numbers: ₹ with Indian grouping (₹1,23,456); amounts being typed are grouped live; whole rupees unless paise matter; negative with a real minus sign.
- No guilt or shame; no advice the app is not qualified to give (finance: informs, never advises; health: tracks and informs, never diagnoses).

## 3. Structure and navigation
- **At most 4 bottom tabs**, each with an icon and a one-word label that never breaks at 200% text (one line, shrink to fit, max 1.3x).
- **Primary create action = extended floating "Add" button** (Android pattern) on the tabs where adding happens. Not a tab. It slides away while the list scrolls down and returns when scrolling up, so it never hides a row's own button.
- **Settings = a gear icon at the top right of every tab.** Settings is a **grouped list** (General, Your money/data, Your data, About), each row with an icon, title, one-line current value and a chevron. Things set once and changed rarely live here (language, dates, categories, recurring items, backup), not on the home screens.
- **A dashboard tab for "where did it go / how am I doing"** with a date filter (default = the current period), headline totals with the change against the period before, a ring chart for shares and a bar chart over time. Numbers stay next to every chart.
- Detail pages slide in with a back arrow; quick forms (add, pay, use) are bottom-up modals.
- A screen never ends in a "stream of buttons". More than one secondary action becomes a list of rows or moves to Settings.

## 4. Feedback, errors, dialogs
- **No Android system dialogs (`Alert.alert`) anywhere.** Use the app's own popup: icon, short title, one muted sentence, big stacked buttons (primary first, tonal, then text).
- **Toast with Undo** after add, pay, skip, delete (6 s), shown at the **top right, just under the header** (never at the bottom, where the Add button is). Delete is confirmed with a popup that states the effect first.
- **Delete and remove buttons are solid red** (the `danger` colour, white text, a trash icon and the word). Red is used for nothing else; errors and warnings stay amber.
- Errors are inline cards in the amber "attention" tone (never red: red means "this deletes something"), plus the next step.
- Backups, restores and other file actions use the system share sheet / picker (unavoidable) but report the outcome in our own wording.

## 5. Forms and input
- **Amounts: the phone's own number keyboard** (decimal pad), opened straight away on the quick-add screen with the amount shown large above it (Tirth, 2026-11-04: a custom keypad felt wrong); `AmountInput` with the same keyboard in settings. Group digits while typing.
- Wrap every screen in `KeyboardAvoidingView behavior="padding"` so Save/Next stay above the keyboard (Android edge-to-edge no longer resizes the window).
- Fields: 52dp tall, soft filled background, 14dp radius, label above, hint below. Give every field a **unique accessibility label** ("Item 1 ₹").
- Choices: pills for few options, tiles with coloured icons for categories, a segmented switch for 2-3 modes, switches for on/off with a one-line explanation.
- Date: tap opens a simple month calendar (no native picker dependency).
- Optional detail is collapsed by default; "More details" expands it.

## 6. Accessibility (blocking)
Text contrast 4.5:1 (large 3:1) in light and dark, verified by a unit test on the tokens; tap targets at least 48dp; works at 200% system text; colour is never the only signal (colour + icon + word); icon buttons have labels; no nested pressables; reduce motion respected.

## 7. Visual system
Soft rounded cards (20dp, hairline border), roomy spacing (16dp margins, 4dp grid), one filled button per screen, tonal secondary, pill chips, coloured circular icons for categories/rows, a selected bottom tab shown as a rounded pill (give the pill its background colour from the start, transparent when off: on Android a colour added later loses the rounded corners), big numbers (40sp+) for the main answer, muted secondary text, system font. Category and chart colours come from one checked palette (12 colours, light and dark shades). Everything uses theme tokens, never raw hex.

## 8. How we verify (every UI change)
1. `npx tsc --noEmit` and `npm test` (the tests include wording parity EN/HI and colour contrast).
2. A scripted browser walk-through of the main flows in light **and** dark mode, looking at the screenshots (not just "no errors").
3. Cloud build only (never the PC), verify the signed APK, then a guarded phone test: only send taps while the app is in front, restore any setting changed, delete screenshots of anything else.
4. At 200% text and in Hindi for the new screens.

## 9. Per-app adaptation
| Standard | HomeHisab (money) | Cycle Saathi (health) |
|---|---|---|
| The one answer | Safe to spend + the sum under it | "Day X of your cycle" + next period range |
| Primary action | Floating Add (spent/received) | Floating "Tell me" (period started/ended/note) |
| Tabs | Home, History, Insights | Today, Calendar, My cycles (Settings becomes the gear) |
| Dashboard | Insights: ring by category, bar per day | My cycles: cycle length bars, period length trend, usual range |
| Voice | Plain, reassuring, never advises | Warm, personal, the Saathi guide; never diagnoses; guesses are called guesses |
| Guide | Gullak pot | Saathi lady |
| Privacy | No internet permission; nothing sent anywhere | Same: health data never leaves the phone |
| Sensitive wording | Money: "over what was planned" | Health: anything clinical is marked NEEDS DRASHTI REVIEW |

## 10. Cycle Saathi: audit of the app as released (2026-11-02) and the refresh plan
Method: read the code of every screen (`app/src/app`, `ui/`, `ui/copy.ts`, `ui/dialog.ts`) and compared it with sections 1-8. The app is already close on tone, tokens, the guide, icons and plain wording; the gaps are in feedback, forms, structure and a few quality bugs.

### A. Quality and correctness (do first; small, safe, no change to health logic)
| # | Finding | Evidence | Fix |
|---|---|---|---|
| A1 | The Save button can sit behind the phone keyboard on Android | `log.tsx` uses `KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}`; Android 15/16 edge-to-edge no longer resizes the window (HomeHisab hit exactly this on the same Samsung phone on 2026-11-01) | `behavior="padding"` on every form screen (Log, Change this period, Settings name); verify on the phone with the keyboard open |
| A2 | Eight Android system dialogs | `ui/dialog.ts` wraps `Alert.alert`; used 8 times (backup saved/restored/problems, cannot save, remove note, delete period) | Replace with the app's own popup + toast (section 4); keep the same wording but shorter; the browser preview also gets real popups instead of `window.alert/confirm` |
| A3 | No Undo although `design.md` requires every destructive action to be undoable | Removing a note or a period only asks first | Toast with Undo after remove/save (soft delete already exists in the repository) |
| A4 | Permissions never reviewed in a health-privacy app | `app.json` has no `blockedPermissions`; Expo adds INTERNET, SYSTEM_ALERT_WINDOW and storage permissions by default | Run `aapt2 dump permissions` on the released APK; block everything not needed (target: VIBRATE only, as in HomeHisab) and say so in the privacy text |
| A5 | Wording is one file of constants (`copy.ts`), not translatable | `STR.*` constants and functions in a single language | Move to typed `strings/en.ts` + `hi.ts` (+ `gu.ts` later) with a parity test; "Saathi" is a Hindi/Gujarati word, so these two languages are the natural next ones |

### B. Clarity and ease of use (the refresh)
| # | Finding | Standard | Change |
|---|---|---|---|
| B1 | Today: the main actions ("My period started/ended", "Add a note") sit at the bottom of a long scroll under the ring, prediction card, flags and a disclaimer paragraph | 1, 3, 9 | Floating **Tell me** button always visible; answer first (day + phase + next period range), flags below, disclaimer shortened to one muted line (the full text lives in About and the first-run welcome) |
| B2 | Today shows up to five stacked cards and a paragraph of small print: too much reading | 3 | One hero card (ring + "Day 12 of your cycle" + phase chip with its one-line meaning), one "Next period" card with the range, optional doctor card; nothing else |
| B3 | Tell me screen: three large radio cards, two day chips, a stepper, a free note and a generic "Save" | 2, 5 | A bottom sheet: segmented choice (Started / Ended / Note), day chips + calendar date, note field with example ("e.g. cramps, travelling, took medicine"), button that says the outcome ("Save: period started today"), Undo toast after |
| B4 | Settings is a tab and a flat page of three cards (name field takes a whole card) | 3 | Gear at the top right of each tab; grouped hub: About you (name), Language, Appearance (Theme, Week start), Your information (backup, spreadsheet, restore), Reminders (later), About; each row icon + title + current value |
| B5 | Four tabs, one of them Settings | 3 | Three tabs: Today, Calendar, My cycles (+ gear) |
| B6 | "My cycles" has a bar chart but no filter and no summary trend | 3 | Date/size filter (last 6 / 12 cycles / all), period length trend, usual range band kept; numbers next to the chart |
| B7 | Name and disclaimer are mixed into the first Today screen | 1, 6 | A short welcome: what the app does + the disclaimer, then name, then "tell me your last period"; each step has an example and a reason ("so I can call you by name") |
| B8 | Empty/first-run states depend on the guide only | 1, 5 | Keep the guide, add the one next action as a visible button |
| B9 | Accessibility not yet re-checked at 200% text and in dark mode after the plain-language rewrite | 6, 8 | Run the verification list in section 8 for every changed screen |

### C. Process for the refresh
1. **Drashti reviews every health-related sentence that changes** (they stay marked NEEDS DRASHTI REVIEW until she confirms); the cycle maths in `domain/` is not touched.
2. Build in the order A (quality) then B1-B5 (Today, Tell me, Settings, navigation) then B6-B9, one commit per step, each with a changelog line.
3. Cloud build + guarded phone test (section 8) before each release; the release follows `release-process.md` in full.
4. Nothing is pushed or released without Tirth's go-ahead (the repository is public).
