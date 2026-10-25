import {
  catalogs,
  languages,
  localization,
  translate,
  type Localization,
  type MessageKey,
} from './runtime';

const presetKeys: Record<string, MessageKey> = {
  Abfüllung: 'abfuellung',
  Bogen: 'bogen',
  Chargen: 'chargen',
  Druck: 'druck',
  Fertigung: 'fertigung',
  Kartons: 'kartons',
  Liter: 'liters',
  Laufmeter: 'laufmeter',
  Montage: 'montage',
  Pakete: 'pakete',
  Paletten: 'paletten',
  Rollen: 'rollen',
  'Sonstige Maschine': 'sonstigeMaschine',
  Stück: 'items',
  Stückzahl: 'stueckzahl',
  Verpackung: 'verpackung',
  Zuschnitt: 'zuschnitt',
  Zyklen: 'zyklen',
  Betriebsstunden: 'betriebsstunden',
  Menge: 'menge',
};
export function presetLabel(
  value: string,
  locale: Localization = localization(),
): string {
  const key = presetKeys[value];
  return key ? translate(locale, key) : value;
}
export function presetValue(value: string): string {
  const query = value.trim().toLocaleLowerCase();
  for (const [stored, key] of Object.entries(presetKeys)) {
    if (
      stored.toLocaleLowerCase() === query ||
      languages.some(
        (language) => catalogs[language][key].toLocaleLowerCase() === query,
      )
    )
      return stored;
  }
  return value.trim();
}
