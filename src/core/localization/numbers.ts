import type { ReadingValue } from '../domain/reading-value';
import { parseValue } from '../domain/reading-value';
import { localization, LocalizedError } from './runtime';

export function numberSymbols(locale = localization().formatLocale) {
  const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
  return {
    decimal: parts.find((part) => part.type === 'decimal')?.value ?? '.',
    group: parts.find((part) => part.type === 'group')?.value ?? ',',
    digits: Array.from({ length: 10 }, (_, i) =>
      new Intl.NumberFormat(locale, { useGrouping: false }).format(i),
    ),
  };
}

/** String operations retain every digit, including values beyond Number's precision. */
export function displayValue(
  value: ReadingValue,
  locale = localization().formatLocale,
): string {
  const negative = value.digits.startsWith('-');
  const digits = value.digits.replace(/^-/, '').padStart(value.scale + 1, '0');
  const decimal = numberSymbols(locale).decimal;
  return (
    (negative ? '-' : '') +
    (value.scale
      ? digits.slice(0, -value.scale) + decimal + digits.slice(-value.scale)
      : digits)
  );
}

export function parseLocalizedValue(
  input: string,
  locale = localization().formatLocale,
): ReadingValue {
  const symbols = numberSymbols(locale);
  let text = input.trim();
  symbols.digits.forEach((digit, i) => {
    if (digit !== String(i)) text = text.split(digit).join(String(i));
  });
  let group = symbols.group;
  if (/^[\s\u00a0\u202f]$/.test(group)) {
    text = text.replace(/[\u00a0\u202f]/g, ' ');
    group = ' ';
  }
  const parts = text.split(symbols.decimal);
  if (parts.length > 2 || (parts.length === 2 && !/^\d+$/.test(parts[1]!)))
    throw new LocalizedError('ungueltigeZahlenschreibweise');
  let integer = parts[0] || (parts.length === 2 ? '0' : '');
  if (integer.includes(group)) {
    const groups = integer.split(group);
    const sample = new Intl.NumberFormat(locale)
      .formatToParts(1234567890123)
      .filter((part) => part.type === 'integer');
    const primary = [...sample.at(-1)!.value].length;
    const secondary = [...sample.at(-2)!.value].length;
    if (
      !groups[0] ||
      groups[0].length > secondary ||
      groups.at(-1)!.length !== primary ||
      groups.slice(1, -1).some((part) => part.length !== secondary) ||
      groups.some((part) => !/^\d+$/.test(part))
    )
      throw new LocalizedError('ungueltigeTausendergruppierung');
    integer = groups.join('');
  }
  if (!/^\d+$/.test(integer) || text.length > 100)
    throw new LocalizedError(
      'bitteEinenGueltigenNichtNegativenZaehlerstandEingeben',
    );
  return parseValue(integer + (parts.length === 2 ? ',' + parts[1] : ''));
}

/** Drafts keep their historic comma representation. Only the editable view is regional. */
export function displayInput(
  canonical: string,
  locale = localization().formatLocale,
): string {
  return canonical.replace(',', numberSymbols(locale).decimal);
}
export function canonicalInput(
  input: string,
  locale = localization().formatLocale,
): string | null {
  const symbols = numberSymbols(locale);
  let text = input;
  symbols.digits.forEach((digit, i) => {
    if (digit !== String(i)) text = text.split(digit).join(String(i));
  });
  const pieces = text.split(symbols.decimal);
  if (
    text.length <= 100 &&
    pieces.length <= 2 &&
    pieces.every((piece) => /^\d*$/.test(piece))
  )
    return pieces.join(',');
  try {
    const parsed = parseLocalizedValue(text, locale);
    const digits = parsed.digits.padStart(parsed.scale + 1, '0');
    return parsed.scale
      ? digits.slice(0, -parsed.scale) + ',' + digits.slice(-parsed.scale)
      : digits;
  } catch {
    return null;
  }
}
