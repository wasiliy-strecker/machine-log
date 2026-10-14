import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { createElement, useState } from 'react';
import { act, create, type ReactTestRenderer } from 'react-test-renderer';
import { PermissionsAndroid } from 'react-native';
import type { Reminder } from '../src/core/domain/models';
import type { ReminderStatus } from '../src/core/native/machine-native';
import { ReminderEditor } from '../src/features/records/reminder-editor';
import { RecordEditorScreen } from '../src/features/records/record-editor-screen';
import { ReminderScheduleStatus } from '../src/features/records/reminder-status';
import { useReminderStatusSnapshot } from '../src/features/records/use-reminder-status';
import {
  defaultReminder,
  nextHourlyTrigger,
  hourlyStart,
  reminderPresentation,
  reminderSaveWarning,
} from '../src/features/records/reminder-model';
import { record } from './support';

const ports = vi.hoisted(() => ({
  notify: vi.fn(),
  dismiss: vi.fn(),
  refresh: vi.fn(),
  pickDate: vi.fn(),
  pickTime: vi.fn(),
  records: vi.fn(),
  timeline: vi.fn(),
  saveCounter: vi.fn(),
  saveRecord: vi.fn(),
  changed: vi.fn(),
  native: {
    reminderStatus: vi.fn(),
    openReminderSettings: vi.fn(),
    testReminder: vi.fn(),
  },
  active: undefined as ((state: string) => void) | undefined,
}));
vi.mock('react-native', () => ({
  View: 'View',
  Text: 'Text',
  Keyboard: { dismiss: vi.fn() },
  AppState: {
    addEventListener: (_: string, callback: (state: string) => void) => {
      ports.active = callback;
      return { remove: vi.fn() };
    },
  },
  Platform: { OS: 'android', Version: 35 },
  PermissionsAndroid: {
    request: vi.fn(),
    PERMISSIONS: { POST_NOTIFICATIONS: 'notifications' },
  },
}));
vi.mock('expo-router', async () => {
  const React = await import('react');
  return {
    Stack: { Screen: 'Screen' },
    router: { dismissTo: ports.dismiss, replace: ports.dismiss },
    useLocalSearchParams: () => ({
      id: machineRecord.id,
      counterId: machineRecord.counters[0]!.id,
    }),
    useFocusEffect: (callback: () => () => void) =>
      React.useEffect(callback, [callback]),
  };
});
vi.mock('../src/core/ui/components', () => ({
  Body: 'Body',
  Button: 'Button',
  Card: 'Card',
  Field: 'Field',
  Notice: 'Notice',
  SelectField: 'SelectField',
  MaterialSwitch: 'Switch',
  Page: (props: { children: React.ReactNode; bottom?: React.ReactNode }) =>
    createElement('Page', null, props.children, props.bottom),
  Busy: 'Busy',
  useTheme: () => ({
    primary: '#006b63',
    ink: '#111',
    border: '#ddd',
    muted: '#666',
    errorContainer: '#fee',
  }),
  errorText: (error: unknown) =>
    error instanceof Error ? error.message : String(error),
}));
vi.mock('../src/core/ui/icon', () => ({ Icon: 'Icon' }));
vi.mock('../src/core/ui/suggestion-field', () => ({
  SuggestionField: 'SuggestionField',
}));
vi.mock('../src/core/ui/material-date-time', () => ({
  useMaterialDateTime: () => ({
    dialog: null,
    date: ports.pickDate,
    time: ports.pickTime,
  }),
}));
vi.mock('../src/core/ui/feedback', () => ({
  useFeedback: () => ({ notify: ports.notify }),
}));
vi.mock('../src/core/ui/use-leave-guard', () => ({
  useLeaveGuard: () => (callback: () => void) => callback(),
}));
vi.mock('../src/core/composition', () => ({ useServices: () => services }));
Object.assign(globalThis, { IS_REACT_ACT_ENVIRONMENT: true });

const services = {
  native: ports.native,
  refresh: ports.refresh,
  machine: {
    env: {
      id: () => '00000000-0000-4000-8000-000000000099',
      now: () => new Date().toISOString(),
    },
    repository: { records: ports.records, timeline: ports.timeline },
    saveCounter: ports.saveCounter,
    saveRecord: ports.saveRecord,
  },
};
let renderer: ReactTestRenderer | undefined;
let machineRecord = record();
let state: ReminderStatus;
const root = () => renderer!.root;
const button = (title: string) => root().findByProps({ title });
function Harness({ initial }: { initial: Reminder | null }) {
  const [reminder, setReminder] = useState(initial);
  const snapshot = useReminderStatusSnapshot();
  return createElement(ReminderEditor, {
    reminder,
    onChange: (value) => {
      ports.changed(value);
      setReminder(value);
    },
    busy: false,
    status: snapshot.status,
    refreshStatus: snapshot.refresh,
    counterId: machineRecord.counters[0]!.id,
    label: 'Presse 1',
  });
}
async function mount(initial: Reminder | null = defaultReminder()) {
  await act(async () => {
    renderer = create(createElement(Harness, { initial }));
  });
}
async function select(label: string, value: string) {
  await act(async () => root().findByProps({ label }).props.onChange(value));
}
async function press(title: string) {
  await act(async () => button(title).props.onPress());
}
const text = () =>
  root()
    .findAllByType('Body' as never)
    .map((node) => node.children.join(''))
    .join('\n');
beforeEach(() => {
  vi.resetAllMocks();
  machineRecord = record();
  state = {
    notifications: true,
    exact: false,
    doNotDisturb: false,
    availability: { normal: 'available', punctualWithSound: 'available' },
    schedules: [],
  };
  ports.native.reminderStatus.mockImplementation(async () =>
    structuredClone(state),
  );
  ports.native.openReminderSettings.mockResolvedValue(true);
  ports.native.testReminder.mockResolvedValue('posted');
  ports.timeline.mockResolvedValue([
    { measurement: { value: { digits: '125', scale: 1 }, unit: 'h' } },
  ]);
  ports.records.mockImplementation(async () => [machineRecord]);
  ports.saveCounter.mockResolvedValue([]);
});
afterEach(async () => {
  if (renderer) await act(async () => renderer!.unmount());
  renderer = undefined;
});

it('uses calendar defaults and previews anchored hours without changing old days or accepting a nonexistent DST time', () => {
  const defaults = defaultReminder(new Date(2026, 9, 31, 10, 37, 42, 500));
  expect(defaults).toMatchObject({
    interval: 'monthly',
    day: 28,
    month: 10,
    hour: 9,
    minute: 0,
  });
  expect(new Date(defaults.startsAtMillis).getHours()).toBe(11);
  expect(new Date(defaults.startsAtMillis).getMinutes()).toBe(0);
  expect(nextHourlyTrigger(1000, 1000)).toBe(3601000);
  expect(nextHourlyTrigger(1000, 7201001)).toBe(10801000);
  const previous = process.env.TZ;
  try {
    process.env.TZ = 'Europe/Berlin';
    const date = new Date(2026, 2, 29, 12);
    const time = new Date(2026, 0, 1, 2, 30);
    expect(() => hourlyStart(date, time)).toThrow('Zeitumstellung');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

it('marks missing counter fields before requesting notification permission or saving', async () => {
  machineRecord.counters[0]!.reminder = defaultReminder();
  await act(async () => {
    renderer = create(createElement(RecordEditorScreen));
  });
  await act(async () =>
    root().findByProps({ label: 'Bezeichnung *' }).props.onChangeText(''),
  );
  await act(async () =>
    root().findByProps({ label: 'Einheit *' }).props.onChange(''),
  );
  await press('Änderungen speichern');
  expect(root().findByProps({ label: 'Bezeichnung *' }).props.error).toBe(
    'Bitte eine Zählerbezeichnung eingeben.',
  );
  expect(root().findByProps({ label: 'Einheit *' }).props.error).toBe(
    'Bitte eine Einheit eingeben.',
  );
  expect(PermissionsAndroid.request).not.toHaveBeenCalled();
  expect(ports.saveCounter).not.toHaveBeenCalled();
  await act(async () =>
    root()
      .findByProps({ label: 'Bezeichnung *' })
      .props.onChangeText('Presse 2'),
  );
  expect(
    root().findByProps({ label: 'Bezeichnung *' }).props.error,
  ).toBeUndefined();
  expect(root().findByProps({ label: 'Einheit *' }).props.error).toBeDefined();
});

it('preserves day 31 and separate interval choices across disabling, enabling and calendar changes', async () => {
  await mount({ ...defaultReminder(), day: 31, hour: 8, minute: 15 });
  expect(root().findByProps({ label: 'Tag' }).props.value).toBe('31');
  await select('Intervall', 'weekly');
  await select('Wochentag', '3');
  await select('Intervall', 'monthly');
  expect(root().findByProps({ label: 'Tag' }).props.value).toBe('31');
  await select('Intervall', 'hourly');
  expect(text()).toContain('Startdatum');
  expect(text()).toContain('Startzeit');
  expect(text()).toContain('alle 60 Minuten');
  ports.pickTime.mockResolvedValue(new Date(2026, 0, 1, 14, 45));
  await press('Uhrzeit ändern');
  await select('Intervall', 'daily');
  expect(text()).toContain('08:15');
  await act(async () =>
    root()
      .findByProps({ label: 'Erinnerung aktivieren' })
      .props.onValueChange(false),
  );
  await act(async () =>
    root()
      .findByProps({ label: 'Erinnerung aktivieren' })
      .props.onValueChange(true),
  );
  expect(root().findByProps({ label: 'Intervall' }).props.value).toBe('daily');
  expect(text()).toContain('08:15');
  await select('Intervall', 'hourly');
  expect(text()).toContain('14:45');
  await select('Intervall', 'monthly');
  await select('Tag', '28');
  expect(root().findByProps({ label: 'Tag' }).props.options).toHaveLength(28);
});

it('keeps punctual mode selected after missing permission and refreshes the hints on returning from Android settings', async () => {
  await mount();
  const selectPunctual = () =>
    root()
      .findAllByType('Card' as never)
      .find(
        (node) =>
          typeof node.props.onPress === 'function' &&
          node
            .findAllByType('Body' as never)
            .some((body) => body.children.join('') === 'Pünktlich mit Ton'),
      )!;
  ports.native.openReminderSettings.mockResolvedValueOnce(false);
  await act(async () => selectPunctual().props.onPress());
  expect(ports.native.openReminderSettings).toHaveBeenCalledWith('exact', null);
  expect(text()).toContain('Für pünktliche Erinnerungen');
  expect(ports.notify).toHaveBeenCalledWith(
    expect.stringContaining('bleibt ausgewählt'),
  );
  state.exact = true;
  state.availability.punctualWithSound = 'channelBlocked';
  await act(async () => ports.active?.('active'));
  expect(text()).toContain('Diese Erinnerungsart ist ausgeschaltet');
  await press('Einstellungen öffnen');
  expect(ports.native.openReminderSettings).toHaveBeenLastCalledWith(
    'channel',
    'punctualWithSound',
  );
  state.availability.punctualWithSound = 'available';
  state.doNotDisturb = true;
  await act(async () => ports.active?.('active'));
  expect(text()).toContain('„Nicht stören“ ist aktiv');
  expect(text()).toContain('Alarmlautstärke');
  await press('Einstellungen öffnen');
  expect(ports.native.openReminderSettings).toHaveBeenLastCalledWith(
    'doNotDisturb',
    null,
  );
});

it.each([
  ['normal', false],
  ['normal', true],
  ['punctualWithSound', false],
  ['punctualWithSound', true],
] as const)(
  'opens alarm settings directly in %s mode with exact permission %s without changing the reminder',
  async (mode, exact) => {
    state.exact = exact;
    await mount({ ...defaultReminder(), deliveryMode: mode });
    const title = '„Alarme & Erinnerungen“ öffnen';
    expect(button(title).props.disabled).toBe(false);
    let resolve!: (opened: boolean) => void;
    ports.native.openReminderSettings.mockReturnValueOnce(
      new Promise((done) => {
        resolve = done;
      }),
    );
    await act(async () => {
      button(title).props.onPress();
      button(title).props.onPress();
    });
    expect(ports.native.openReminderSettings).toHaveBeenCalledOnce();
    expect(ports.native.openReminderSettings).toHaveBeenCalledWith(
      'exact',
      null,
    );
    expect(button(title).props.disabled).toBe(true);
    expect(ports.changed).not.toHaveBeenCalled();
    await act(async () => resolve(true));
    state.exact = true;
    await act(async () => ports.active?.('active'));
    expect(button(title).props.disabled).toBe(false);
    expect(ports.changed).not.toHaveBeenCalled();
    expect(ports.saveCounter).not.toHaveBeenCalled();
    expect(ports.notify).not.toHaveBeenCalled();
  },
);

it('reports unavailable alarm settings without claiming that the selected reminder mode changed', async () => {
  await mount();
  ports.native.openReminderSettings.mockResolvedValueOnce(false);
  await press('„Alarme & Erinnerungen“ öffnen');
  expect(ports.notify).toHaveBeenLastCalledWith(
    'Die Android-Einstellung „Alarme & Erinnerungen“ ist auf diesem Gerät nicht verfügbar.',
  );
  ports.native.openReminderSettings.mockRejectedValueOnce(
    new Error('Settings unavailable'),
  );
  await press('„Alarme & Erinnerungen“ öffnen');
  expect(ports.notify).toHaveBeenLastCalledWith(
    'Die Android-Einstellung „Alarme & Erinnerungen“ ist auf diesem Gerät nicht verfügbar.',
  );
  expect(ports.changed).not.toHaveBeenCalled();
});

it('serializes repeated tests, sends the right counter and latest reading, and gives eight seconds to read the success hint', async () => {
  state.doNotDisturb = true;
  await mount();
  let resolve!: (result: string) => void;
  ports.native.testReminder.mockReturnValue(
    new Promise((done) => {
      resolve = done;
    }),
  );
  await act(async () => {
    button('Erinnerung jetzt testen').props.onPress();
    button('Erinnerung jetzt testen').props.onPress();
  });
  expect(ports.native.testReminder).toHaveBeenCalledOnce();
  expect(ports.native.testReminder).toHaveBeenCalledWith({
    counterId: machineRecord.counters[0]!.id,
    label: 'Presse 1',
    latestValue: '12,5',
    latestUnit: 'h',
    deliveryMode: 'normal',
  });
  await act(async () => resolve('posted'));
  expect(ports.notify).toHaveBeenCalledWith(
    expect.stringContaining('verschwindet nach einer Minute'),
    8000,
  );
  expect(ports.notify).toHaveBeenCalledWith(
    expect.stringContaining('Ton und Banner können unterdrückt'),
    8000,
  );
  ports.native.testReminder.mockResolvedValue('channelBlocked');
  await press('Erinnerung jetzt testen');
  expect(ports.notify).toHaveBeenLastCalledWith(
    'Diese Erinnerungsart ist in Android gesperrt.',
    4000,
  );
});

it('enables repair without changing fields and reports scheduling failure separately from successfully saved data', async () => {
  machineRecord.counters[0]!.reminder = defaultReminder();
  state.schedules = [
    {
      recordId: machineRecord.counters[0]!.id,
      nextTriggerAtMillis: null,
      planningState: 'failed',
      isExact: null,
      deliveryFailed: false,
      isNotificationActive: false,
      lastTriggeredAtMillis: null,
    },
  ];
  await act(async () => {
    renderer = create(createElement(RecordEditorScreen));
  });
  expect(button('Erinnerung erneut speichern').props.disabled).toBe(false);
  await press('Erinnerung erneut speichern');
  expect(ports.saveCounter).toHaveBeenCalledWith(
    machineRecord.id,
    machineRecord.counters[0]!.id,
    expect.objectContaining({ reminder: machineRecord.counters[0]!.reminder }),
  );
  expect(ports.dismiss).toHaveBeenCalledWith({
    pathname: '/record/[id]',
    params: { id: machineRecord.id, counterId: machineRecord.counters[0]!.id },
  });
  expect(ports.notify).toHaveBeenLastCalledWith(
    expect.stringContaining(
      'Daten gespeichert. Die Erinnerung konnte nicht bestätigt',
    ),
  );
  expect(
    reminderPresentation(
      machineRecord.counters[0]!.reminder,
      undefined,
      machineRecord.counters[0]!.id,
    )?.title,
  ).toBe('Planungsstatus unbekannt');
  state.schedules[0]!.planningState = 'cancelFailed';
  expect(
    reminderPresentation(null, state, machineRecord.counters[0]!.id)?.action,
  ).toBe('edit');
  expect(
    reminderSaveWarning(null, state, machineRecord.counters[0]!.id),
  ).toContain('nicht ausgeschaltet');
});

it('opens the appropriate status settings and routes planning repair to the selected counter editor', async () => {
  const onEdit = vi.fn();
  const counterId = machineRecord.counters[0]!.id;
  state.availability.normal = 'appBlocked';
  await act(async () => {
    renderer = create(
      createElement(ReminderScheduleStatus, {
        reminder: defaultReminder(),
        status: state,
        counterId,
        onEdit,
      }),
    );
  });
  ports.native.openReminderSettings.mockResolvedValueOnce(false);
  await press('Einstellungen öffnen');
  expect(ports.native.openReminderSettings).toHaveBeenCalledWith(
    'notifications',
    null,
  );
  expect(ports.notify).toHaveBeenLastCalledWith(
    expect.stringContaining('Apps'),
  );
  state.availability.normal = 'available';
  state.schedules = [
    {
      recordId: counterId,
      nextTriggerAtMillis: null,
      planningState: 'failed',
      isExact: null,
      deliveryFailed: false,
      isNotificationActive: false,
      lastTriggeredAtMillis: null,
    },
  ];
  await act(async () =>
    renderer!.update(
      createElement(ReminderScheduleStatus, {
        reminder: defaultReminder(),
        status: state,
        counterId,
        onEdit,
      }),
    ),
  );
  await press('Erinnerung bearbeiten');
  expect(onEdit).toHaveBeenCalledOnce();
});
