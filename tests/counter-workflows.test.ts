import { afterEach, expect, it } from 'vitest';
import { fixture, record, env, photo, sourcePdf, connect } from './support';
import { SqlRepository, migrate } from '../src/core/database/repository';
import { increment, counterTotals } from '../src/core/domain/counter-timeline';
import { formatValue } from '../src/core/domain/reading-value';
import {
  allAttachments,
  evidenceJson,
  snapshotFiles,
  type EntryForm,
  type Machine,
} from '../src/core/domain/models';
import { digest } from '../src/core/files/integrity';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createDecipheriv, pbkdf2Sync } from 'node:crypto';
import { mergeEvent } from '../src/core/backup/backup-service';

const fixtures: Awaited<ReturnType<typeof fixture>>[] = [];
async function setup() {
  const f = await fixture();
  fixtures.push(f);
  return f;
}
afterEach(async () => {
  for (const f of fixtures.splice(0)) await f.close();
});
type Fixture = Awaited<ReturnType<typeof fixture>>;
async function reading(
  f: Fixture,
  machine: Machine,
  minute: number,
  value: string,
  patch: Partial<EntryForm> = {},
  counterId = machine.counters[0]!.id,
) {
  const d = await f.machine.draft(machine.id, undefined, counterId);
  Object.assign(d.form, {
    occurredAt: new Date(Date.UTC(2026, 0, 1, 10, minute)).toISOString(),
    value,
    ...patch,
  });
  return (await f.machine.saveEntry(d)).entry;
}
it('isolates two counters, recalculates late readings and persists across reopening', async () => {
  const f = await setup(),
    r = record();
  r.counters.push({
    ...r.counters[0]!,
    id: env.id(),
    name: 'Betriebsstunden',
    type: 'hours',
    unit: 'h',
  });
  await f.machine.saveRecord(r);
  const baseline = await reading(f, r, 0, '100');
  expect(counterTotals([baseline])).toEqual([]);
  const last = await reading(f, r, 30, '150');
  await reading(f, r, 10, '120');
  expect(
    formatValue(increment(last, await f.repo.previousMeasurement(last)).value!),
  ).toBe('30');
  await reading(f, r, 0, '12,5', {}, r.counters[1]!.id);
  expect((await f.repo.entries(r.id, '', 0, 10, r.counters[0]!.id)).total).toBe(
    3,
  );
  expect(
    counterTotals(await f.repo.timeline(r.counters[0]!.id))[0],
  ).toMatchObject({ value: { digits: '50', scale: 0 }, incomplete: false });
  const db = connect(f.path);
  try {
    await migrate(db.db);
    expect((await new SqlRepository(db.db).snapshot()).entries).toHaveLength(4);
  } finally {
    db.raw.close();
  }
});
it('calculates reset and replacement boundaries, including backdated changes', async () => {
  const f = await setup(),
    r = record();
  await f.machine.saveRecord(r);
  await reading(f, r, 0, '100');
  await reading(f, r, 10, '0', { kind: 'reset', closingValue: '120' });
  await reading(f, r, 20, '15');
  expect(
    formatValue(
      counterTotals(await f.repo.timeline(r.counters[0]!.id))[0]!.value,
    ),
  ).toBe('35');
  await reading(f, r, 5, '110');
  await reading(f, r, 30, '500', {
    kind: 'replacement',
    closingValue: '20',
    newCounterNumber: 'NEU-2',
  });
  await reading(f, r, 40, '505');
  expect(
    formatValue(
      counterTotals(await f.repo.timeline(r.counters[0]!.id))[0]!.value,
    ),
  ).toBe('45');
});
it('marks incomplete transitions and never bridges a changed unit', async () => {
  const f = await setup(),
    r = record();
  await f.machine.saveRecord(r);
  await reading(f, r, 0, '100');
  await reading(f, r, 10, '0', { kind: 'reset' });
  await reading(f, r, 20, '15');
  const totals = counterTotals(await f.repo.timeline(r.counters[0]!.id));
  expect(totals[0]).toMatchObject({
    value: { digits: '15', scale: 0 },
    incomplete: true,
  });
  const changed = await reading(f, r, 30, '4', { unit: 'kg' });
  expect(
    increment(changed, await f.repo.previousMeasurement(changed)).gap,
  ).toBe(true);
  await reading(f, r, 40, '5', { unit: 'kg' });
  expect(
    counterTotals(await f.repo.timeline(r.counters[0]!.id)).map(
      (t) => `${formatValue(t.value)} ${t.unit}`,
    ),
  ).toEqual(['15 Stück', '1 kg']);
});
it('rejects inconsistent inserts, duplicate times and removal of a required reset atomically', async () => {
  const f = await setup(),
    r = record();
  await f.machine.saveRecord(r);
  await reading(f, r, 0, '100');
  await reading(f, r, 30, '150');
  const before = evidenceJson(await f.repo.snapshot());
  await expect(reading(f, r, 10, '160')).rejects.toThrow('benachbarten');
  await expect(reading(f, r, 30, '150')).rejects.toThrow('Zeitpunkt');
  expect(evidenceJson(await f.repo.snapshot())).toBe(before);
  const reset = await reading(f, r, 40, '0', {
    kind: 'reset',
    closingValue: '155',
  });
  await reading(f, r, 50, '1');
  await expect(f.machine.delete('entry', reset.id)).rejects.toThrow(
    'benachbarten',
  );
  await expect(
    f.machine.saveRecord({
      ...r,
      counters: [{ ...r.counters[0]!, id: env.id() }],
    }),
  ).rejects.toThrow('nicht entfernt');
});
it('retains originals and photo versions, requires a reason and rejects stale or divergent corrections', async () => {
  const f = await setup(),
    r = record();
  await f.machine.saveRecord(r);
  const a = await f.machine.importAttachment(
    await photo(),
    'photo',
    'Vorher.jpg',
    'camera',
  );
  const original = await reading(f, r, 0, '100', {
    attachments: [a],
    source: 'camera',
    ocr: { photoId: a.id, rawText: '0100', selectedText: '0100' },
  });
  const d = await f.machine.draft(r.id, original);
  d.form.value = '101';
  d.form.attachments = [];
  d.form.ocr = null;
  await expect(f.machine.saveEntry(d)).rejects.toThrow('Änderungsgrund');
  d.form.reason = 'Anzeige falsch gelesen';
  const changed = (await f.machine.saveEntry(d)).entry;
  expect(changed.revisions[0]!.before.measurement.value.digits).toBe('100');
  expect(changed.original.attachments[0]?.sha256).toBe(a.sha256);
  expect(await f.vault.read(a.file)).toEqual(await photo());
  expect(allAttachments(changed).length).toBeGreaterThan(0);
  await expect(f.machine.saveEntry(d)).rejects.toThrow('zwischenzeitlich');
  const other = structuredClone(changed);
  other.revisions[0]!.id = env.id();
  expect(() => mergeEvent(changed, other)).toThrow('getrennt');
  expect(mergeEvent(changed, original).revisions).toHaveLength(1);
});
it('exports grouped production PDFs and restores encrypted evidence including history and immutable reports', async () => {
  const f = await setup(),
    r = record();
  r.counters.push({
    ...r.counters[0]!,
    id: env.id(),
    name: 'Zyklen',
    unit: 'Zyklen',
    type: 'cycles',
  });
  await f.machine.saveRecord(r);
  const image = await f.machine.importAttachment(
    await photo(),
    'photo',
    'Zaehler.jpg',
    'gallery',
  );
  const pdf = await f.machine.importAttachment(
    await sourcePdf(['SYNTHETIC_MACHINE_ATTACHMENT']),
    'pdf',
    'Beleg.pdf',
    'imported',
  );
  const first = await reading(f, r, 0, '100', {
    attachments: [image, pdf],
    source: 'gallery',
  });
  await reading(f, r, 10, '0', { kind: 'reset', closingValue: '120' });
  await reading(f, r, 20, '15');
  await reading(f, r, 0, '12', {}, r.counters[1]!.id);
  const originalReport = await f.machine.createReport(r.id, null, false);
  const originalBytes = await f.vault.read(originalReport.file);
  const edit = await f.machine.draft(r.id, first);
  edit.form.value = '101';
  edit.form.reason = 'Ziffer berichtigt';
  edit.form.attachments = [];
  await f.machine.saveEntry(edit);
  expect(await f.vault.read(originalReport.file)).toEqual(originalBytes);
  const report = await f.machine.createReport(r.id, null, true);
  const path = join(f.root, 'production.pdf');
  await writeFile(path, await f.vault.read(report.file));
  execFileSync('pdftotext', ['-layout', path, path + '.txt']);
  const text = await readFile(path + '.txt', 'utf8');
  for (const expected of [
    'Produktionsprotokoll',
    '34 Stück',
    'Zyklen',
    'Rücksetzung',
    'Korrektur',
    'Ziffer berichtigt',
    'SYNTHETIC_MACHINE_ATTACHMENT',
    'Frühere Fotoversionen',
  ])
    expect(text).toContain(expected);
  const password = 'Synthetisches Passwort';
  const encoded = await f.backup.create(password);
  // Independently authenticate/decrypt with OpenSSL through Node Crypto.
  expect(Buffer.from(encoded.slice(0, 8)).toString()).toBe('MLBACK01');
  const view = new DataView(
    encoded.buffer,
    encoded.byteOffset,
    encoded.byteLength,
  );
  const key = pbkdf2Sync(
    password,
    encoded.slice(12, 28),
    view.getUint32(8),
    32,
    'sha256',
  );
  const decipher = createDecipheriv('aes-256-gcm', key, encoded.slice(28, 40));
  decipher.setAAD(encoded.slice(0, 40));
  decipher.setAuthTag(encoded.slice(-16));
  expect(
    Buffer.concat([decipher.update(encoded.slice(40, -16)), decipher.final()])
      .length,
  ).toBeGreaterThan(0);
  const decoded = await f.backup.codec.decode(encoded, password);
  const before = await f.repo.snapshot();
  await f.machine.delete('record', r.id);
  await f.backup.restore(decoded);
  const restored = await f.repo.snapshot();
  expect(evidenceJson(restored)).toBe(evidenceJson(before));
  for (const key of snapshotFiles(restored))
    expect((await f.vault.read(key)).length).toBeGreaterThan(0);
  expect(
    restored.entries.find((e) => e.id === first.id)?.revisions,
  ).toHaveLength(1);
  const immutable = restored.reports.find((p) => p.id === originalReport.id)!;
  expect(digest(await f.vault.read(immutable.file))).toBe(
    digest(originalBytes),
  );
  await expect(
    f.backup.codec.decode(encoded, 'Falsches Passwort'),
  ).rejects.toThrow();
  const foreign = encoded.slice();
  foreign.set(new TextEncoder().encode('HABACK01'));
  await expect(f.backup.codec.decode(foreign, password)).rejects.toThrow(
    'MaschinenLog',
  );
  const tampered = encoded.slice();
  tampered[tampered.length - 1]! ^= 1;
  await expect(f.backup.codec.decode(tampered, password)).rejects.toThrow();
});
