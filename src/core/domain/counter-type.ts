import { counterTypes, defaultUnits, type Machine } from './models';

type PresetId = keyof typeof counterTypes;
const presetIds = Object.keys(counterTypes) as PresetId[];

function presetId(value: string): PresetId | undefined {
  const query = value.trim().toLocaleLowerCase('de-DE');
  return presetIds.find(
    (id) =>
      id === query || counterTypes[id].toLocaleLowerCase('de-DE') === query,
  );
}

export function counterTypeLabel(value: string): string {
  const preset = presetId(value);
  return preset ? counterTypes[preset] : value.trim();
}

// Keep the existing IDs for predefined types so old data needs no rewrite.
export function counterTypeValue(value: string): string {
  return presetId(value) ?? value.trim();
}

export function counterTypeSuggestions(records: Machine[]): string[] {
  const saved = records
    .flatMap((record) =>
      record.counters.map((counter) => counterTypeLabel(counter.type)),
    )
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'de-DE'));
  const unique = new Map<string, string>();
  for (const value of [...Object.values(counterTypes), ...saved]) {
    const key = value.toLocaleLowerCase('de-DE');
    if (!unique.has(key)) unique.set(key, value);
  }
  return [...unique.values()];
}

export function unitForCounterType(
  value: string,
  currentUnit: string,
  automatic: boolean,
): string {
  const preset = presetId(value);
  return preset && (automatic || !currentUnit.trim())
    ? defaultUnits[preset]
    : currentUnit;
}
