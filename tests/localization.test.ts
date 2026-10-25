import { afterEach, expect, it } from 'vitest';
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PDFDocument } from 'pdf-lib';
import {
  catalogs,
  languages,
  resolveLanguage,
  setLocalization,
  t,
  LocalizedError,
  type Localization,
} from '../src/core/localization/runtime';
import {
  canonicalInput,
  displayInput,
  displayValue,
  parseLocalizedValue,
} from '../src/core/localization/numbers';
import { presetLabel, presetValue } from '../src/core/localization/presets';
import { counterTypeValue } from '../src/core/domain/counter-type';
import { parseValue } from '../src/core/domain/reading-value';
import { parseDateInput, calendarCells } from '../src/core/ui/date-time-model';
import { fixture, record } from './support';
import {
  dashboardCount,
  reminderSummary,
} from '../src/features/records/presentation-model';
import { defaultReminder } from '../src/features/records/reminder-model';

const fixtures: Awaited<ReturnType<typeof fixture>>[] = [];
afterEach(async () => {
  for (const f of fixtures.splice(0)) await f.close();
});
const locale = (
  language: Localization['language'],
  formatLocale: string,
): Localization => ({ language, formatLocale, preference: language });

it('resolves supported preferences and system language order independently from the region', () => {
  expect(resolveLanguage(null, ['sv-SE', 'fr-CA'])).toBe('fr');
  expect(resolveLanguage(null, ['zh-CN', 'nb-NO'])).toBe('en');
  expect(resolveLanguage('it', ['de-DE'])).toBe('it');
  expect(resolveLanguage('invalid', ['pt-PT'])).toBe('pt');
  setLocalization(locale('fr', 'sv-SE'));
  expect(t('produktionsprotokoll')).toBe('Rapport de production');
  expect(displayValue({ digits: '125', scale: 1 })).toBe('12,5');
});

it('provides the same keys and placeholders in all six catalogs', () => {
  for (const language of languages) {
    expect(Object.keys(catalogs[language]).sort()).toEqual(
      Object.keys(catalogs.en).sort(),
    );
    for (const [key, template] of Object.entries(catalogs.en)) {
      expect(
        catalogs[language][key as keyof typeof catalogs.en]
          .match(/\{\w+\}/g)
          ?.sort() ?? [],
      ).toEqual(template.match(/\{\w+\}/g)?.sort() ?? []);
    }
  }
});

it('preserves exact large readings, draft decimals and regional grouping', () => {
  const value = { digits: '900719925474099315', scale: 2 };
  for (const [region, input, output] of [
    ['de-DE', '9.007.199.254.740.993,15', '9007199254740993,15'],
    ['en-US', '9,007,199,254,740,993.15', '9007199254740993.15'],
    [
      'fr-FR',
      '9\u202f007\u202f199\u202f254\u202f740\u202f993,15',
      '9007199254740993,15',
    ],
    ['pt-BR', '9.007.199.254.740.993,15', '9007199254740993,15'],
  ]) {
    expect(parseLocalizedValue(input!, region)).toEqual(value);
    expect(displayValue(value, region)).toBe(output);
  }
  expect(parseLocalizedValue('1,234', 'en-US')).toEqual({
    digits: '1234',
    scale: 0,
  });
  expect(parseLocalizedValue('1,234', 'de-DE')).toEqual({
    digits: '1234',
    scale: 3,
  });
  expect(canonicalInput('00012.50', 'en-US')).toBe('00012,50');
  expect(displayInput('00012,50', 'en-US')).toBe('00012.50');
  expect(canonicalInput('12.', 'en-US')).toBe('12,');
  expect(() => parseLocalizedValue('12,34', 'en-US')).toThrow();
  expect(() => parseLocalizedValue('1e3', 'en-US')).toThrow();
  // The legacy/OCR parser remains independent of the active region.
  setLocalization(locale('en', 'en-US'));
  expect(parseValue('1.234,56')).toEqual({ digits: '123456', scale: 2 });
});

it('parses regional date order and rejects impossible dates without changing stored ISO dates', () => {
  const first = new Date(2000, 0, 1),
    last = new Date(2100, 11, 31);
  for (const [region, input] of [
    ['de-DE', '25.10.2026'],
    ['en-US', '10/25/2026'],
    ['fr-FR', '25/10/2026'],
    ['sv-SE', '2026-10-25'],
  ]) {
    expect(parseDateInput(input!, first, last, region)?.getTime()).toBe(
      new Date(2026, 9, 25).getTime(),
    );
  }
  expect(parseDateInput('02/30/2026', first, last, 'en-US')).toBeNull();
  setLocalization(locale('fr', 'en-US'));
  expect(calendarCells(new Date(2026, 1, 1))[0]).toBe(1);
  setLocalization(locale('en', 'de-DE'));
  expect(calendarCells(new Date(2026, 1, 1))[6]).toBe(1);
});

it('translates presets and errors at display time while retaining stable domain values', () => {
  const error = new LocalizedError('ungueltigeZahlenschreibweise');
  for (const language of languages) {
    setLocalization(locale(language, 'de-DE'));
    expect(presetValue(presetLabel('Stück'))).toBe('Stück');
    expect(counterTypeValue(presetLabel('Betriebsstunden'))).toBe('hours');
    expect(presetLabel('My own unit')).toBe('My own unit');
    expect(error.message).toBe(catalogs[language].ungueltigeZahlenschreibweise);
  }
});

it('reindexes translated search without touching entries, revisions or backup contents', async () => {
  const f = await fixture();
  fixtures.push(f);
  const r = record();
  await f.machine.saveRecord(r);
  const draft = await f.machine.draft(r.id);
  draft.form.value = '12,5';
  draft.form.note = 'Eigene Notiz';
  const entry = (await f.machine.saveEntry(draft)).entry;
  const before = await f.repo.snapshot();
  const backup = await f.backup.create('Demo2026');
  for (const language of languages) {
    const next = locale(language, 'en-US');
    setLocalization(next);
    await f.repo.reindexSearch(next);
    expect((await f.repo.entries(r.id, '12.5')).total).toBe(1);
    expect(await f.repo.snapshot()).toEqual(before);
  }
  await f.backup.restore(await f.backup.codec.decode(backup, 'Demo2026'));
  expect(await f.repo.entry(entry.id)).toEqual(entry);
});

it('pins the language of all PDF pages before asynchronous font loading', async () => {
  const f = await fixture();
  fixtures.push(f);
  const r = record();
  await f.machine.saveRecord(r);
  const draft = await f.machine.draft(r.id);
  draft.form.value = '12,5';
  const entry = (await f.machine.saveEntry(draft)).entry;
  for (const language of languages) {
    const chosen = locale(language, 'en-US');
    const pdfWork = f.pdf.create(r, [entry], false, {
      kind: 'history',
      createdAt: r.createdAt,
      locale: chosen,
    });
    setLocalization(locale(language === 'de' ? 'en' : 'de', 'de-DE'));
    const bytes = await pdfWork;
    const pdf = await PDFDocument.load(bytes);
    expect(pdf.getAuthor()).toBe(catalogs[language].maschinenlog);
    expect(pdf.getTitle()).toContain(catalogs[language].produktionsprotokoll);
    const path = join(f.root, language + '.pdf');
    await writeFile(path, bytes);
    const text = execFileSync('pdftotext', ['-layout', path, '-'], {
      encoding: 'utf8',
    });
    expect(text).toContain(catalogs[language].produktionsprotokoll);
    expect(text).toContain('12.5');
    if (language !== 'de') expect(text).not.toContain('Produktionsprotokoll');
  }
});

it('uses grammatical counts and regional reminder dates in every language', () => {
  for (const language of languages) {
    setLocalization(locale(language, 'en-US'));
    expect(dashboardCount(1)).toBe(
      catalogs[language].counterCountOne.replace('{p0}', '1'),
    );
    expect(dashboardCount(3)).toBe(
      catalogs[language].counterCountMany.replace('{p0}', '3'),
    );
    expect(dashboardCount(1000, true)).toBe(
      catalogs[language].resultCountMany.replace('{p0}', '1,000'),
    );
    const summary = reminderSummary({
      ...defaultReminder(),
      interval: 'yearly',
      day: 25,
      month: 10,
      hour: 8,
      minute: 30,
    });
    expect(summary).toContain('10/25');
    expect(summary).toContain('08:30 AM');
    if (language !== 'de') expect(summary).not.toContain('Uhr');
  }
});
