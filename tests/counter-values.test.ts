import { describe, expect, it } from 'vitest';
import {
  parseValue,
  formatValue,
  subtractValues,
} from '../src/core/domain/reading-value';
import {
  extractCandidates,
  type OcrLine,
} from '../src/core/ocr/candidate-extractor';

const line = (text: string, extra: Partial<OcrLine> = {}): OcrLine => ({
  text,
  confidence: 0.95,
  height: 40,
  elements: [],
  ...extra,
});
describe('Exact values and local OCR candidates', () => {
  it('preserves decimals and large production counters without Number rounding', () => {
    expect(
      formatValue(
        subtractValues(
          parseValue('9007199254740993,15'),
          parseValue('9007199254740993,05'),
        ),
      ),
    ).toBe('0,10');
    expect(formatValue(parseValue('1.234,56'))).toBe('1234,56');
    expect(formatValue(parseValue('1,234.56'))).toBe('1234,56');
    expect(formatValue(parseValue('12,5'))).toBe('12,5');
    for (const text of ['-1', '1e4', '12 34', '1,,2', '12:30', '', 'NaN'])
      expect(() => parseValue(text)).toThrow();
  });
  it.each([
    '0 0 1 2 3 4,5 6',
    '001234 . 56',
    '0\u202f0\u202f1\u202f2\u202f3\u202f4,5\u202f6',
    '1 234,5 6',
  ])('recognizes spaced counter digits %s', (text) => {
    expect(
      extractCandidates([line(text)]).map((c) => formatValue(c.value)),
    ).toEqual(['1234,56']);
  });
  it('keeps zero, deduplicates equivalent values and separates text labels', () => {
    expect(extractCandidates([line('0')])[0]?.value.digits).toBe('0');
    expect(extractCandidates([line('123,40'), line('123.4')])).toHaveLength(1);
    expect(
      extractCandidates([line('12 kWh 34')]).map((c) => formatValue(c.value)),
    ).toEqual(['12', '34']);
    for (const text of ['12 34', '1234 82', '12,34 56', '1.23,45'])
      expect(extractCandidates([line(text)])).toEqual([]);
  });
  it('joins mixed groups only with adjacent bounding boxes', () => {
    const first = { text: '00123', left: 0, top: 0, right: 100, bottom: 24 };
    const second = { text: '4,56', left: 113, top: 2, right: 173, bottom: 25 };
    expect(
      extractCandidates([
        line('00123 4,56', { elements: [first, second] }),
      ]).map((c) => formatValue(c.value)),
    ).toEqual(['1234,56']);
    expect(extractCandidates([line('00123 4,56')])).toEqual([]);
    expect(
      extractCandidates([
        line('00123 4,56', { elements: [first, { ...second, left: 160 }] }),
      ]),
    ).toEqual([]);
  });
});
