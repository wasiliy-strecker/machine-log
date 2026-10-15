import { formatValue } from '../../core/domain/reading-value';
import { useCallback, useMemo, useRef, useState } from 'react';
import { useFocusEffect, router } from 'expo-router';
import { useServices } from '../../core/composition';
import type {
  EntryDraft,
  Machine,
  CounterEvent,
} from '../../core/domain/models';
import { PAGE_SIZE } from '../../core/domain/models';
import { useReminderStatus } from './use-reminder-status';
import { errorText } from '../../core/ui/components';
import { useTask } from '../../core/ui/use-task';
import {
  visibleRecords,
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
  const loaded = useRef(false);
  const status = useReminderStatus();
  useFocusEffect(
    useCallback(() => {
      let active = true;
      setLoading(!loaded.current);
      Promise.all([machine.repository.dashboard(), machine.repository.drafts()])
        .then(([r, d]) => {
          if (active) {
            loaded.current = true;
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
  const visibleItems = useMemo(
    () => visibleRecords(items, search, sort),
    [items, search, sort],
  );
  return {
    items: visibleItems,
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
