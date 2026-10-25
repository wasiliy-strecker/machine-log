import { presetLabel } from '../../core/localization/presets';
import { t, localization } from '../../core/localization/runtime';
import { increment } from '../../core/domain/counter-timeline';
import { displayValue as formatValue } from '../../core/localization/numbers';
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
    .sort((a, b) => a.localeCompare(b, localization().formatLocale));
  for (const category of [...categories, ...saved]) {
    const key = category.toLocaleLowerCase(localization().formatLocale);
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
  get lastEdited() {
    return t('lastEdited');
  },
  get name() {
    return t('name484');
  },
  get type() {
    return t('meterType');
  },
};
export const dateTime = (value: string | number) =>
  new Date(value).toLocaleString(localization().formatLocale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
export function entrySummary(entry: CounterEvent | null) {
  return entry
    ? `${eventLabels[entry.kind]} · ${formatValue(entry.measurement.value)} ${presetLabel(entry.measurement.unit)}`
    : t('noReadingYet');
}
export function visibleRecords(
  items: DashboardItem[],
  search: string,
  sort: RecordSort,
) {
  const q = search.trim().toLocaleLowerCase(localization().formatLocale);
  return items
    .filter(({ record: r, counter, latest }) =>
      [
        r.name,
        r.number,
        counter.name,
        counter.number,
        counterTypeLabel(counter.type),
        counter.unit,
        presetLabel(counter.unit),
        r.category,
        counterLocation(r, counter),
        r.manufacturer,
        r.model,
        r.serial,
        r.installedOn,
        latest ? entrySummary(latest) : '',
      ].some((v) =>
        v.toLocaleLowerCase(localization().formatLocale).includes(q),
      ),
    )
    .sort(
      (a, b) =>
        (sort === 'lastEdited'
          ? b.lastEdited.localeCompare(a.lastEdited)
          : sort === 'name'
            ? counterTitle(a.record, a.counter).localeCompare(
                counterTitle(b.record, b.counter),
                localization().formatLocale,
              )
            : counterTypeLabel(a.counter.type).localeCompare(
                counterTypeLabel(b.counter.type),
                localization().formatLocale,
              )) ||
        counterTitle(a.record, a.counter).localeCompare(
          counterTitle(b.record, b.counter),
          localization().formatLocale,
        ) ||
        a.counter.id.localeCompare(b.counter.id),
    );
}
export function reminderSummary(r: Reminder) {
  const time =
    new Intl.DateTimeFormat(localization().formatLocale, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(2000, 0, 1, r.hour, r.minute)) + t('uhr');
  const labels = {
    hourly: t('stuendlichAbValue', { p0: dateTime(r.startsAtMillis) }),
    daily: t('dailyAtValue', { p0: time }),
    weekly: t('valueUmValue', {
      p0: new Intl.DateTimeFormat(localization().language, {
        weekday: 'long',
      }).format(new Date(2026, 0, 5 + r.day - 1)),
      p1: time,
    }),
    monthly: t('monthlyOnDayValueAtValue', { p0: r.day, p1: time }),
    yearly: t('yearlyOnDateAt', {
      p0: new Intl.DateTimeFormat(localization().formatLocale, {
        day: '2-digit',
        month: '2-digit',
      }).format(new Date(2000, r.month - 1, r.day)),
      p1: time,
    }),
  };
  return (
    labels[r.interval] +
    (r.deliveryMode === 'punctualWithSound' ? t('puenktlichMitTon') : '')
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

export function dashboardCount(count: number, searching = false): string {
  return t(
    searching
      ? count === 1
        ? 'resultCountOne'
        : 'resultCountMany'
      : count === 1
        ? 'counterCountOne'
        : 'counterCountMany',
    { p0: new Intl.NumberFormat(localization().formatLocale).format(count) },
  );
}
