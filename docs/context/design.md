# Design

Last updated: 2026-10-27

Status: **logo locked (A); colours/tokens drafted, awaiting Drashti's sign-off.** Live preview: `design/preview.html` (open in a browser; respects dark mode). Logo concepts: `design/logo/`.

## Design principles (from Apple's HIG, via dickwu/apple-design-skill, adapted for Android)
1. **Clarity**: one primary action per screen; text legible at every size; nothing decorative that carries no meaning.
2. **Deference**: the content (her cycle, her data) is the hero; chrome stays quiet.
3. **Depth/hierarchy**: show importance with size, weight and surface level, not with extra colours.
4. **Familiarity**: standard patterns (bottom navigation, bottom sheets, back navigation) so nothing has to be learned.
5. **Calm**: no alarm colours or urgent wording for health observations; no nagging.
6. **Accessibility is blocking, not polish**:
   - Text contrast at least 4.5:1 (AA); large/bold text at least 3:1. Palette below is pre-checked.
   - Touch targets at least 48dp (Android floor; HIG 44pt is the minimum we never go under).
   - Respect the system font-size setting; layouts must survive 200% text.
   - Never rely on colour alone: every phase/state = colour + icon + word.
   - Reduce motion: swap movement for fades when the system asks.
   - Every destructive action is confirmable and undoable.
7. **Semantic colour**: one colour = one meaning. Primary rose means "act / interactive". Phase colours mean only phases. Components use tokens, never raw hex.
8. **Both themes from day one**: every token has a light and a dark value.

Android adaptations: system font (Roboto) instead of SF; bottom navigation bar; bottom sheets for logging; Material-style 48dp targets.

## Colour tokens (light / dark)
| Token | Light | Dark | Role |
|---|---|---|---|
| `primary` | #C9265F | #F2708F | Buttons, selected tab, links |
| `onPrimary` | #FFFFFF | #1C1417 | Text on primary |
| `primarySoft` | #F9DDE6 | #4A2330 | Soft highlight |
| `background` | #FBF6F2 | #1C1417 | Screen background (the off-white secondary) |
| `surface` | #FFFFFF | #2A1F23 | Cards, sheets |
| `surface2` | #F4EAE5 | #33262B | Tracks, inset areas |
| `line` | #E6D8D1 | #4A3A40 | Dividers |
| `text` | #2B1B20 | #F5ECEE | Main text |
| `text2` | #6B5A60 | #B9A8AE | Secondary text |

Phase colours (always with icon + label):
| Phase | Icon | Light text / bg | Dark text / bg |
|---|---|---|---|
| Menstrual | ● | #C9265F / #F9DDE6 | #F2708F / #4A2330 |
| Follicular | ◐ | #8A5A00 / #F7E8C8 | #E0A93B / #44361A |
| Ovulation | ✦ | #0B6E6E / #D3EEEC | #4FC3C3 / #1B3F40 |
| Luteal | ☾ | #6B4A8F / #E6DDF2 | #B79AE0 / #3A2D50 |

The fertile window and lower-fertility days are overlays (e.g. a subtle outline/dot pattern on the calendar), not extra phase colours.

Verified contrast (light): primary on background 4.98, white on primary 5.35, text 15.3, text2 6.0, phase texts 5.5-6.5. Dark: all 6.4-15.6. Red and green are deliberately not paired.

## Typography (system font, sp)
Large title 34 bold · Title 22 semibold · Headline 17 semibold · Body 17 · Subhead 15 · Footnote 13 (smallest for essential text). Avoid thin/light weights. Max two weights per screen section.

## Spacing and shape
4dp base grid (4, 8, 12, 16, 24, 32). 16dp screen margins. Cards radius 16, buttons radius 14, chips fully rounded. Minimum 8dp between tappable items.

## Navigation
Bottom bar, 4 tabs: **Today, Calendar, History, Settings**. Logging happens in a bottom sheet from Today or the calendar.

## Screens (wireframes: `design/wireframes.html`)
Status: drafted 2026-10-27, awaiting sign-off from Tirth + Drashti. Once signed off, treat as locked; new screens extend, not replace.

| Screen | Purpose and key rules |
|---|---|
| **Today** | Cycle day, current phase chip (colour+icon+word), "next period expected" range, optional "worth mentioning to a doctor" card (calm, never alarming), primary button "Log period start", secondary "Log today". |
| **Today (empty/first run)** | Explains what it needs ("add your last period"); offers "Restore from a backup". No predictions until 2+ completed cycles. First launch shows a one-screen welcome with the disclaimer. |
| **Calendar** | Month grid, Monday-first (configurable). Phase tint + non-colour markers: fertile window = bar under the day, ovulation day = ✦, predicted period = dashed outline, today = outline ring. Legend always visible. Tap a day → Log sheet; selected-day card shows phase and cycle day. Lower-fertility days are NOT drawn on the calendar unless enabled in Settings. |
| **History** | Summary (average cycle, usual range, period length) + bar chart of last 6 cycles with the usual range band; list of cycles (dates, period length, cycle length, "longer/shorter than usual" tag). Tap a cycle to edit. |
| **Log sheet** | Bottom sheet over Today/Calendar for a chosen date. Mode: Period started / Period ended / Just flow. Flow: None, Spotting, Light, Medium, Heavy (icons are drops in `primary`, plus a word). Optional note. Save. When the day already has an entry: Delete (confirm + Undo). Phase 2 adds symptoms/mood/pain here. |
| **Settings** | Your data: Export backup (JSON), Export spreadsheet (CSV), Restore from backup. Display: Theme (System/Light/Dark), Week start, Show lower-fertility days (off by default; estimate-only note). Advanced: Cycle rules (edits `cycleRules.ts` values later), About & disclaimer. |

Navigation: 4-tab bottom bar (Today, Calendar, History, Settings). Log is a sheet, not a tab.
Interaction rules: one primary button per screen; every delete confirmable and undoable; empty states explain the next step; sample/placeholder numbers never shown as real predictions.
Wireframe caveat: flow icons in the mock are emoji; in the app use vector drops in the `primary` token.

## Logo — LOCKED: Concept A "Ring" (Tirth, 2026-10-27)
Open white ring with a marker dot on a rose (`primary`) background: a cycle with "today" marked. Source: `design/logo/concept-a-ring.svg`. Rejected: B (drop in ring), C (four phases; busy at small sizes), kept in `design/logo/` for reference.
Icon rules (HIG): one idea, few shapes, no text, no gradients/shadows/glows, content centred inside the adaptive-icon safe zone, designed so a monochrome (themed) Android icon also works.
Final logo depends on the final name; concepts are name-independent.

## Decisions
- Primary is a red-ish pink; secondary is a warm off-white (Tirth, 2026-10-27).
- Phase colours avoid red/green pairing; teal chosen for fertile window.
- Design system is token-based so new screens inherit the look.
