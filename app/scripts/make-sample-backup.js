/**
 * Writes app/sample-data/sample-backup.json: fake cycles, relative to today, in the app's
 * backup format. Load it with Settings > "Bring my information back" (browser or phone)
 * to test with realistic data. Run: node scripts/make-sample-backup.js
 */
const fs = require('fs');
const path = require('path');

const pad = (n) => String(n).padStart(2, '0');
const fmt = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);

const today = new Date();
// Newest period started 12 days ago. Cycle lengths, oldest to newest: includes one long cycle.
const lengths = [30, 28, 29, 38, 28];
const periodDays = [5, 5, 5, 7, 5, 5];
const starts = [addDays(today, -12)];
for (let i = lengths.length - 1; i >= 0; i--) starts.unshift(addDays(starts[0], -lengths[i]));

const ts = new Date().toISOString();
const periods = starts.map((s, i) => ({
  id: `sample-period-${i + 1}`,
  start_date: fmt(s),
  end_date: fmt(addDays(s, periodDays[i] - 1)),
  note: null,
  created_at: ts,
  updated_at: ts,
  deleted_at: null,
}));
const lastStart = starts[starts.length - 1];

const backup = {
  format: 'cycle-saathi-backup',
  schema_version: 2,
  exported_at: ts,
  app_version: '1.0.0',
  data: {
    periods,
    daily_logs: [
      { id: 'sample-note-1', date: fmt(addDays(lastStart, 1)), note: 'Felt tired and a bit crampy', created_at: ts, updated_at: ts, deleted_at: null },
    ],
    settings: [{ key: 'display_name', value: 'Drashti', updated_at: ts }],
  },
};

const out = path.join(__dirname, '..', 'sample-data');
fs.mkdirSync(out, { recursive: true });
fs.writeFileSync(path.join(out, 'sample-backup.json'), JSON.stringify(backup, null, 2));
console.log('Wrote', path.join(out, 'sample-backup.json'));
