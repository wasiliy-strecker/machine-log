import { afterEach, expect, it } from 'vitest';
import { fixture, record, env, photo, sourcePdf } from './support';
import {
  counterDetails,
  counterTitle,
  counterLocation,
} from '../src/core/domain/production-counter';
import {
  visibleRecords,
  visibleReports,
} from '../src/features/records/presentation-model';
import { replaceReadingPhoto } from '../src/core/media/reading-photo';
import { evidenceJson, type Machine } from '../src/core/domain/models';
import { reminderRequests } from '../src/core/native/reminder-requests';
import { defaultReminder } from '../src/features/records/reminder-model';

const fixtures: Awaited<ReturnType<typeof fixture>>[] = [];
async function setup() {
  const f = await fixture();
  fixtures.push(f);
  return f;
}
afterEach(async () => {
  for (const f of fixtures.splice(0)) await f.close();
});
function legacy(): Machine {
  const r = record();
  r.counters.push({
    ...r.counters[0]!,
    id: env.id(),
    name: 'Betriebsstunden',
    type: 'hours',
    unit: 'h',
  });
  return r;
}
async function read(
  f: Awaited<ReturnType<typeof fixture>>,
  r: Machine,
  counterId: string,
  value: string,
) {
  const draft = await f.machine.draft(r.id, undefined, counterId);
  draft.form.value = value;
  return (await f.machine.saveEntry(draft)).entry;
}

it('rejects new multi-counter records and adding counters while retaining readable legacy records', async () => {
  const f = await setup();
  const r = legacy();
  await expect(f.machine.saveRecord(r)).rejects.toThrow('genau einen');
  expect(await f.repo.records()).toEqual([]);
  await f.repo.saveRecord(r);
  await expect(
    f.machine.saveRecord({
      ...r,
      counters: [...r.counters, { ...r.counters[0]!, id: env.id() }],
    }),
  ).rejects.toThrow('ergänzt');
  expect((await f.repo.records())[0]!.counters).toEqual(r.counters);
});

it('projects legacy counters separately with isolated readings, search and metadata edits', async () => {
  const f = await setup();
  const r = legacy();
  await f.repo.saveRecord(r);
  const pieces = await read(f, r, r.counters[0]!.id, '100');
  const hours = await read(f, r, r.counters[1]!.id, '12,5');
  const rows = await f.repo.dashboard();
  expect(rows).toHaveLength(2);
  expect(
    rows.find((row) => row.counter.id === pieces.counterId)?.latest?.id,
  ).toBe(pieces.id);
  expect(
    rows.find((row) => row.counter.id === hours.counterId)?.latest?.id,
  ).toBe(hours.id);
  expect(
    visibleRecords(rows, 'Betriebsstunden', 'name').map(
      (row) => row.counter.id,
    ),
  ).toEqual([hours.counterId]);
  expect(counterTitle(r, r.counters[1]!)).toBe('Presse 1 · Betriebsstunden');
  expect(visibleRecords(rows, '', 'type')[0]!.counter.type).toBe('hours');
  const before = evidenceJson((await f.repo.snapshot()).entries);
  await f.machine.saveCounter(r.id, hours.counterId, {
    ...counterDetails(r, r.counters[1]!),
    name: 'Laufzeit',
    number: 'H-2',
    location: 'Halle 3',
    icon: 'printer',
  });
  const updated = (await f.repo.records())[0]!;
  expect(updated.counters[0]).toEqual(r.counters[0]);
  expect(updated.name).toBe(r.name);
  expect(updated.location).toBe(r.location);
  expect(counterLocation(updated, updated.counters[1]!)).toBe('Halle 3');
  expect(updated.counters[1]!.icon).toBe('printer');
  expect(counterLocation(updated, updated.counters[0]!)).toBe(r.location);
  expect(evidenceJson((await f.repo.snapshot()).entries)).toBe(before);
});

it('keeps old backups readable and restores machine symbols without changing reading evidence', async () => {
  const f = await setup();
  const old = record();
  old.counters[0]!.reminder = defaultReminder();
  await f.machine.saveRecord(old);
  const entry = await read(f, old, old.counters[0]!.id, '100');
  const restored = await setup();
  const roundTrip = async () =>
    restored.backup.restore(
      await restored.backup.codec.decode(
        await f.backup.create('Test26'),
        'Test26',
      ),
    );
  await roundTrip();
  const restoredOld = (await restored.repo.records())[0]!;
  expect(restoredOld.counters[0]!.icon).toBeUndefined();
  expect(counterDetails(restoredOld, restoredOld.counters[0]!).icon).toBe(
    'machine',
  );
  expect(reminderRequests([restoredOld], [entry])[0]).toMatchObject({
    icon: 'machine',
    recordId: entry.counterId,
    latestValue: '100',
    latestUnit: 'Stück',
  });
  await f.machine.saveCounter(old.id, old.counters[0]!.id, {
    ...counterDetails(old, old.counters[0]!),
    icon: 'pump',
  });
  await roundTrip();
  const snapshot = await restored.repo.snapshot();
  expect(snapshot.records[0]!.counters[0]!.icon).toBe('pump');
  expect((await restored.repo.dashboard())[0]!.counter.icon).toBe('pump');
  expect(evidenceJson(snapshot.entries)).toBe(evidenceJson([entry]));
  expect(reminderRequests(snapshot.records, snapshot.entries)[0]?.icon).toBe(
    'pump',
  );
});

it('deletes only the selected legacy counter and keeps other readings, drafts and immutable common reports', async () => {
  const f = await setup();
  const r = legacy();
  await f.repo.saveRecord(r);
  await read(f, r, r.counters[0]!.id, '100');
  const hours = await read(f, r, r.counters[1]!.id, '12,5');
  const draft = await f.machine.draft(r.id, undefined, hours.counterId);
  draft.form.value = '13';
  await f.machine.persistDraft(draft);
  const common = await f.machine.createReport(r.id, null, false);
  const own = await f.machine.createReport(
    r.id,
    null,
    false,
    r.counters[0]!.id,
  );
  const other = await f.machine.createReport(
    r.id,
    null,
    false,
    hours.counterId,
  );
  const commonBytes = await f.vault.read(common.file);
  expect(
    visibleReports(await f.repo.reports(r.id), null, hours.counterId)
      .map((report) => report.id)
      .sort(),
  ).toEqual([common.id, other.id].sort());
  await f.machine.deleteCounter(r.id, r.counters[0]!.id);
  const snapshot = await f.repo.snapshot();
  expect(snapshot.records[0]!.counters).toEqual([r.counters[1]!]);
  expect(snapshot.entries).toEqual([hours]);
  expect((await f.repo.drafts()).map((d) => d.id)).toEqual([draft.id]);
  expect(snapshot.reports.map((report) => report.id).sort()).toEqual(
    [common.id, other.id].sort(),
  );
  expect(await f.vault.read(common.file)).toEqual(commonBytes);
  expect(await f.vault.list()).not.toContain(own.file);
  const restored = await setup();
  await restored.backup.restore(
    await restored.backup.codec.decode(
      await f.backup.create('Test26'),
      'Test26',
    ),
  );
  expect(evidenceJson(await restored.repo.snapshot())).toBe(
    evidenceJson(snapshot),
  );
});

it('replaces the current photo, preserving legacy PDF attachments and original photos through correction and backup', async () => {
  const f = await setup();
  const r = record();
  await f.machine.saveRecord(r);
  const first = await f.machine.importAttachment(
    await photo(),
    'photo',
    'Vorher.jpg',
    'camera',
  );
  const pdf = await f.machine.importAttachment(
    await sourcePdf(),
    'pdf',
    'Altanhang.pdf',
    'imported',
  );
  const draft = await f.machine.draft(r.id);
  draft.form.value = '100';
  draft.form.attachments = [first, pdf];
  const original = (await f.machine.saveEntry(draft)).entry;
  const nextPhoto = await f.machine.importAttachment(
    await photo(),
    'photo',
    'Nachher.jpg',
    'gallery',
  );
  const edit = await f.machine.draft(r.id, original);
  edit.form.attachments = replaceReadingPhoto(edit.form.attachments, nextPhoto);
  edit.form.reason = 'Neues Nachweisfoto';
  const changed = (await f.machine.saveEntry(edit)).entry;
  expect(changed.attachments).toEqual([nextPhoto, pdf]);
  expect(changed.original.attachments).toEqual([first, pdf]);
  expect(changed.revisions[0]!.before.attachments).toEqual([first, pdf]);
  expect(await f.vault.read(first.file)).toEqual(await photo());
  const restored = await setup();
  await restored.backup.restore(
    await restored.backup.codec.decode(
      await f.backup.create('Test26'),
      'Test26',
    ),
  );
  const restoredEntry = (await restored.repo.entry(changed.id))!;
  expect(evidenceJson(restoredEntry.original)).toBe(
    evidenceJson(original.original),
  );
  expect(
    await restored.vault.read(restoredEntry.original.attachments[0]!.file),
  ).toEqual(await photo());
  expect(() => replaceReadingPhoto(changed.attachments, pdf)).toThrow(
    'Zählerfoto',
  );
});
