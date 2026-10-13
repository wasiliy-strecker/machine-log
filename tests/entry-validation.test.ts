import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createElement, type ReactNode } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { EntryEditorScreen } from '../src/features/entries/entry-editor-screen';
import { FormErrorTarget } from '../src/core/ui/form-error-target';
import { ScrollContext } from '../src/core/ui/scroll-host';
import { FormValidationError } from '../src/core/domain/form-validation';
import { readingInput } from '../src/features/entries/reading-input';
import { fixture, record } from './support';

const ports = vi.hoisted(() => ({
  scrollTo: vi.fn(),
  dismissKeyboard: vi.fn(),
  notify: vi.fn(),
  navigate: vi.fn(),
  hideKeyboard: undefined as (() => void) | undefined,
}));
vi.mock('react-native', () => ({
  View: 'View',
  Keyboard: {
    dismiss: ports.dismissKeyboard,
    addListener: (_: string, callback: () => void) => {
      ports.hideKeyboard = callback;
      return { remove: vi.fn() };
    },
  },
}));
vi.mock('expo-router', () => ({
  Stack: { Screen: 'Screen' },
  useLocalSearchParams: () => params,
  router: { replace: ports.navigate, dismissTo: ports.navigate },
}));
vi.mock('../src/core/ui/components', () => ({
  Body: 'Body',
  Button: 'Button',
  Busy: 'Busy',
  Card: 'Card',
  DateField: 'DateField',
  Field: 'Field',
  Notice: 'Notice',
  SelectField: 'SelectField',
  Page: ({ children }: { children: ReactNode }) =>
    createElement(ScrollContext.Provider, { value: host }, children),
  errorText: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
}));
vi.mock('../src/core/ui/suggestion-field', () => ({
  SuggestionField: 'SuggestionField',
}));
vi.mock('../src/features/media/attachments', () => ({
  PhotoEditor: 'PhotoEditor',
  Documents: 'Documents',
}));
vi.mock('../src/core/ui/feedback', () => ({
  useFeedback: () => ({ notify: ports.notify }),
}));
vi.mock('../src/core/ui/use-leave-guard', () => ({
  useLeaveGuard: () => (callback: () => void) => callback(),
}));
vi.mock('../src/core/composition', () => ({
  useServices: () => ({ machine: f.machine, refresh: vi.fn() }),
}));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

let f: Awaited<ReturnType<typeof fixture>>;
let machineRecord = record();
let params: { recordId: string; counterId: string; entryId?: string };
let renderer: ReactTestRenderer | undefined;
const host = {
  ref: {
    current: {
      scrollTo: ports.scrollTo,
      getNativeScrollRef: () => ({
        measureInWindow: (callback: (x: number, y: number) => void) =>
          callback(0, 100),
      }),
    },
  },
  offset: { current: 700 },
  height: { current: 500 },
  content: { current: 1500 },
} as unknown as NonNullable<React.ContextType<typeof ScrollContext>>;
const root = () => renderer!.root;
const field = (label: string) => root().findByProps({ label });
async function press(title: string) {
  await act(async () => root().findByProps({ title }).props.onPress());
}
async function mount() {
  await act(async () => {
    renderer = create(createElement(EntryEditorScreen), {
      createNodeMock: (node) => ({
        measureInWindow: (callback: (x: number, y: number) => void) =>
          callback(
            0,
            (node.props as { children?: { type?: string } }).children?.type ===
              'Notice'
              ? -600
              : -200,
          ),
      }),
    });
    // The editor loads from the real SQLite repository and draft service.
    await new Promise((resolve) => setTimeout(resolve, 20));
  });
}
beforeEach(async () => {
  vi.resetAllMocks();
  vi.stubGlobal('requestAnimationFrame', (callback: (time: number) => void) => {
    callback(0);
    return 1;
  });
  vi.stubGlobal('cancelAnimationFrame', vi.fn());
  f = await fixture();
  machineRecord = record();
  await f.machine.saveRecord(machineRecord);
  params = {
    recordId: machineRecord.id,
    counterId: machineRecord.counters[0]!.id,
  };
});
afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
  await f.machine.queue.run(async () => {});
  await f.close();
  vi.unstubAllGlobals();
});

it('keeps decimal editing and exact pasted numbers while rejecting signs, letters and exponent notation', () => {
  for (const text of ['', '0', '258', '12,', '12.5', ',5', '00012,50'])
    expect(readingInput(text)).toBe(text);
  expect(readingInput('9.007.199.254.740.993,15')).toBe('9007199254740993,15');
  expect(readingInput('1 234,50')).toBe('1234,50');
  for (const text of [
    '-25',
    '+25',
    '1e3',
    '12kg',
    '12:30',
    '1,,2',
    '12 34',
    '2'.repeat(101),
  ])
    expect(readingInput(text)).toBeNull();
  expect(readingInput('258.,569', '258.,5699')).toBe('258.,569');
  expect(readingInput('258,5699', '258.,5699')).toBe('258,5699');
  expect(readingInput('258.,569x', '258.,5699')).toBeNull();
});

it('marks an empty reading inline, reveals it on every failed save and preserves the draft', async () => {
  await mount();
  await press('Ohne Foto erfassen');
  await press('Bestätigen und speichern');
  expect(field('Zählerstand *').props.error).toBe(
    'Bitte einen Zählerstand eingeben.',
  );
  expect(
    root()
      .findAllByType(FormErrorTarget)
      .filter((node) => node.props.active),
  ).toHaveLength(1);
  expect(ports.scrollTo).toHaveBeenLastCalledWith({ y: 380, animated: true });
  expect(ports.dismissKeyboard).toHaveBeenCalled();
  expect((await f.repo.snapshot()).entries).toHaveLength(0);
  expect(await f.repo.drafts()).toHaveLength(1);
  ports.scrollTo.mockClear();
  await press('Bestätigen und speichern');
  expect(ports.scrollTo).toHaveBeenCalledOnce();
  await act(async () => field('Zählerstand *').props.onChangeText('12,5'));
  expect(field('Zählerstand *').props.error).toBeUndefined();
  await act(async () => field('Zählerstand *').props.onChangeText('-25'));
  expect(field('Zählerstand *').props.value).toBe('12,5');
  await press('Bestätigen und speichern');
  expect((await f.repo.snapshot()).entries[0]?.measurement.value).toEqual({
    digits: '125',
    scale: 1,
  });
});

it('reveals general save failures at the top and retries without discarding data', async () => {
  await mount();
  await press('Ohne Foto erfassen');
  await act(async () => field('Zählerstand *').props.onChangeText('25'));
  vi.spyOn(f.machine, 'saveEntry').mockRejectedValue(
    new Error('Speichern fehlgeschlagen. Bitte erneut versuchen.'),
  );
  await press('Bestätigen und speichern');
  expect(
    root().findByProps({
      text: 'Speichern fehlgeschlagen. Bitte erneut versuchen.',
    }).props.error,
  ).toBe(true);
  expect(ports.scrollTo).toHaveBeenCalledOnce();
  expect(ports.scrollTo).toHaveBeenLastCalledWith({ y: 0, animated: true });
  await act(async () => ports.hideKeyboard?.());
  expect(ports.scrollTo).toHaveBeenCalledTimes(2);
  ports.scrollTo.mockClear();
  await press('Bestätigen und speichern');
  expect(ports.scrollTo).toHaveBeenCalledOnce();
  expect(field('Zählerstand *').props.value).toBe('25');
  expect(await f.repo.drafts()).toHaveLength(1);
});

it('reveals the first invalid field without dismissing the keyboard again while correcting it', async () => {
  await mount();
  await press('Ohne Foto erfassen');
  await act(async () => field('Einheit *').props.onChange(''));
  await press('Bestätigen und speichern');
  expect(field('Einheit *').props.error).toBeDefined();
  expect(field('Zählerstand *').props.error).toBeDefined();
  const active = root()
    .findAllByType(FormErrorTarget)
    .find((node) => node.props.active);
  expect(active?.findByProps({ label: 'Einheit *' })).toBeDefined();
  ports.scrollTo.mockClear();
  ports.dismissKeyboard.mockClear();
  await act(async () => field('Einheit *').props.onChange('kg'));
  expect(field('Einheit *').props.error).toBeUndefined();
  expect(ports.scrollTo).not.toHaveBeenCalled();
  expect(ports.dismissKeyboard).not.toHaveBeenCalled();
});

it('assigns unit, closing value, time conflicts and correction reasons to their fields without writing invalid entries', async () => {
  let d = await f.machine.draft(machineRecord.id);
  d.form.value = '100';
  d.form.occurredAt = '2026-10-13T08:00:00Z';
  const first = (await f.machine.saveEntry(d)).entry;
  d = await f.machine.draft(machineRecord.id);
  d.form.value = '120';
  d.form.unit = '';
  await expect(f.machine.saveEntry(d)).rejects.toMatchObject({
    fields: { unit: 'Bitte eine Einheit eingeben.' },
  });
  d.form.unit = 'Stück';
  d.form.occurredAt = first.occurredAt;
  await expect(f.machine.saveEntry(d)).rejects.toMatchObject({
    fields: { occurredAt: expect.stringContaining('bereits einen Eintrag') },
  });
  d.form.occurredAt = '2026-10-13T09:00:00Z';
  d.form.value = '90';
  await expect(f.machine.saveEntry(d)).rejects.toMatchObject({
    fields: { value: expect.stringContaining('benachbarten Ablesung') },
  });
  d.form.kind = 'reset';
  d.form.closingValue = '90';
  await expect(f.machine.saveEntry(d)).rejects.toMatchObject({
    fields: { closingValue: expect.stringContaining('benachbarten Ablesung') },
  });
  d.form.closingValue = '120';
  d.form.value = '0';
  await f.machine.saveEntry(d);
  const correction = await f.machine.draft(machineRecord.id, first);
  correction.form.value = '101';
  await expect(f.machine.saveEntry(correction)).rejects.toBeInstanceOf(
    FormValidationError,
  );
  await expect(f.machine.saveEntry(correction)).rejects.toMatchObject({
    fields: { reason: 'Bitte einen Änderungsgrund angeben.' },
  });
  correction.form.reason = 'x'.repeat(501);
  await expect(f.machine.saveEntry(correction)).rejects.toMatchObject({
    fields: { reason: expect.stringContaining('500 Zeichen') },
  });
  expect((await f.repo.snapshot()).entries).toHaveLength(2);
  const unchanged = await f.machine.draft(machineRecord.id, first);
  await expect(f.machine.saveEntry(unchanged)).resolves.toMatchObject({
    entry: { id: first.id, revisions: [] },
  });
});
