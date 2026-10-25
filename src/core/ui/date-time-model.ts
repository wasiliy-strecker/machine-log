import { localization } from '../localization/runtime';
import { numberSymbols } from '../localization/numbers';

export function datePattern(locale = localization().formatLocale) {
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    calendar: 'gregory',
  }).formatToParts(new Date(2006, 10, 22));
}
export function datePlaceholder(locale = localization().formatLocale): string {
  return datePattern(locale)
    .map(
      (part) =>
        (({ day: 'DD', month: 'MM', year: 'YYYY' }) as Record<string, string>)[
          part.type
        ] ?? part.value,
    )
    .join('');
}
export function firstWeekday(locale = localization().formatLocale): number {
  const info = (
    typeof Intl.Locale === 'function'
      ? new Intl.Locale(locale)
      : { region: locale.split(/[-_]/).find((part) => /^[A-Z]{2}$/.test(part)) }
  ) as Intl.Locale & {
    weekInfo?: { firstDay: number };
    getWeekInfo?: () => { firstDay: number };
  };
  const first = info.getWeekInfo?.().firstDay ?? info.weekInfo?.firstDay;
  if (first !== undefined) return first % 7;
  // Hermes versions without weekInfo still need the correct ordering in our release regions.
  return ['US', 'CA', 'BR', 'JP', 'PH', 'TW'].includes(info.region ?? '')
    ? 0
    : 1;
}
export function weekdayLabels(): string[] {
  const start = firstWeekday();
  return Array.from({ length: 7 }, (_, day) =>
    new Intl.DateTimeFormat(localization().language, {
      weekday: 'short',
    }).format(new Date(2026, 0, 4 + start + day)),
  );
}
export function localDate(value: string): Date {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match
    ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
    : new Date(value);
}
export function parseDateInput(
  value: string,
  first: Date,
  last: Date,
  locale = localization().formatLocale,
): Date | null {
  let normalized = value.trim().replace(/[\u200e\u200f\u061c]/g, '');
  numberSymbols(locale).digits.forEach((digit, i) => {
    normalized = normalized.split(digit).join(String(i));
  });
  const order: string[] = [];
  const pattern = datePattern(locale)
    .map((part) => {
      if (['day', 'month', 'year'].includes(part.type)) {
        order.push(part.type);
        return part.type === 'year' ? '(\\d{4})' : '(\\d{1,2})';
      }
      return part.value
        .replace(/[\u200e\u200f\u061c]/g, '')
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    })
    .join('');
  const match = new RegExp('^' + pattern + '$').exec(normalized);
  if (!match) return null;
  const day = Number(match[order.indexOf('day') + 1]),
    month = Number(match[order.indexOf('month') + 1]) - 1,
    year = Number(match[order.indexOf('year') + 1]);
  const result = new Date(year, month, day);
  return result.getDate() === day &&
    result.getMonth() === month &&
    result.getFullYear() === year &&
    result >= first &&
    result <= last
    ? result
    : null;
}
export function calendarCells(month: Date): (number | null)[] {
  const start =
    (new Date(month.getFullYear(), month.getMonth(), 1).getDay() -
      firstWeekday() +
      7) %
    7;
  const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  return Array.from({ length: 42 }, (_, i) =>
    i >= start && i < start + days ? i - start + 1 : null,
  );
}
