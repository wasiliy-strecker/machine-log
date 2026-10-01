// Adapted from ZählerstandLog's ReadingValue (MPL-2.0).
export type ReadingValue = { digits: string; scale: number };

export function parseValue(input: string): ReadingValue {
  const value = input
    .trim()
    .replaceAll('’', "'")
    .replace(/[\u00a0\u202f]/g, ' ');
  if (!value || value.length > 100 || !/^[0-9., ']+$/.test(value))
    throw new Error(
      'Bitte einen gültigen, nicht negativen Zählerstand eingeben.',
    );
  const commas = value.split(',').length - 1;
  const dots = value.split('.').length - 1;
  const decimal =
    commas && dots
      ? value.lastIndexOf(',') > value.lastIndexOf('.')
        ? ','
        : '.'
      : commas === 1
        ? ','
        : dots === 1
          ? '.'
          : null;
  if (decimal && value.split(decimal).length !== 2)
    throw new Error('Ungültige Zahlenschreibweise.');
  const split = decimal ? value.lastIndexOf(decimal) : -1;
  let integer = split < 0 ? value : value.slice(0, split) || '0';
  const fraction = split < 0 ? '' : value.slice(split + 1);
  if (split >= 0 && !/^\d+$/.test(fraction))
    throw new Error('Nachkommastellen bitte vollständig eingeben.');
  if (!/^\d+$/.test(integer)) {
    const separators = [...new Set(integer.match(/[., ']/g))];
    const separator = separators[0];
    if (
      separators.length !== 1 ||
      !separator ||
      !new RegExp(
        `^\\d{1,3}(?:${separator === '.' ? '\\.' : separator}\\d{3})+$`,
      ).test(integer)
    )
      throw new Error('Ungültige Tausendergruppierung.');
    integer = integer.split(separator).join('');
  }
  return {
    digits: (integer + fraction).replace(/^0+(?=\d)/, ''),
    scale: fraction.length,
  };
}
export function formatValue(value: ReadingValue): string {
  const negative = value.digits.startsWith('-');
  const raw = value.digits.replace(/^-/, '').padStart(value.scale + 1, '0');
  const text = value.scale
    ? `${raw.slice(0, -value.scale)},${raw.slice(-value.scale)}`
    : raw;
  return (negative ? '-' : '') + text;
}
export function canonicalValue(value: ReadingValue): string {
  return formatValue(value)
    .replace(/(,\d*?)0+$/, '$1')
    .replace(/,$/, '');
}
function scaled(value: ReadingValue, scale: number) {
  return BigInt(value.digits) * 10n ** BigInt(scale - value.scale);
}
export function subtractValues(a: ReadingValue, b: ReadingValue): ReadingValue {
  const scale = Math.max(a.scale, b.scale);
  return { digits: String(scaled(a, scale) - scaled(b, scale)), scale };
}
export function addValues(a: ReadingValue, b: ReadingValue): ReadingValue {
  const scale = Math.max(a.scale, b.scale);
  return { digits: String(scaled(a, scale) + scaled(b, scale)), scale };
}
export function compareValues(a: ReadingValue, b: ReadingValue): number {
  const difference = BigInt(subtractValues(a, b).digits);
  return difference < 0n ? -1 : difference > 0n ? 1 : 0;
}
