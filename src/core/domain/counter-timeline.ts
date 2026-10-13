import type { CounterEvent, EventState } from './models';
import {
  addValues,
  compareValues,
  formatValue,
  subtractValues,
  type ReadingValue,
} from './reading-value';

export class TimelineValidationError extends Error {
  constructor(
    message: string,
    readonly entryId: string,
    readonly field: 'occurredAt' | 'value' | 'closingValue',
  ) {
    super(message);
  }
}

export function chronological(events: CounterEvent[]): CounterEvent[] {
  return [...events].sort(
    (a, b) =>
      Date.parse(a.occurredAt) - Date.parse(b.occurredAt) ||
      a.id.localeCompare(b.id),
  );
}
export type Increment = {
  value: ReadingValue | null;
  unit: string;
  gap: boolean;
  label: string;
};
export function increment(
  current: EventState,
  previous?: EventState | null,
): Increment {
  const transition = current.kind !== 'reading';
  const end = transition ? current.closing : current.measurement;
  if (transition && !end)
    return {
      value: null,
      unit: previous?.measurement.unit ?? current.measurement.unit,
      gap: true,
      label: 'Berechnungslücke · alter Endstand unbekannt',
    };
  if (!previous)
    return {
      value: null,
      unit: current.measurement.unit,
      gap: false,
      label: 'Ausgangsstand · noch kein Zuwachs berechenbar',
    };
  if (end!.unit !== previous.measurement.unit)
    return {
      value: null,
      unit: end!.unit,
      gap: true,
      label: 'Einheit gewechselt · neuer Ausgangsstand',
    };
  const value = subtractValues(end!.value, previous.measurement.value);
  return {
    value,
    unit: end!.unit,
    gap: false,
    label: `+${formatValue(value)} ${end!.unit} Zuwachs${transition ? ' bis zum Wechsel' : ''}`,
  };
}
export function validateTimeline(events: CounterEvent[]): void {
  const previous = new Map<string, CounterEvent>();
  for (const entry of chronological(events)) {
    const key = `${entry.recordId}/${entry.counterId}`;
    const before = previous.get(key);
    if (
      before &&
      Date.parse(before.occurredAt) === Date.parse(entry.occurredAt)
    )
      throw new TimelineValidationError(
        'Zu diesem Zeitpunkt gibt es bereits einen Eintrag für diesen Zähler. Bitte Zeitpunkt ändern oder den vorhandenen Eintrag korrigieren.',
        entry.id,
        'occurredAt',
      );
    const delta = increment(entry, before);
    if (
      delta.value &&
      compareValues(delta.value, { digits: '0', scale: 0 }) < 0
    )
      throw new TimelineValidationError(
        'Der Stand widerspricht einer benachbarten Ablesung. Bitte den Zeitpunkt prüfen, eine Rücksetzung oder einen Zählerwechsel erfassen oder die fehlerhafte Ablesung korrigieren.',
        entry.id,
        entry.kind === 'reading' ? 'value' : 'closingValue',
      );
    previous.set(key, entry);
  }
}
export function counterTotals(events: CounterEvent[]) {
  const totals = new Map<
    string,
    { value: ReadingValue; incomplete: boolean }
  >();
  let previous: CounterEvent | undefined;
  for (const entry of chronological(events)) {
    const delta = increment(entry, previous);
    if (!delta.value && !delta.gap) {
      previous = entry;
      continue;
    }
    const total = totals.get(delta.unit) ?? {
      value: { digits: '0', scale: 0 },
      incomplete: false,
    };
    if (delta.value) total.value = addValues(total.value, delta.value);
    total.incomplete ||= delta.gap;
    totals.set(delta.unit, total);
    previous = entry;
  }
  return [...totals].map(([unit, total]) => ({ unit, ...total }));
}
