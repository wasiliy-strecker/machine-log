import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createElement } from 'react';
import {
  act,
  create,
  type ReactTestInstance,
  type ReactTestRenderer,
} from 'react-test-renderer';
import { SettingsScreen } from '../src/features/settings/settings-screen';
import { fixture, record } from './support';

const ports = vi.hoisted(() => ({
  dismissKeyboard: vi.fn(),
  refresh: vi.fn(),
  media: {
    prepareBackup: vi.fn(),
    saveBackup: vi.fn(),
    shareBackup: vi.fn(),
    discardBackup: vi.fn(),
    pickBackup: vi.fn(),
  },
  feedback: { choose: vi.fn(), confirm: vi.fn(), notify: vi.fn() },
}));
vi.mock('expo-router', () => ({ router: { push: vi.fn() } }));
vi.mock('react-native', () => ({
  Keyboard: { dismiss: ports.dismissKeyboard },
  KeyboardAvoidingView: 'KeyboardAvoidingView',
  Modal: 'Modal',
  Pressable: 'Pressable',
  ScrollView: 'ScrollView',
  Text: 'Text',
  View: 'View',
}));
vi.mock('../src/core/ui/theme', () => ({
  useTheme: () => ({ primary: '#315E80', ink: '#181C20' }),
}));
vi.mock('../src/core/ui/components', () => ({
  Body: 'Body',
  Button: 'Button',
  BusyOverlay: 'BusyOverlay',
  Card: 'Card',
  Field: 'Field',
  Heading: 'Heading',
  Page: 'Page',
  Notice: (props: { text: string }) =>
    props.text ? createElement('Notice', props) : null,
  useTheme: () => ({ primary: '#315E80', ink: '#181C20' }),
  errorText: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
}));
vi.mock('../src/core/ui/icon', () => ({ Icon: 'Icon' }));
vi.mock('../src/core/ui/use-leave-guard', () => ({ useLeaveGuard: () => {} }));
vi.mock('../src/core/ui/feedback', () => ({
  useFeedback: () => ports.feedback,
}));
vi.mock('../src/core/composition', () => ({
  useServices: () => ({
    backup: active.backup,
    media: ports.media,
    refresh: ports.refresh,
    links: { open: vi.fn() },
  }),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

type Fixture = Awaited<ReturnType<typeof fixture>>;
let active: Fixture;
let saved: Uint8Array;
let renderer: ReactTestRenderer | undefined;
const fixtures: Fixture[] = [];
const password = 'Test26';
const prepared = { uri: 'file:///test/backup.mlbackup', name: 'Test.mlbackup' };
const host = (name: string) => (node: ReactTestInstance) => node.type === name;
const root = () => renderer!.root;
const button = (label: string) =>
  root()
    .findAll(host('Pressable'))
    .find((node) =>
      node
        .findAll((n) => host('Text')(n) || host('Body')(n))
        .some((n) => n.children.join('') === label),
    )!;
const press = async (label: string) => {
  const node = button(label);
  expect(node.props.disabled).not.toBe(true);
  await act(async () => node.props.onPress());
};
const fill = async (label: string, value: string) => {
  await act(async () =>
    root().findByProps({ label }).props.onChangeText(value),
  );
};
async function mount() {
  if (renderer) await act(async () => renderer!.unmount());
  await act(async () => {
    renderer = create(createElement(SettingsScreen));
  });
}
async function setup() {
  const f = await fixture();
  fixtures.push(f);
  return f;
}
async function settled(assertion: () => void) {
  await vi.waitFor(
    async () => {
      await act(async () => {});
      assertion();
    },
    { timeout: 10000 },
  );
}
beforeEach(async () => {
  vi.resetAllMocks();
  active = await setup();
  await active.machine.saveRecord(record());
  ports.media.prepareBackup.mockImplementation(async (bytes: Uint8Array) => {
    saved = bytes;
    return prepared;
  });
  ports.media.saveBackup.mockResolvedValue('saved');
  ports.media.discardBackup.mockResolvedValue(undefined);
  ports.media.pickBackup.mockImplementation(async () => saved);
  ports.feedback.choose.mockResolvedValue('done');
  ports.feedback.confirm.mockResolvedValue(true);
  await mount();
});
afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
  for (const f of fixtures.splice(0)) await f.close();
});

it('keeps password errors outside the scroller and accepts corrected input through the keyboard action', async () => {
  await press('Verschlüsseltes Backup erstellen');
  const modal = root().find(host('Modal'));
  for (let parent = modal.parent; parent; parent = parent.parent)
    expect(parent.type).not.toBe('Page');
  await fill('Passwort', '12345');
  await fill('Passwort wiederholen', '12345');
  await press('Weiter');
  const notice = root().find(host('Notice'));
  expect(notice.props.text).toContain('6 bis 1024');
  for (let parent = notice.parent; parent; parent = parent.parent)
    expect(parent.type).not.toBe('ScrollView');
  expect(ports.dismissKeyboard).toHaveBeenCalled();
  expect(ports.media.prepareBackup).not.toHaveBeenCalled();
  await fill('Passwort', password);
  await press('Weiter');
  expect(root().find(host('Notice')).props.text).toContain('nicht überein');
  await fill('Passwort wiederholen', password);
  expect(root().findAll(host('Notice'))).toHaveLength(0);
  await act(async () =>
    root()
      .findByProps({ label: 'Passwort wiederholen' })
      .props.onSubmitEditing(),
  );
  await settled(() => expect(ports.media.discardBackup).toHaveBeenCalledOnce());
  expect(ports.media.saveBackup).toHaveBeenCalledWith(prepared);
  expect(root().findAll(host('Modal'))).toHaveLength(0);
});

it('round trips the screen flow and rejects a wrong password or cancelled restore before changing SQLite', async () => {
  const before = await active.repo.snapshot();
  await press('Verschlüsseltes Backup erstellen');
  await fill('Passwort', password);
  await fill('Passwort wiederholen', password);
  await press('Weiter');
  await settled(() => expect(ports.media.discardBackup).toHaveBeenCalledOnce());
  active = await setup();
  await mount();
  await press('Backup wiederherstellen');
  await fill('Passwort', 'wrong-password');
  await press('Weiter');
  await settled(() =>
    expect(root().find(host('Notice')).props.text).toContain(
      'Passwort ist falsch',
    ),
  );
  expect(ports.feedback.confirm).not.toHaveBeenCalled();
  expect((await active.repo.snapshot()).records).toEqual([]);
  ports.feedback.confirm.mockResolvedValueOnce(false);
  await press('Backup wiederherstellen');
  await fill('Passwort', password);
  await press('Weiter');
  await settled(() => expect(ports.feedback.confirm).toHaveBeenCalledOnce());
  expect((await active.repo.snapshot()).records).toEqual([]);
  await press('Backup wiederherstellen');
  await fill('Passwort', password);
  await press('Weiter');
  await settled(() => expect(ports.refresh).toHaveBeenCalledOnce());
  expect((await active.repo.snapshot()).records).toEqual(before.records);
  expect(ports.feedback.notify).toHaveBeenCalledWith(
    expect.stringContaining('Backup wiederhergestellt'),
  );
});

it.each(['retry', 'discard'])(
  'handles save cancellation with %s and cleans only the prepared copy',
  async (action) => {
    ports.media.saveBackup.mockResolvedValueOnce('cancelled');
    ports.feedback.choose.mockResolvedValueOnce(action);
    await press('Verschlüsseltes Backup erstellen');
    await fill('Passwort', password);
    await fill('Passwort wiederholen', password);
    await press('Weiter');
    await settled(() =>
      expect(ports.media.discardBackup).toHaveBeenCalledOnce(),
    );
    expect(ports.media.prepareBackup).toHaveBeenCalledOnce();
    expect(ports.media.saveBackup).toHaveBeenCalledTimes(
      action === 'retry' ? 2 : 1,
    );
    expect(ports.media.discardBackup).toHaveBeenCalledWith(prepared);
    expect((await active.repo.snapshot()).records).toHaveLength(1);
  },
);

it('serializes repeated create taps and releases the operation after password cancellation', async () => {
  const start = button('Verschlüsseltes Backup erstellen');
  await act(async () => {
    start.props.onPress();
    start.props.onPress();
  });
  expect(button('Verschlüsseltes Backup erstellen').props.disabled).toBe(true);
  await press('Abbrechen');
  expect(button('Verschlüsseltes Backup erstellen').props.disabled).toBe(false);
  expect(ports.media.prepareBackup).not.toHaveBeenCalled();
  await press('Verschlüsseltes Backup erstellen');
  await press('Abbrechen');
  expect(root().findAll(host('Modal'))).toHaveLength(0);
});
