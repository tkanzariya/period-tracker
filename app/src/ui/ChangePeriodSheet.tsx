import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { periodLength } from '../domain/cycles';
import { todayLocal, type DateStr } from '../domain/dates';
import { useData } from '../state/data';
import { useLanguage } from '../state/language';
import { DateField } from './DateField';
import { formatShort } from './format';
import { describeIssue, type IssueView } from './issueText';
import { Button, Chip, Field, Notice, Sheet, T, useToast, usePopup } from './kit';

/** Change the start day of a period she already told me about, or remove it (with Undo). */
export function ChangePeriodSheet({ periodId, onClose }: { periodId: string | null; onClose: () => void }) {
  const { S } = useLanguage();
  const data = useData();
  const toast = useToast();
  const popup = usePopup();
  const today = todayLocal();
  const period = data.periods.find((p) => p.id === periodId) ?? null;

  const [start, setStart] = useState<DateStr>(today);
  const [bleeding, setBleeding] = useState<number | null>(null);
  const [issue, setIssue] = useState<IssueView | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!periodId) return;
    const p = data.periods.find((x) => x.id === periodId);
    if (!p) return;
    setStart(p.startDate);
    setBleeding(periodLength(p));
    setIssue(null);
    setFailed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodId]);

  async function save(confirmed = false): Promise<void> {
    if (!period) return;
    setIssue(null);
    setFailed(false);
    const result = await data.changePeriod(period.id, start, { confirmed, bleedingDays: bleeding });
    if (result.ok) {
      onClose();
      toast.show({ message: S.tell.toast.periodChanged, actionLabel: S.common.undo, onAction: () => void result.undo() });
    } else if ('failed' in result) {
      setFailed(true);
    } else {
      const view = describeIssue(result.issue, S, data.rules);
      if (result.issue.severity === 'confirm') {
        const yes = await popup.confirm({ title: view.title, message: view.body, yes: view.yes ?? S.common.save, no: view.no, icon: 'help-circle' });
        if (yes) await save(true);
      } else {
        setIssue(view);
      }
    }
  }

  async function remove() {
    if (!period) return;
    const yes = await popup.confirm({
      title: S.change.removeTitle,
      message: S.change.removeBody(formatShort(period.startDate, S)),
      yes: S.change.remove,
      danger: true,
    });
    if (!yes) return;
    const result = await data.removePeriod(period.id);
    if (result.ok) {
      onClose();
      toast.show({ message: S.tell.toast.periodRemoved, actionLabel: S.common.undo, onAction: () => void result.undo() });
    } else {
      setFailed(true);
    }
  }

  return (
    <Sheet
      visible={periodId !== null}
      onClose={onClose}
      title={S.change.title}
      footer={
        period ? (
          <>
            <Button label={S.change.save} onPress={() => void save()} />
            <Button label={S.change.remove} variant="danger" icon="trash" onPress={() => void remove()} />
          </>
        ) : undefined
      }
    >
      {period ? (
        <>
          <Field label={S.change.started}>
            <DateField value={start} onChange={(d) => { setStart(d); setIssue(null); }} label={S.change.started} max={today} />
          </Field>
          <Field label={S.change.bleedingLabel} hint={S.change.bleedingHelp}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label={S.change.bleedingNone} selected={bleeding === null} onPress={() => setBleeding(null)} />
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <Chip key={n} label={S.change.bleedingDays(n)} selected={bleeding === n} onPress={() => setBleeding(n)} />
              ))}
            </View>
          </Field>
          {issue ? <Notice title={issue.title} body={issue.body} /> : null}
          {failed ? <Notice title={S.tell.couldNotSave} icon="alert-circle" /> : null}
        </>
      ) : (
        <Notice title={S.change.gone} />
      )}
    </Sheet>
  );
}
