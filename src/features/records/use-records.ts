import { formatValue } from '../../core/domain/reading-value';
import { useCallback, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { useIsFocused } from 'expo-router/react-navigation';
import { useStartupHold } from '../../core/startup/startup';
import { useServices } from '../../core/composition';
import type {
  EntryDraft,
  Machine,
  CounterEvent,
  SavedReport,
} from '../../core/domain/models';
import { PAGE_SIZE } from '../../core/domain/models';
import { useReminderStatus } from './use-reminder-status';
import { errorText } from '../../core/ui/components';
import { useTask } from '../../core/ui/use-task';
import { useFeedback } from '../../core/ui/feedback';
import {
  visibleRecords,
  visibleReports,
  historyComparison,
  type DashboardItem,
  type HistoryItem,
  type RecordSort,
} from './presentation-model';
export function useRecords() {
  const { machine, revision } = useServices();
  const [items, setItems] = useState<DashboardItem[]>([]),
    [drafts, setDrafts] = useState<EntryDraft[]>([]),
    [search, setSearch] = useState(''),
    [sort, setSort] = useState<RecordSort>('lastEdited'),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(''),
    [retry, setRetry] = useState(0);
  const status = useReminderStatus();
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      Promise.all([machine.repository.dashboard(), machine.repository.drafts()])
        .then(([r, d]) => {
          if (active) {
            setItems(r);
            setDrafts(d);
            setError('');
          }
        })
        .catch((e) => {
          if (active) setError(errorText(e));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
      // Revision/retry tokens intentionally reload persisted data on focus.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [machine, revision, retry]),
  );
  return {
    items: visibleRecords(items, search, sort),
    empty: !items.length,
    drafts,
    search,
    setSearch,
    sort,
    setSort,
    loading,
    error,
    status,
    retry: () => setRetry((n) => n + 1),
  };
}
export function useRecordDetail(
  id: string,
  history = false,
  initialCounterId?: string,
) {
  const { machine, native, revision, refresh } = useServices();
  const [counterId, setCounterId] = useState(initialCounterId ?? '');
  const [record, setRecord] = useState<Machine>(),
    [entries, setEntries] = useState<CounterEvent[]>([]),
    [comparisons, setComparisons] = useState<Record<string, string | null>>({}),
    [total, setTotal] = useState(0),
    [offset, setOffset] = useState(0),
    [search, setSearch] = useState(''),
    [loading, setLoading] = useState(true);
  const task = useTask();
  const { setError } = task;
  const status = useReminderStatus();
  const [hasAttachments, setHasAttachments] = useState(false);
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      (async () => {
        const records = await machine.repository.records();
        const found = records.find((r) => r.id === id);
        const selected =
          (initialCounterId ?? counterId)
            ? found?.counters.find(
                (c) => c.id === (initialCounterId ?? counterId),
              )
            : found?.counters[0];
        if (!found || !selected)
          throw new Error('Maschine oder Zähler nicht gefunden.');
        const page = await machine.repository.entries(
          id,
          history ? search : '',
          history ? offset : 0,
          PAGE_SIZE,
          selected.id,
        );
        if (active) setCounterId(selected.id);
        void native.acknowledge(selected.id).catch(() => {});
        return { records, page };
      })()
        .then(async ({ records, page }) => {
          const comparisons = await Promise.all(
            page.rows.map(async (e) => {
              const p = await machine.repository.previousMeasurement(e);
              return [e.id, historyComparison(e, p)] as const;
            }),
          );
          if (!active) return;
          setRecord(records.find((r) => r.id === id));
          setEntries(page.rows);
          setTotal(page.total);
          setHasAttachments(page.hasAttachments);
          setComparisons(Object.fromEntries(comparisons));
          setError('');
          if (offset && offset >= page.total)
            setOffset(
              Math.max(0, Math.floor((page.total - 1) / PAGE_SIZE) * PAGE_SIZE),
            );
        })
        .catch((e) => {
          if (active) setError(errorText(e));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
      // Revision/retry tokens intentionally reload persisted data on focus.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      machine,
      native,
      id,
      history,
      search,
      offset,
      revision,
      counterId,
      initialCounterId,
      setError,
    ]),
  );
  return {
    record,
    counterId,
    counter: record?.counters.find((c) => c.id === counterId),
    setCounterId: (value: string) => {
      setOffset(0);
      setCounterId(value);
      router.setParams({ counterId: value });
    },
    entries,
    hasAttachments,
    historyItems: entries.map((entry): HistoryItem => {
      const photos = entry.attachments.filter((a) => a.kind === 'photo');
      return {
        entry,
        photoUri: photos[0] ? machine.vault.uri(photos[0].file) : undefined,
        photoCount: photos.length,
        measurementText: entry.measurement
          ? `${formatValue(entry.measurement.value)} ${entry.measurement.unit}`
          : 'Ohne Messangabe',
        comparison: comparisons[entry.id] ?? null,
      };
    }),
    total,
    offset,
    setOffset,
    search,
    setSearch: (v: string) => {
      setOffset(0);
      setSearch(v);
    },
    loading,
    status,
    ...task,
    remove: () =>
      task.run(async () => {
        await machine.deleteCounter(id, counterId);
        refresh();
        router.replace('/');
      }),
  };
}
export function useReports(
  recordId: string,
  entryId: string | null,
  hasAttachments: boolean,
  counterId: string | null = null,
) {
  const focused = useIsFocused();
  const [loading, setLoading] = useState(true);
  useStartupHold(focused && loading);
  const { machine, revision, refresh } = useServices();
  const feedback = useFeedback();
  const task = useTask();
  const [reports, setReports] = useState<SavedReport[]>([]),
    [offset, setOffset] = useState(0),
    [expanded, setExpanded] = useState(false),
    [availableFiles, setAvailableFiles] = useState<Set<string> | null>(null),
    [loadError, setLoadError] = useState(''),
    [attempt, setAttempt] = useState(0),
    [deletingId, setDeletingId] = useState<string>();
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(true);
      setLoadError('');
      setAvailableFiles(null);
      Promise.all([
        machine.repository.reports(recordId),
        entryId || expanded ? machine.vault.list() : Promise.resolve(null),
      ])
        .then(([rows, files]) => {
          if (active) {
            const filtered = visibleReports(rows, entryId, counterId);
            setReports(filtered);
            setAvailableFiles(files ? new Set(files) : null);
            setOffset((old) =>
              old >= filtered.length
                ? Math.max(
                    0,
                    Math.floor((filtered.length - 1) / PAGE_SIZE) * PAGE_SIZE,
                  )
                : old,
            );
          }
        })
        .catch((e) => {
          if (active) setLoadError(errorText(e));
        })
        .finally(() => {
          if (active) setLoading(false);
        });
      return () => {
        active = false;
      };
      // Revision/retry tokens intentionally reload persisted data on focus.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [machine, recordId, entryId, counterId, revision, expanded, attempt]),
  );
  return {
    ...task,
    loading,
    loadError,
    expanded,
    setExpanded,
    availableFiles,
    deletingId,
    retry: () => setAttempt((n) => n + 1),
    reports: reports.slice(offset, offset + PAGE_SIZE),
    total: reports.length,
    offset,
    setOffset,
    create: async () => {
      try {
        const selectedCounterId = counterId;
        const anyAttachments =
          !selectedCounterId && !entryId
            ? (await machine.repository.entries(recordId, '', 0, 1))
                .hasAttachments
            : hasAttachments;
        const mode = await feedback.choose({
          title: 'PDF-Inhalt wählen',
          message: 'Wähle, welche Inhalte deine PDF enthalten soll.',
          optionStyle: 'cards',
          options: [
            {
              value: 'compact',
              label: 'Kompakt ohne Anhänge',
              description:
                'Stände, Zuwächse, Wechsel, Korrekturen und Notizen mit Dokumentenliste.',
              icon: 'description_outlined',
            },
            {
              value: 'full',
              label: 'Mit Fotos',
              description: anyAttachments
                ? entryId
                  ? 'Enthält das aktuelle Foto und frühere Fotoversionen. Vorhandene Altanhänge bleiben enthalten.'
                  : 'Enthält aktuelle und frühere Fotos der Ablesungen. Vorhandene Altanhänge bleiben enthalten.'
                : 'Keine Fotos vorhanden.',
              icon: 'photo_outlined',
              disabled: !anyAttachments,
            },
          ],
        });
        if (mode === null) return;
        await task.run(async () => {
          const report = await machine.createReport(
            recordId,
            entryId,
            mode === 'full',
            selectedCounterId,
          );
          refresh();
          setOffset(0);
          router.push({ pathname: '/pdf/[id]', params: { id: report.id } });
        });
      } catch (error) {
        task.setError(errorText(error));
      }
    },
    open: (report: SavedReport) =>
      router.push({ pathname: '/pdf/[id]', params: { id: report.id } }),
    remove: async (report: SavedReport) => {
      if (
        await feedback.confirm(
          'Produktionsprotokoll löschen?',
          'Die gespeicherte PDF wird entfernt. Bereits exportierte Kopien bleiben erhalten.',
        )
      )
        await task.run(async () => {
          setDeletingId(report.id);
          try {
            await machine.delete('report', report.id);
            refresh();
            feedback.notify('Produktionsprotokoll gelöscht.');
          } finally {
            setDeletingId(undefined);
          }
        });
    },
  };
}
