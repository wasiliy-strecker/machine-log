import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import {
  CorrectionHistory,
  EntryInformation,
} from '../src/features/entries/entry-detail-sections';
import { evidenceJson } from '../src/core/domain/models';
import { env, fixture, photo, record } from './support';

vi.mock('react-native', () => ({ View: 'View', Pressable: 'Pressable' }));
vi.mock('../src/core/ui/components', () => ({
  Body: 'Body',
  Card: 'Card',
  useTheme: () => ({ primary: '#008577', border: '#ddd' }),
}));
vi.mock('../src/core/ui/icon', () => ({ Icon: 'Icon' }));
vi.mock('../src/features/media/attachments', () => ({
  Documents: 'Documents',
  PhotoGallery: 'PhotoGallery',
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let f: Awaited<ReturnType<typeof fixture>>;
let renderer: ReactTestRenderer | undefined;
const root = () => renderer!.root;
const text = () =>
  root()
    .findAllByType('Body' as never)
    .map((node) =>
      Array.isArray(node.props.children)
        ? node.props.children.join('')
        : node.props.children,
    )
    .join('\n');
beforeEach(async () => {
  f = await fixture();
});
afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
  vi.restoreAllMocks();
  await f.close();
});

it('shows labeled reading information and the same short empty correction explanation as ZählerstandLog', async () => {
  const machine = record();
  await f.machine.saveRecord(machine);
  const draft = await f.machine.draft(machine.id);
  draft.form.value = '100';
  draft.form.note = 'Frühschicht';
  const entry = (await f.machine.saveEntry(draft)).entry;
  await act(async () => {
    renderer = create(createElement(EntryInformation, { entry }));
  });
  expect(text()).toContain('Zeitpunkt der Ablesung');
  expect(text()).toContain('Quelle\nManuell erfasst');
  expect(text()).toContain('Notiz\nFrühschicht');
  expect(text()).not.toContain('Eintragsinformationen');
  expect(text()).not.toContain('Zuletzt bearbeitet');
  expect(text()).not.toContain('OCR');
  expect(text()).not.toContain('Zuwachs');
  await act(async () => {
    renderer!.update(createElement(CorrectionHistory, { entry }));
  });
  expect(text()).toContain('Korrekturverlauf');
  expect(text()).toContain(
    'Hier findest du jede gespeicherte Korrektur mit Zeitpunkt, den geänderten Angaben und – falls angegeben – einem Grund.',
  );
  expect(text()).toContain(
    'Für diese Ablesung gibt es noch keine Korrekturen.',
  );
});

it('lists only actual changes newest first and reveals previous photos only when requested', async () => {
  const clock = vi
    .spyOn(env, 'now')
    .mockReturnValue('2026-10-10T08:00:00.000Z');
  const machine = record();
  await f.machine.saveRecord(machine);
  const beforePhoto = await f.machine.importAttachment(
    await photo(),
    'photo',
    'Vorher.jpg',
    'camera',
  );
  const afterPhoto = await f.machine.importAttachment(
    await photo(),
    'photo',
    'Neu.jpg',
    'camera',
  );
  const draft = await f.machine.draft(machine.id);
  draft.form.value = '100';
  draft.form.attachments = [beforePhoto];
  const original = (await f.machine.saveEntry(draft)).entry;
  clock.mockReturnValue('2026-10-11T08:00:00.000Z');
  const correction = await f.machine.draft(machine.id, original);
  correction.form.value = '101';
  correction.form.reason = 'Fehleingabe';
  const corrected = (await f.machine.saveEntry(correction)).entry;
  clock.mockReturnValue('2026-10-12T08:00:00.000Z');
  const photoEdit = await f.machine.draft(machine.id, corrected);
  photoEdit.form.note = 'Anzeige geprüft';
  photoEdit.form.attachments = [afterPhoto];
  const entry = (await f.machine.saveEntry(photoEdit)).entry;
  const evidence = evidenceJson(await f.repo.snapshot());
  await act(async () => {
    renderer = create(createElement(CorrectionHistory, { entry }));
  });
  const headings = root()
    .findAllByType('Body' as never)
    .filter(
      (node) =>
        Array.isArray(node.props.children) &&
        node.props.children[0] === 'Korrektur vom ',
    )
    .map((node) => node.props.children.join(''));
  expect(headings[0]).toContain('12.10.2026');
  expect(headings[1]).toContain('11.10.2026');
  expect(text()).toContain('Grund: Fehleingabe');
  expect(text().match(/Zählerstand/g)).toHaveLength(1);
  expect(text()).toContain('Vorher:\n100 Stück\nNeu:\n101 Stück');
  expect(text()).toContain('Vorher:\nKeine Angabe\nNeu:\nAnzeige geprüft');
  expect(text()).not.toContain('Zeitpunkt der Ablesung');
  expect(text()).not.toContain('Art des Eintrags');
  expect(text()).not.toContain('Ursprünglich:');
  expect(text()).not.toContain('→');
  expect(
    root()
      .findAllByType('PhotoGallery' as never)
      .map((node) => node.props.photos),
  ).toEqual([[afterPhoto]]);
  const expand = root().findByType('Pressable' as never);
  expect(expand.props.accessibilityState.expanded).toBe(false);
  await act(async () => expand.props.onPress());
  expect(
    root()
      .findAllByType('PhotoGallery' as never)
      .map((node) => node.props.photos),
  ).toEqual([[afterPhoto], [beforePhoto]]);
  await act(async () => expand.props.onPress());
  expect(root().findAllByType('PhotoGallery' as never)).toHaveLength(1);
  expect(evidenceJson(await f.repo.snapshot())).toBe(evidence);
});
