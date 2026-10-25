import { displayValue } from '../localization/numbers';
import { presetLabel } from '../localization/presets';
import {
  LocalizedError,
  type Localization,
  localization,
  translator,
  type MessageKey,
} from '../localization/runtime';
import type { CounterEvent, EventState } from './models';
import {
  compareValues,
  subtractValues,
  type ReadingValue,
} from './reading-value';
export class TimelineValidationError extends LocalizedError {
  constructor(
    message: MessageKey,
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
  locale: Localization = localization(),
): Increment {
  const t = translator(locale);
  const transition = current.kind !== 'reading';
  const end = transition ? current.closing : current.measurement;
  if (transition && !end)
    return {
      value: null,
      unit: previous?.measurement.unit ?? current.measurement.unit,
      gap: true,
      label: t('berechnungslueckeAlterEndstandUnbekannt'),
    };
  if (!previous)
    return {
      value: null,
      unit: current.measurement.unit,
      gap: false,
      label: t('ausgangsstandNochKeinZuwachsBerechenbar'),
    };
  if (end!.unit !== previous.measurement.unit)
    return {
      value: null,
      unit: end!.unit,
      gap: true,
      label: t('einheitGewechseltNeuerAusgangsstand'),
    };
  const value = subtractValues(end!.value, previous.measurement.value);
  return {
    value,
    unit: end!.unit,
    gap: false,
    label: t('valueValueZuwachsValue', {
      p0: displayValue(value, locale.formatLocale),
      p1: presetLabel(end!.unit, locale),
      p2: transition ? t('bisZumWechsel') : '',
    }),
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
        'zuDiesemZeitpunktGibtEsBereitsEinenEintragFuerDiesenZaehlerBitteZeitpunktAendernOderDenVorhande',
        entry.id,
        'occurredAt',
      );
    const delta = increment(entry, before);
    if (
      delta.value &&
      compareValues(delta.value, { digits: '0', scale: 0 }) < 0
    )
      throw new TimelineValidationError(
        'derStandWidersprichtEinerBenachbartenAblesungBitteDenZeitpunktPruefenEineRuecksetzungOderEinenZ',
        entry.id,
        entry.kind === 'reading' ? 'value' : 'closingValue',
      );
    previous.set(key, entry);
  }
}
