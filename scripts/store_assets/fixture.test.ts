// Generate synthetic backups with the production services, without app-only demo paths.
import { expect, it } from 'vitest';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fixture, record } from '../../tests/support';
import {
  setLocalization,
  type Language,
} from '../../src/core/localization/runtime';

it('exports six localized, restorable synthetic production histories', async () => {
  const root = process.env.ML_FIXTURE_OUTPUT;
  if (!root) throw Error('ML_FIXTURE_OUTPUT is required');
  for (const locale of ['de-DE', 'en-US', 'es-ES', 'fr-FR', 'it-IT', 'pt-BR']) {
    const copy = JSON.parse(
      await readFile(`store/${locale}/copy.json`, 'utf8'),
    );
    setLocalization({
      language: copy.language as Language,
      preference: null,
      formatLocale: locale,
    });
    const f = await fixture();
    try {
      const ids = [];
      for (let index = 0; index < 3; index++) {
        const machine = record({
          name: copy.counters[index],
          location: copy.location,
          number: `M-0${index + 1}`,
          createdAt: '2026-10-01T06:00:00.000Z',
          updatedAt: '2026-10-01T06:00:00.000Z',
        });
        machine.counters[0] = {
          ...machine.counters[0]!,
          name: copy.counters[index],
          type: index === 2 ? 'hours' : 'pieces',
          unit: index === 2 ? 'h' : index === 1 ? 'Pakete' : 'Stück',
          icon: index === 0 ? 'factory' : index === 1 ? 'packaging' : 'pump',
        };
        await f.machine.saveRecord(machine);
        const entries = [];
        const values =
          index === 0
            ? ['11840', '12040', '12260', '12480']
            : index === 1
              ? ['1152', '1200', '1248']
              : ['318,5', '326,5', '334,5'];
        for (const [i, value] of values.entries()) {
          const draft = await f.machine.draft(machine.id);
          draft.form.value = value;
          draft.form.occurredAt = `2026-10-${String(15 + i).padStart(2, '0')}T06:00:00.000Z`;
          draft.form.note = copy.note;
          if (index === 0 && i === values.length - 1) {
            const photo = await f.machine.importAttachment(
              new Uint8Array(
                await readFile(
                  'assets/photo-examples/01_fertigung_012480_stueck.jpg',
                ),
              ),
              'photo',
              'Production.jpg',
              'gallery',
            );
            draft.form.attachments = [photo];
            draft.form.source = 'gallery';
          }
          entries.push((await f.machine.saveEntry(draft)).entry);
        }
        const last = entries.at(-1)!;
        if (index === 0) {
          const correction = await f.machine.draft(machine.id, last);
          correction.form.note = copy.note + ' · M-01';
          correction.form.reason = copy.correction;
          await f.machine.saveEntry(correction);
        }
        ids.push({
          recordId: machine.id,
          counterId: machine.counters[0].id,
          entryId: last.id,
        });
      }
      const backup = await f.backup.create('Demo2026');
      const decoded = await f.backup.codec.decode(backup, 'Demo2026');
      expect(decoded.data.records).toHaveLength(3);
      expect(decoded.data.entries).toHaveLength(10);
      expect(decoded.data.entries.some((e) => e.revisions.length === 1)).toBe(
        true,
      );
      const output = join(root, locale);
      await mkdir(output, { recursive: true });
      await writeFile(join(output, 'Demo.mlbackup'), backup);
      await writeFile(
        join(output, 'fixture.json'),
        JSON.stringify(
          { locale, counters: ids, password: 'Demo2026' },
          null,
          2,
        ) + '\n',
      );
    } finally {
      await f.close();
    }
  }
});
