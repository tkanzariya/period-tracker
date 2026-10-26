# Data Model (draft v1)

Last updated: 2026-10-27 (Drashti reviewed: good to go; phases added as calculated values)

Described logically. Follows the portability rules in `tech-decisions.md`.

## Principle: store only what she tells us
Cycle length, averages, predictions and flags are **calculated** from her logs. They are never saved as facts, so changing a past entry automatically fixes everything downstream.

## Things we store

### 1. Period
One bleeding episode.
- start date (required)
- end date (empty while ongoing)
- note (optional)

### 2. Daily log
One entry per day she records anything. Phase 1 uses only flow; later phases add the rest.
- date
- flow: none / spotting / light / medium / heavy
- Phase 2: pain level, mood, free-text note
- Phase 2: symptoms (many per day, chosen from a list)
- Phase 2: medications taken (many per day)

### 3. Symptom list / Medication list (Phase 2)
Reference lists she can extend. Starting contents come from Drashti.

### 4. Settings
Reminders, lock, display preferences. Stays on device; included in backup.

## Things we calculate (never stored)
- Cycle length = days from one period start to the next
- Period length = start to end
- Average and spread (variability) over the last 3-6 cycles
- Predicted next start (a range)
- Cycle phases per day (period, follicular, fertile window, ovulation estimate, luteal) and lower-fertility days; see `features.md`
- Irregularity flags (rules from Drashti)

## Rules every record follows
- Unique ID created on the phone (so two phones' data can merge later)
- Created time, last-changed time
- "Deleted" is a mark, not an erase (so a future sync knows it was deleted)
- Calendar days saved as plain dates (no timezone confusion)

## Backup file
One file, containing a format version number, the export date, the app version, and every record above. Restoring it twice never creates duplicates. A spreadsheet-friendly (CSV) version is also produced.

## Technical mapping (for Tirth)
Tables: `periods`, `daily_logs`, `symptoms`, `daily_log_symptoms`, `medications`, `daily_log_medications`, `settings`, `schema_migrations`. All PKs UUID text. Columns `created_at`, `updated_at`, `deleted_at` on every entity table. Postgres-compatible types only.
