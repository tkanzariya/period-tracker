import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { addDays, todayLocal, type DateStr } from '../domain/dates';
import { getStage, mainAction } from '../domain/stage';
import { NOTE_MAX_LENGTH } from '../domain/validation';
import { useData, type ActionResult } from '../state/data';
import { useLanguage } from '../state/language';
import { DateField } from './DateField';
import { formatShort } from './format';
import { describeIssue, type IssueView } from './issueText';
import { Button, Chip, Field, Input, Notice, Segmented, Sheet, T, useToast, usePopup } from './kit';

export type TellMode = 'start' | 'end' | 'note';

/**
 * "Tell me": one bottom sheet for everything she tells the app about a day (period started, period
 * ended, or just a note). Problems show as a calm amber note inside the sheet; "is that right?"
 * questions use our own popup. A saved change shows a toast with Undo.
 */
export function TellMeSheet({ visible, onClose, mode: startMode, date: startDate, onChangePeriod }: {
  visible: boolean; onClose: () => void; mode?: TellMode; date?: DateStr; onChangePeriod: (id: string) => void;
}) {
  const { S } = useLanguage();
  const data = useData();
  const toast = useToast();
  const popup = usePopup();
  const today = todayLocal();
  const yesterday = addDays(today, -1);

  const [mode, setMode] = useState<TellMode>('start');
  const [date, setDate] = useState<DateStr>(today);
  const [note, setNote] = useState('');
  const [issue, setIssue] = useState<IssueView | null>(null);
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Each time the sheet opens, start from what makes sense right now.
  useEffect(() => {
    if (!visible) return;
    const stage = getStage(data.periods, today, data.rules);
    setMode(startMode ?? mainAction(stage));
    setDate(startDate ?? today);
    setNote(startMode === 'note' ? (data.notes.find((n) => n.date === (startDate ?? today))?.note ?? '') : '');
    setIssue(null);
    setFailed(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const when = formatShort(date, S);
  const noteExisting = data.notes.find((n) => n.date === date)?.note ?? null;

  function switchMode(next: TellMode) {
    setMode(next);
    setIssue(null);
    setFailed(false);
    if (next === 'note') setNote(data.notes.find((n) => n.date === date)?.note ?? '');
  }

  function pickDate(d: DateStr) {
    setDate(d);
    setIssue(null);
    if (mode === 'note') setNote(data.notes.find((n) => n.date === d)?.note ?? '');
  }

  async function finish(result: ActionResult, message: string) {
    if (result.ok) {
      onClose();
      toast.show({ message, actionLabel: S.common.undo, onAction: () => void result.undo() });
    }
  }

  async function save(confirmed = false) {
    if (busy) return;
    setBusy(true);
    setIssue(null);
    setFailed(false);
    try {
      const text = note.trim() ? note.trim() : null;
      const result =
        mode === 'start' ? await data.periodStarted(date, text, { confirmed })
        : mode === 'end' ? await data.periodEnded(date, text, { confirmed })
        : await data.saveNote(date, note);

      if (result.ok) {
        await finish(result, mode === 'start' ? S.tell.toast.start(when) : mode === 'end' ? S.tell.toast.end(when) : S.tell.toast.note);
      } else if ('failed' in result) {
        setFailed(true);
      } else {
        const view = describeIssue(result.issue, S, data.rules);
        if (result.issue.severity === 'confirm') {
          const yes = await popup.confirm({ title: view.title, message: view.body, yes: view.yes ?? S.common.save, no: view.no, icon: 'help-circle' });
          if (yes) {
            setBusy(false);
            await save(true);
            return;
          }
        } else {
          setIssue(view);
        }
      }
    } finally {
      setBusy(false);
    }
  }

  function followAction(view: IssueView) {
    const a = view.action;
    if (!a) return;
    if (a.kind === 'change_period' && a.periodId) {
      onClose();
      onChangePeriod(a.periodId);
    } else if (a.kind === 'end_period') {
      switchMode('end');
      setDate(today);
    } else if (a.kind === 'start_period') {
      switchMode('start');
    }
  }

  const saveLabel = mode === 'start' ? S.tell.save.start(when) : mode === 'end' ? S.tell.save.end(when) : S.tell.save.note(when);

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={S.tell.title}
      footer={
        <>
          {mode === 'note' && noteExisting ? (
            <Button
              label={S.tell.removeNote}
              variant="text"
              onPress={async () => {
                const r = await data.removeNote(date);
                if (r.ok) {
                  onClose();
                  toast.show({ message: S.tell.toast.noteRemoved, actionLabel: S.common.undo, onAction: () => void r.undo() });
                }
              }}
            />
          ) : null}
          <Button label={saveLabel} onPress={() => void save()} disabled={busy} />
        </>
      }
    >
      <Segmented
        value={mode}
        onChange={switchMode}
        options={[
          { value: 'start', label: S.tell.modes.start, icon: 'water' },
          { value: 'end', label: S.tell.modes.end, icon: 'checkmark-circle' },
          { value: 'note', label: S.tell.modes.note, icon: 'create-outline' },
        ]}
      />

      <Field label={S.tell.whichDay}>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <Chip label={S.common.today} selected={date === today} onPress={() => pickDate(today)} />
          <Chip label={S.common.yesterday} selected={date === yesterday} onPress={() => pickDate(yesterday)} />
        </View>
        <DateField value={date} onChange={pickDate} label={S.tell.whichDay} max={today} />
      </Field>

      <Field label={mode === 'note' ? S.tell.noteLabelOnly : S.tell.noteLabel}>
        <Input value={note} onChange={(v) => { setNote(v); setIssue(null); }} label={S.tell.noteLabel} placeholder={S.tell.notePlaceholder} multiline maxLength={NOTE_MAX_LENGTH} />
        <T kind="caption" muted style={{ textAlign: 'right' }}>{S.tell.noteCount(note.length, NOTE_MAX_LENGTH)}</T>
      </Field>

      {issue ? (
        <Notice
          title={issue.title}
          body={issue.body}
          actions={issue.action ? <Button small variant="tonal" label={issue.action.label} onPress={() => followAction(issue)} /> : undefined}
        />
      ) : null}
      {failed ? <Notice title={S.tell.couldNotSave} icon="alert-circle" /> : null}
    </Sheet>
  );
}
