import { increment } from '../../core/domain/counter-timeline';
import { formatValue } from '../../core/domain/reading-value';
import type {
  CounterEvent,
  Machine,
  Counter,
  Reminder,
  EntryDraft,
  SavedReport,
} from '../../core/domain/models';
import { categories, eventLabels } from '../../core/domain/models';
import { counterTypeLabel } from '../../core/domain/counter-type';
import {
  counterTitle,
  counterLocation,
} from '../../core/domain/production-counter';

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
  counter: Counter;
  latest: CounterEvent | null;
  lastEdited: string;
};
export function visibleReports(
  reports: SavedReport[],
  entryId: string | null,
  counterId: string | null,
) {
  return reports.filter(
    (report) =>
      report.entryId === entryId &&
      (!counterId || !report.counterId || report.counterId === counterId),
  );
}
export type RecordSort = 'lastEdited' | 'name' | 'type';
export const sortLabels: Record<RecordSort, string> = {
  lastEdited: 'Zuletzt bearbeitet',
  name: 'Name',
  type: 'Zählerart',
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
    .filter(({ record: r, counter, latest }) =>
      [
        r.name,
        r.number,
        counter.name,
        counter.number,
        counterTypeLabel(counter.type),
        counter.unit,
        r.category,
        counterLocation(r, counter),
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
            ? counterTitle(a.record, a.counter).localeCompare(
                counterTitle(b.record, b.counter),
                'de-DE',
              )
            : counterTypeLabel(a.counter.type).localeCompare(
                counterTypeLabel(b.counter.type),
                'de-DE',
              )) ||
        counterTitle(a.record, a.counter).localeCompare(
          counterTitle(b.record, b.counter),
          'de-DE',
        ) ||
        a.counter.id.localeCompare(b.counter.id),
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
