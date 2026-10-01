import { View } from 'react-native';
import {
  Body,
  Button,
  Card,
  DateField,
  MaterialSwitch,
  Notice,
  SelectField,
  useTheme,
} from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import { useMaterialDateTime } from '../../core/ui/material-date-time';
import type { Reminder } from '../../core/domain/models';
import { useServices } from '../../core/composition';
import { useFeedback } from '../../core/ui/feedback';
import { useReminderStatus } from './use-records';
const intervals = {
  hourly: 'Stündlich',
  daily: 'Täglich',
  weekly: 'Wöchentlich',
  monthly: 'Monatlich',
  yearly: 'Jährlich',
};
const weekdays = [
  'Montag',
  'Dienstag',
  'Mittwoch',
  'Donnerstag',
  'Freitag',
  'Samstag',
  'Sonntag',
];
export function ReminderEditor({
  reminder,
  busy,
  onChange,
}: {
  reminder: Reminder | null;
  busy: boolean;
  onChange(value: Reminder | null): void;
}) {
  const c = useTheme(),
    picker = useMaterialDateTime(),
    status = useReminderStatus();
  const { native } = useServices();
  const feedback = useFeedback();
  const patch = (value: Partial<Reminder>) => {
    if (reminder) onChange({ ...reminder, ...value });
  };
  const toggle = (enabled: boolean) =>
    onChange(
      enabled
        ? {
            interval: 'monthly',
            day: 1,
            month: 1,
            hour: 9,
            minute: 0,
            deliveryMode: 'normal',
            startsAtMillis: Date.now() + 3600000,
          }
        : null,
    );
  const time = reminder
    ? `${String(reminder.hour).padStart(2, '0')}:${String(reminder.minute).padStart(2, '0')} Uhr`
    : '';
  async function pickTime() {
    const date = new Date();
    date.setHours(reminder!.hour, reminder!.minute);
    const value = await picker.time(date);
    if (value) patch({ hour: value.getHours(), minute: value.getMinutes() });
  }
  async function test(punctual: boolean) {
    try {
      feedback.notify(
        (await native.testReminder(punctual)) === 'posted'
          ? 'Test-Erinnerung gesendet.'
          : 'Benachrichtigungen sind in Android blockiert.',
      );
    } catch {
      feedback.notify('Die Test-Erinnerung konnte nicht gesendet werden.');
    }
  }
  async function openSettings(exact: boolean) {
    try {
      await native.openReminderSettings(exact);
    } catch {
      feedback.notify('Android-Einstellungen konnten nicht geöffnet werden.');
    }
  }
  return (
    <>
      {picker.dialog}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Body style={{ fontSize: 16 }}>Ableseerinnerung</Body>
            <Body muted>Optional und nur lokal auf diesem Gerät</Body>
          </View>
          <MaterialSwitch
            label="Erinnerung aktivieren"
            value={!!reminder}
            disabled={busy}
            onValueChange={toggle}
          />
        </View>
        {reminder && (
          <View style={{ gap: 16 }}>
            <SelectField
              label="Intervall"
              value={reminder.interval}
              options={Object.entries(intervals).map(([value, label]) => ({
                value,
                label,
              }))}
              disabled={busy}
              onChange={(value) =>
                patch({
                  interval: value as Reminder['interval'],
                  day:
                    value === 'weekly'
                      ? Math.min(reminder.day, 7)
                      : reminder.day,
                })
              }
            />
            {reminder.interval === 'yearly' && (
              <SelectField
                label="Monat"
                value={String(reminder.month)}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: String(i + 1),
                  label: new Date(2026, i, 1).toLocaleString('de-DE', {
                    month: 'long',
                  }),
                }))}
                onChange={(v) => patch({ month: Number(v) })}
              />
            )}
            {reminder.interval === 'weekly' && (
              <SelectField
                label="Wochentag"
                value={String(reminder.day)}
                options={weekdays.map((label, i) => ({
                  label,
                  value: String(i + 1),
                }))}
                onChange={(v) => patch({ day: Number(v) })}
              />
            )}
            {(reminder.interval === 'monthly' ||
              reminder.interval === 'yearly') && (
              <SelectField
                label="Tag"
                value={String(reminder.day)}
                options={Array.from({ length: 31 }, (_, i) => String(i + 1))}
                onChange={(v) => patch({ day: Number(v) })}
              />
            )}
            {reminder.interval === 'hourly' ? (
              <DateField
                label="Erster Termin"
                time
                value={new Date(reminder.startsAtMillis).toISOString()}
                onChange={(v) =>
                  patch({ startsAtMillis: new Date(v).getTime() })
                }
              />
            ) : (
              <View style={{ gap: 8 }}>
                <Body>Uhrzeit: {time}</Body>
                <Button
                  secondary
                  icon="schedule"
                  title="Uhrzeit ändern"
                  onPress={() => void pickTime()}
                />
              </View>
            )}
            {(['normal', 'punctualWithSound'] as const).map((mode) => (
              <Card
                key={mode}
                onPress={() => patch({ deliveryMode: mode })}
                style={{
                  borderColor:
                    reminder.deliveryMode === mode ? c.primary : c.border,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 10,
                    alignItems: 'center',
                  }}
                >
                  <Icon
                    name={
                      reminder.deliveryMode === mode
                        ? 'check_circle_outline'
                        : 'notifications_active_outlined'
                    }
                    color={c.primary}
                  />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body strong>
                      {mode === 'normal'
                        ? 'Normale Erinnerung'
                        : 'Pünktlich mit Ton'}
                    </Body>
                    <Body muted>
                      {mode === 'normal'
                        ? 'Android kann die Erinnerung etwas später anzeigen.'
                        : 'Benötigt die Freigabe für genaue Alarme. Android-Einstellungen können den Ton beeinflussen.'}
                    </Body>
                  </View>
                </View>
              </Card>
            ))}
            {status && !status.notifications && (
              <>
                <Notice
                  error
                  text="Benachrichtigungen sind in Android blockiert."
                />
                <Button
                  secondary
                  title="Benachrichtigungen erlauben"
                  onPress={() => void openSettings(false)}
                />
              </>
            )}
            {reminder.deliveryMode === 'punctualWithSound' &&
              status &&
              !status.exact && (
                <>
                  <Notice text="Ohne Freigabe für genaue Alarme erinnert Android möglicherweise später." />
                  <Button
                    secondary
                    title="Alarme & Erinnerungen erlauben"
                    onPress={() => void openSettings(true)}
                  />
                </>
              )}
            <Button
              secondary
              icon="notifications_active_outlined"
              title="Erinnerung testen"
              disabled={busy}
              onPress={() =>
                void test(reminder.deliveryMode === 'punctualWithSound')
              }
            />
          </View>
        )}
      </Card>
    </>
  );
}
