import { increment } from '../../core/domain/counter-timeline';
import { formatValue } from '../../core/domain/reading-value';
import type {
  CounterEvent,
  Machine,
  Reminder,
  EntryDraft,
} from '../../core/domain/models';
import { categories, eventLabels } from '../../core/domain/models';

export type HistoryItem = {
  entry: CounterEvent;
  photoUri?: string;
  photoCount: number;
  measurementText: string;
  comparison: string | null;
};
export function historyComparison(
  entry: CounterEvent,
  previous: CounterEvent | null,
): string | null {
  return increment(entry, previous).label;
}

export function categorySuggestions(records: Machine[]): string[] {
  const unique = new Map<string, string>();
  const saved = records
    .map((record) => record.category.trim())
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'de-DE'));
  for (const category of [...categories, ...saved]) {
    const key = category.toLocaleLowerCase('de-DE');
    if (!unique.has(key)) unique.set(key, category);
  }
  return [...unique.values()];
}
export type DashboardItem = {
  record: Machine;
  latest: CounterEvent | null;
  lastEdited: string;
};
export type RecordSort = 'lastEdited' | 'name' | 'category';
export const sortLabels: Record<RecordSort, string> = {
  lastEdited: 'Zuletzt bearbeitet',
  name: 'Name',
  category: 'Kategorie',
};
export const dateTime = (value: string | number) =>
  new Date(value).toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
export function entrySummary(entry: CounterEvent | null) {
  return entry
    ? `${eventLabels[entry.kind]} · ${formatValue(entry.measurement.value)} ${entry.measurement.unit}`
    : 'Noch keine Ablesung';
}
export function visibleRecords(
  items: DashboardItem[],
  search: string,
  sort: RecordSort,
) {
  const q = search.trim().toLocaleLowerCase('de-DE');
  return items
    .filter(({ record: r, latest }) =>
      [
        r.name,
        r.number,
        ...r.counters.map((c) => c.name),
        r.category,
        r.location,
        r.manufacturer,
        r.model,
        r.serial,
        r.installedOn,
        latest ? entrySummary(latest) : '',
      ].some((v) => v.toLocaleLowerCase('de-DE').includes(q)),
    )
    .sort(
      (a, b) =>
        (sort === 'lastEdited'
          ? b.lastEdited.localeCompare(a.lastEdited)
          : sort === 'name'
            ? a.record.name.localeCompare(b.record.name, 'de-DE')
            : a.record.category.localeCompare(b.record.category, 'de-DE')) ||
        a.record.name.localeCompare(b.record.name, 'de-DE') ||
        a.record.id.localeCompare(b.record.id),
    );
}
export function reminderSummary(r: Reminder) {
  const time = `${String(r.hour).padStart(2, '0')}:${String(r.minute).padStart(2, '0')} Uhr`;
  const labels = {
    hourly: `stündlich ab ${dateTime(r.startsAtMillis)}`,
    daily: `täglich um ${time}`,
    weekly: `${['montags', 'dienstags', 'mittwochs', 'donnerstags', 'freitags', 'samstags', 'sonntags'][r.day - 1]} um ${time}`,
    monthly: `monatlich am ${r.day}. um ${time}`,
    yearly: `jährlich am ${r.day}.${r.month}. um ${time}`,
  };
  return (
    labels[r.interval] +
    (r.deliveryMode === 'punctualWithSound' ? ' · pünktlich mit Ton' : '')
  );
}
export function capturePhase(draft: EntryDraft): 'choose' | 'form' {
  return draft.entryId ||
    draft.form.attachments.length ||
    draft.form.note ||
    draft.form.value
    ? 'form'
    : (draft.captureStage ?? 'choose');
}
