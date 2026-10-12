import {
  extractCandidates,
  type OcrCandidate,
} from '../../core/ocr/candidate-extractor';
import { formatValue } from '../../core/domain/reading-value';
import { useEffect, useRef, useState } from 'react';
import { router } from 'expo-router';
import { useServices } from '../../core/composition';
import {
  formFromEntry,
  type Attachment,
  type EntryDraft,
  type EntryForm,
} from '../../core/domain/models';
import { useTask } from '../../core/ui/use-task';
import { errorText } from '../../core/ui/components';
import { useFeedback } from '../../core/ui/feedback';
import { useLeaveGuard } from '../../core/ui/use-leave-guard';
import { capturePhase } from '../records/presentation-model';
import type { PhotoSource } from '../../core/media/media-service';
import { replaceReadingPhoto } from '../../core/media/reading-photo';
export function useEntryEditor(
  recordId: string,
  entryId?: string,
  counterId?: string,
) {
  const { machine, media, ocr, refresh } = useServices();
  const feedback = useFeedback();
  const [draft, setDraft] = useState<EntryDraft>(),
    [candidates, setCandidates] = useState<OcrCandidate[]>([]),
    [initialForm, setInitialForm] = useState('');
  const current = useRef<EntryDraft | undefined>(undefined),
    initial = useRef(''),
    committed = useRef(false);
  const task = useTask();
  const { setError, setNotice } = task;
  useEffect(() => {
    let active = true;
    (async () => {
      const [data, savedEntry] = await Promise.all([
        machine.repository.snapshot(),
        entryId ? machine.repository.entry(entryId) : null,
      ]);
      const record = data.records.find((r) => r.id === recordId);
      if (
        !record ||
        (entryId && (!savedEntry || savedEntry.recordId !== recordId))
      )
        throw new Error('Maschine oder Eintrag nicht gefunden.');
      const saved = await machine.draft(
        recordId,
        savedEntry ?? undefined,
        counterId,
      );
      const original: EntryForm = savedEntry
        ? formFromEntry(savedEntry)
        : {
            kind: 'reading',
            occurredAt: saved.createdAt,
            value: '',
            unit: record.counters.find((c) => c.id === saved.counterId)!.unit,
            closingValue: '',
            closingUnit: record.counters.find((c) => c.id === saved.counterId)!
              .unit,
            newCounterNumber: '',
            note: '',
            reason: '',
            source: 'manual',
            ocr: null,
            attachments: [],
          };
      if (active) {
        initial.current = JSON.stringify(original);
        setInitialForm(initial.current);
        current.current = saved;
        setDraft(saved);
        if (saved.external === 'scanner' || saved.external === 'pdf') {
          saved.external = null;
          await machine.persistDraft(saved);
          setNotice(
            'Dein Entwurf wurde wiederhergestellt. Neue Ablesungen verwenden Fotos oder manuelle Eingaben. Vorhandene Anhänge bleiben erhalten.',
          );
        }
      }
    })().catch((e) => setError(errorText(e)));
    return () => {
      active = false;
      const d = current.current;
      if (d && !committed.current && JSON.stringify(d.form) === initial.current)
        void machine.discard(d).catch(() => {});
    };
  }, [machine, recordId, entryId, counterId, setError, setNotice]);
  const dirty = !!draft && JSON.stringify(draft.form) !== initialForm;
  const leave = useLeaveGuard({
    dirty,
    busy: task.busy,
    title: entryId ? 'Änderungen verwerfen?' : 'Eintrag verwerfen?',
    discard: async () => {
      if (current.current) await machine.discard(current.current);
      committed.current = true;
      refresh();
    },
  });
  function apply(next: EntryDraft) {
    current.current = next;
    setDraft(next);
    return machine.persistDraft(next);
  }
  function change<K extends keyof EntryForm>(key: K, value: EntryForm[K]) {
    if (!current.current) return;
    void apply({
      ...current.current,
      form: { ...current.current.form, [key]: value },
    }).catch((e) =>
      setError(`Entwurf konnte nicht gesichert werden: ${errorText(e)}`),
    );
  }
  function setAttachments(items: Attachment[]) {
    const d = current.current;
    if (!d) return;
    void apply({
      ...d,
      form: {
        ...d.form,
        ocr: items.some((a) => a.id === d.form.ocr?.photoId)
          ? d.form.ocr
          : null,
        attachments: [
          ...items.filter((a) => a.kind === 'photo'),
          ...items.filter((a) => a.kind === 'pdf'),
        ],
      },
    }).catch((e) => setError(errorText(e)));
  }
  async function readPhoto(photoId?: string) {
    const attachment = current.current?.form.attachments.find(
      (a) => a.kind === 'photo' && (!photoId || a.id === photoId),
    );
    if (!attachment) return;
    setCandidates([]);
    try {
      const result = await ocr.recognize(machine.vault.uri(attachment.file));
      const options = extractCandidates(result.lines);
      const d = current.current;
      if (!d || !d.form.attachments.some((a) => a.id === attachment.id)) return;
      setCandidates(options);
      const first = options[0];
      await apply({
        ...d,
        form: {
          ...d.form,
          value: d.form.value || (first ? formatValue(first.value) : ''),
          ocr: {
            photoId: attachment.id,
            rawText: result.rawText.slice(0, 100000),
            selectedText: d.form.value ? '' : (first?.rawText ?? ''),
          },
        },
      });
      setNotice(
        first
          ? 'Zahlenvorschläge erkannt. Bitte Wert, Einheit und Zeitpunkt vor dem Speichern prüfen.'
          : 'Keine eindeutige Zahl erkannt. Bitte den Stand manuell eingeben. Das Foto bleibt erhalten.',
      );
    } catch {
      setNotice(
        'Die Zahlenerkennung ist fehlgeschlagen. Bitte erneut versuchen oder den Stand manuell eingeben. Das Foto bleibt erhalten.',
      );
    }
  }
  return {
    draft,
    candidates,
    recognize: (photoId?: string) => task.run(() => readPhoto(photoId)),
    selectCandidate: (candidate: OcrCandidate) => {
      const d = current.current;
      if (!d?.form.ocr) return;
      void apply({
        ...d,
        form: {
          ...d.form,
          value: formatValue(candidate.value),
          ocr: { ...d.form.ocr, selectedText: candidate.rawText },
        },
      }).catch((e) => setError(errorText(e)));
    },
    dirty,
    phase: draft ? capturePhase(draft) : 'choose',
    change,
    setAttachments,
    ...task,
    chooseManual: () =>
      task.run(async () => {
        if (!current.current) return;
        const next = {
          ...current.current,
          captureStage: 'form' as const,
          captureSource: 'manual' as const,
        };
        await apply(next);
      }),
    pick: (source: PhotoSource, replaceId?: string) =>
      task.run(async () => {
        if (!current.current) return;
        await apply({ ...current.current, external: source });
        const result = await media.pick(source);
        if (source === 'camera' || source === 'gallery')
          result.attachments.forEach((a) => {
            a.source = source;
          });
        const before = current.current.form.attachments;
        const pickedPhoto = result.attachments[0];
        const attachments = pickedPhoto
          ? replaceReadingPhoto(before, pickedPhoto, replaceId)
          : before;
        try {
          await apply({
            ...current.current,
            external: null,
            captureStage: attachments.length
              ? 'form'
              : current.current.captureStage,
            captureSource:
              current.current.captureSource ??
              (attachments.length ? 'photo' : undefined),
            form: {
              ...current.current.form,
              source:
                result.attachments.some((a) => a.kind === 'photo') &&
                (source === 'camera' || source === 'gallery')
                  ? source
                  : current.current.form.source,
              ocr: attachments.some(
                (a) => a.id === current.current?.form.ocr?.photoId,
              )
                ? current.current.form.ocr
                : null,
              attachments: [
                ...attachments.filter((a) => a.kind === 'photo'),
                ...attachments.filter((a) => a.kind === 'pdf'),
              ],
            },
          });
        } catch (error) {
          current.current = {
            ...current.current,
            form: { ...current.current.form, attachments: before },
          };
          setDraft(current.current);
          await machine.cleanup(result.attachments.map((a) => a.file));
          throw error;
        }
        if (result.failures.length) setError(result.failures.join('\n'));
        const photo = result.attachments.find((a) => a.kind === 'photo');
        if (photo) await readPhoto(photo.id);
      }),
    remove: (id: string) =>
      setAttachments(
        (current.current?.form.attachments ?? []).filter((a) => a.id !== id),
      ),
    reorderKind: (items: Attachment[]) => {
      if (!items.length) return;
      const kind = items[0]!.kind;
      const all = current.current?.form.attachments ?? [];
      setAttachments([...all.filter((a) => a.kind !== kind), ...items]);
    },
    move: (id: string, delta: number) => {
      const items = [...(current.current?.form.attachments ?? [])];
      const index = items.findIndex((a) => a.id === id),
        item = items[index],
        next = items[index + delta];
      if (!item || !next || item.kind !== next.kind) return;
      items[index] = next;
      items[index + delta] = item;
      setAttachments(items);
    },
    save: () =>
      task.run(async () => {
        if (!current.current) return;
        await machine.persistDraft(current.current);
        const result = await machine.saveEntry(current.current);
        committed.current = true;
        refresh();
        leave(() => {
          if (entryId)
            router.dismissTo({
              pathname: '/entry/[id]',
              params: { id: result.entry.id },
            });
          else
            router.replace({
              pathname: '/entry/[id]',
              params: { id: result.entry.id },
            });
        });
        feedback.notify(
          result.warnings.join('\n') ||
            (entryId ? 'Änderungen gespeichert.' : 'Eintrag gespeichert.'),
        );
      }),
  };
}
