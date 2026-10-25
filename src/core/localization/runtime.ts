import de from './messages/de.json';
import en from './messages/en.json';
import es from './messages/es.json';
import fr from './messages/fr.json';
import it from './messages/it.json';
import pt from './messages/pt.json';

export const languages = ['de', 'en', 'es', 'fr', 'it', 'pt'] as const;
export type Language = (typeof languages)[number];
export type LanguagePreference = Language | null;
export type MessageKey = keyof typeof en;
export type MessageParameters = Record<string, string | number | bigint>;
export type Localization = Readonly<{
  language: Language;
  formatLocale: string;
  preference: LanguagePreference;
}>;
export const languageNames: Record<Language, string> = {
  de: 'Deutsch',
  en: 'English',
  es: 'Español',
  fr: 'Français',
  it: 'Italiano',
  pt: 'Português (Brasil)',
};
export const appNames: Record<Language, string> = {
  de: 'MaschinenLog',
  en: 'Machine Log',
  es: 'Registro de máquinas',
  fr: 'Journal des machines',
  it: 'Registro macchine',
  pt: 'Registro de máquinas',
};
export const catalogs: Record<Language, Record<MessageKey, string>> = {
  de,
  en,
  es,
  fr,
  it,
  pt,
};

export function resolveLanguage(
  preference: string | null,
  systemLocales: readonly string[],
): Language {
  if (languages.includes(preference as Language)) return preference as Language;
  for (const locale of systemLocales) {
    const language = locale.toLowerCase().split(/[-_]/)[0] as Language;
    if (languages.includes(language)) return language;
  }
  return 'en';
}

let current: Localization = Object.freeze({
  language: 'en',
  formatLocale: 'en-US',
  preference: null,
});
const listeners = new Set<() => void>();
export const localization = () => current;
export function setLocalization(value: Localization): void {
  if (JSON.stringify(current) === JSON.stringify(value)) return;
  current = Object.freeze({ ...value });
  listeners.forEach((listener) => listener());
}
export function subscribeLocalization(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
export function translate(
  locale: Localization,
  key: MessageKey,
  params: MessageParameters = {},
): string {
  return catalogs[locale.language][key].replace(
    /\{(\w+)\}/g,
    (_, name: string) => {
      if (!(name in params))
        throw new Error(`Missing localization parameter ${name} for ${key}`);
      return String(params[name]);
    },
  );
}
export const t = (key: MessageKey, params?: MessageParameters) =>
  translate(current, key, params);
export const translator =
  (locale: Localization) => (key: MessageKey, params?: MessageParameters) =>
    translate(locale, key, params);

/** Errors retain a stable key. Rendering resolves the current app language. */
export class LocalizedError extends Error {
  constructor(
    readonly key: MessageKey,
    readonly parameters: MessageParameters = {},
  ) {
    super();
    Object.defineProperty(this, 'message', {
      get: () => t(key, parameters),
      configurable: true,
    });
    this.name = 'LocalizedError';
  }
}
