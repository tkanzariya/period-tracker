import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';
import { addDays, todayLocal, type DateStr } from '../domain/dates';
import { sortPeriods } from '../domain/cycles';
import { checkHistory } from '../domain/validation';
import { useData } from '../state/data';
import { useLanguage } from '../state/language';
import { DateField } from '../ui/DateField';
import { describeIssue } from '../ui/issueText';
import { Button, Card, Chip, Field, Notice, Screen, T, usePopup, useToast } from '../ui/kit';

interface Row {
  key: number;
  start: DateStr;
  days: number;
}

const DAY_CHOICES = [2, 3, 4, 5, 6, 7, 8];
const TYPICAL_GAP = 28;

/** Add earlier cycles in one go: when each started and how many days the bleeding lasted. */
export default function AddCyclesScreen() {
  const { S } = useLanguage();
  const data = useData();
  const popup = usePopup();
  const toast = useToast();
  const today = todayLocal();

  const earliest = sortPeriods(data.periods)[0]?.startDate ?? addDays(today, TYPICAL_GAP);
  const [rows, setRows] = useState<Row[]>([{ key: 1, start: addDays(earliest, -TYPICAL_GAP), days: 5 }]);
  const [nextKey, setNextKey] = useState(2);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  const entries = rows.map((r) => ({ start: r.start, end: addDays(r.start, r.days - 1) }));
  const found = useMemo(
    () => checkHistory(entries, data.periods, today, data.rules),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows, data.periods],
  );
  const hasBlock = found.some((f) => f.issue.severity === 'block');

  const update = (key: number, change: Partial<Row>) => setRows((all) => all.map((r) => (r.key === key ? { ...r, ...change } : r)));
  const add = () => {
    const oldest = rows.reduce((a, r) => (r.start < a ? r.start : a), rows[0].start);
    setRows([...rows, { key: nextKey, start: addDays(oldest, -TYPICAL_GAP), days: 5 }]);
    setNextKey(nextKey + 1);
  };

  async function save() {
    if (busy || hasBlock) return;
    setBusy(true);
    setFailed(false);
    try {
      for (const f of found) {
        const view = describeIssue(f.issue, S, data.rules);
        const yes = await popup.confirm({
          title: S.history.problemIn(f.index + 1, view.title),
          message: view.body,
          yes: view.yes ?? S.common.save,
          no: view.no,
          icon: 'help-circle',
        });
        if (!yes) return;
      }
      const result = await data.addHistory(entries, { confirmed: true });
      if (result.ok) {
        toast.show({ message: S.history.toast(entries.length), actionLabel: S.common.undo, onAction: () => void result.undo() });
        router.back();
      } else {
        setFailed(true);
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen
      title={S.history.title}
      back
      onBack={() => router.back()}
      footer={<Button label={S.history.save(rows.length)} onPress={() => void save()} disabled={busy || hasBlock} />}
    >
      <T muted>{S.history.intro}</T>
      {rows.map((row, i) => {
        const problem = found.find((f) => f.index === i);
        const view = problem ? describeIssue(problem.issue, S, data.rules) : null;
        return (
          <Card key={row.key}>
            <T kind="label">{S.history.cycleN(i + 1)}</T>
            <Field label={S.history.started}>
              <DateField value={row.start} onChange={(d) => update(row.key, { start: d })} label={S.history.started} max={today} />
            </Field>
            <Field label={S.history.bleedDays} hint={S.history.bleedHint}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {DAY_CHOICES.map((n) => (
                  <Chip key={n} label={String(n)} selected={row.days === n} onPress={() => update(row.key, { days: n })} />
                ))}
              </View>
            </Field>
            {view && problem ? <Notice title={S.history.problemIn(i + 1, view.title)} body={view.body} /> : null}
            {rows.length > 1 ? <Button small variant="text" label={S.history.removeRow} icon="close" onPress={() => setRows((all) => all.filter((r) => r.key !== row.key))} /> : null}
          </Card>
        );
      })}
      <Button variant="tonal" icon="add" label={S.history.addAnother} onPress={add} />
      {failed ? <Notice title={S.tell.couldNotSave} icon="alert-circle" /> : null}
    </Screen>
  );
}
