import { t, localization } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
import { Platform, View } from 'react-native';
import {
  Body,
  Button,
  Card,
  MaterialSwitch,
  Notice,
  SelectField,
  useTheme,
} from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import { useMaterialDateTime } from '../../core/ui/material-date-time';
import type { Reminder } from '../../core/domain/models';
import type { MachineIconId } from '../../core/domain/machine-icon';
import type { ReminderStatus } from '../../core/native/machine-native';
import { useReminderEditor } from './use-reminder-editor';
import {
  reminderIntervals,
  weekdays,
  reminderModes,
  reminderAvailability,
  nextHourlyTrigger,
  testReminderHint,
} from './reminder-model';
import { dateTime } from './presentation-model';
export function ReminderEditor(props: {
  reminder: Reminder | null;
  busy: boolean;
  onChange(value: Reminder | null): void;
  status?: ReminderStatus;
  refreshStatus(): Promise<ReminderStatus | undefined>;
  counterId: string | null;
  label: string;
  icon?: MachineIconId;
}) {
  useLocalization();
  const { reminder, status } = props;
  const c = useTheme(),
    picker = useMaterialDateTime(),
    vm = useReminderEditor(props);
  const availability = reminder
    ? reminderAvailability(status, reminder.deliveryMode)
    : 'unknown';
  const start = new Date(reminder?.startsAtMillis ?? 0);
  const timeText = (date: Date) =>
    date.toLocaleTimeString(localization().formatLocale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  async function pickDate() {
    const date = await picker.date(start);
    if (date) vm.setHourlyStart(date, start);
  }
  async function pickTime() {
    const current = reminder!.interval === 'hourly' ? start : new Date();
    if (reminder!.interval !== 'hourly')
      current.setHours(reminder!.hour, reminder!.minute, 0, 0);
    const time = await picker.time(current);
    if (time) {
      if (reminder!.interval === 'hourly') vm.setHourlyStart(start, time);
      else vm.patch({ hour: time.getHours(), minute: time.getMinutes() });
    }
  }
  return (
    <>
      {picker.dialog}
      <Card>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1, gap: 4 }}>
            <Body style={{ fontSize: 16 }}>{t('readingReminder')}</Body>
            <Body muted>{t('optionalAndOnlyLocallyOnThisDevice')}</Body>
          </View>
          <MaterialSwitch
            label={t('erinnerungAktivieren')}
            value={!!reminder}
            disabled={vm.disabled}
            onValueChange={vm.toggle}
          />
        </View>
        {reminder && (
          <View style={{ gap: 16 }}>
            <View style={{ height: 1, backgroundColor: c.border }} />
            <SelectField
              label={t('interval')}
              value={reminder.interval}
              disabled={vm.disabled}
              options={Object.entries(reminderIntervals).map(
                ([value, label]) => ({ value, label }),
              )}
              onChange={(value) => vm.interval(value as Reminder['interval'])}
            />
            {reminder.interval === 'yearly' && (
              <SelectField
                label={t('month')}
                value={String(reminder.month)}
                disabled={vm.disabled}
                options={Array.from({ length: 12 }, (_, i) => String(i + 1))}
                onChange={(value) => vm.patch({ month: Number(value) })}
              />
            )}
            {reminder.interval === 'weekly' && (
              <SelectField
                label={t('dayOfTheWeek')}
                value={String(reminder.day)}
                disabled={vm.disabled}
                options={weekdays().map((label, i) => ({
                  label,
                  value: String(i + 1),
                }))}
                onChange={(value) => vm.patch({ day: Number(value) })}
              />
            )}
            {(reminder.interval === 'monthly' ||
              reminder.interval === 'yearly') && (
              <SelectField
                label={t('day')}
                value={String(reminder.day)}
                disabled={vm.disabled}
                options={[
                  ...Array.from({ length: 28 }, (_, i) => i + 1),
                  ...(reminder.day > 28 ? [reminder.day] : []),
                ].map((day) => ({ value: String(day), label: day + '.' }))}
                onChange={(value) => vm.patch({ day: Number(value) })}
              />
            )}
            {reminder.interval === 'hourly' ? (
              <>
                <View style={{ gap: 4 }}>
                  <Body strong>{t('startDate')}</Body>
                  <Body>
                    {start.toLocaleDateString(localization().formatLocale)}
                  </Body>
                </View>
                <Button
                  secondary
                  icon="calendar_month_outlined"
                  title={t('changeDate')}
                  disabled={vm.disabled}
                  onPress={() => void pickDate()}
                />
                <View style={{ gap: 4 }}>
                  <Body strong>{t('startTime')}</Body>
                  <Body>{timeText(start)}</Body>
                </View>
                <Button
                  secondary
                  icon="schedule"
                  title={t('changeTime')}
                  disabled={vm.disabled}
                  onPress={() => void pickTime()}
                />
                <Body muted>
                  {t('abDemGewaehltenStartAlle60MinutenNaechsteErinnerung') +
                    dateTime(nextHourlyTrigger(reminder.startsAtMillis)) +
                    t('uhr10')}
                </Body>
              </>
            ) : (
              <>
                <View style={{ gap: 4 }}>
                  <Body strong>{t('time')}</Body>
                  <Body>
                    {String(reminder.hour).padStart(2, '0') +
                      ':' +
                      String(reminder.minute).padStart(2, '0')}
                  </Body>
                </View>
                <Button
                  secondary
                  icon="schedule"
                  title={t('changeTime')}
                  disabled={vm.disabled}
                  onPress={() => void pickTime()}
                />
              </>
            )}
            <Body strong>{t('typeOfReminder')}</Body>
            {(['normal', 'punctualWithSound'] as const).map((mode) => (
              <Card
                key={mode}
                onPress={
                  vm.disabled ? undefined : () => void vm.selectMode(mode)
                }
                style={{
                  borderColor:
                    reminder.deliveryMode === mode ? c.primary : c.border,
                }}
              >
                <View
                  style={{
                    flexDirection: 'row',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <Icon name={reminderModes[mode].icon} color={c.primary} />
                  <View style={{ flex: 1, gap: 4 }}>
                    <Body strong>{reminderModes[mode].title}</Body>
                    <Body muted>{reminderModes[mode].description}</Body>
                  </View>
                  <Icon
                    name={
                      reminder.deliveryMode === mode
                        ? 'check_circle_outline'
                        : 'radio_button_unchecked'
                    }
                    color={reminder.deliveryMode === mode ? c.primary : c.muted}
                  />
                </View>
              </Card>
            ))}
            {reminder.deliveryMode === 'punctualWithSound' &&
              status?.exact === false && (
                <Card style={{ backgroundColor: c.errorContainer }}>
                  <Body>
                    {t(
                      'forOnTimeRemindersAllowAlarmsRemindersInAndroidEnableThisPermissionSoRemindersCanSoundAtTheSele',
                    )}
                  </Body>
                  <Button
                    secondary
                    icon="settings_outlined"
                    title={t('allowAlarmsReminders')}
                    disabled={vm.disabled}
                    onPress={() => void vm.selectMode('punctualWithSound')}
                  />
                </Card>
              )}
            {Platform.OS === 'android' && (
              <Button
                secondary
                icon="open_in_new"
                title={t('openAlarmsReminders')}
                disabled={vm.disabled}
                onPress={() => void vm.open('exact')}
              />
            )}
            {availability === 'appBlocked' ||
            availability === 'channelBlocked' ? (
              <Card style={{ backgroundColor: c.errorContainer }}>
                <Body strong>
                  {availability === 'appBlocked'
                    ? t('notificationsAreTurnedOff')
                    : t('thisTypeOfReminderIsSwitchedOff')}
                </Body>
                <Body>
                  {availability === 'appBlocked'
                    ? t(
                        'erlaubeBenachrichtigungenFuerMaschinenlogInDenAndroidEinstellungenDamitErinnerungenAngezeigtWer',
                      )
                    : t('aktiviereDieBenachrichtigungskategorieFuer') +
                      reminderModes[reminder.deliveryMode].title +
                      t('inDenAndroidEinstellungen')}
                </Body>
                <Button
                  secondary
                  icon="settings_outlined"
                  title={t('openSettings')}
                  disabled={vm.disabled}
                  onPress={() =>
                    void vm.open(
                      availability === 'appBlocked'
                        ? 'notifications'
                        : 'channel',
                    )
                  }
                />
              </Card>
            ) : (
              status?.doNotDisturb === true && (
                <Card>
                  <Body strong>{t('doNotDisturbIsActive')}</Body>
                  <Body>
                    {reminder.deliveryMode === 'normal'
                      ? t(
                          'normalRemindersMayAppearWithNoSoundOrBannerDisplayed',
                        )
                      : t(
                          'whetherAnAlarmSoundOrBannerAppearsDependsOnYourDoNotDisturbSettingsAndAlarmVolume',
                        )}
                  </Body>
                  <Button
                    secondary
                    icon="settings_outlined"
                    title={t('openSettings')}
                    disabled={vm.disabled}
                    onPress={() => void vm.open('doNotDisturb')}
                  />
                </Card>
              )
            )}
            {availability === 'unknown' && (
              <Notice
                text={t(
                  'derErinnerungsstatusKonnteNichtBestaetigtWerdenDuKannstDieDatenTrotzdemSpeichern',
                )}
              />
            )}
            <Button
              secondary
              icon="notifications_active_outlined"
              title={
                vm.action === 'test'
                  ? t('testErinnerungWirdGesendet')
                  : t('testReminderNow')
              }
              disabled={vm.disabled}
              onPress={() => void vm.test()}
            />
            <Body>{testReminderHint()}</Body>
          </View>
        )}
      </Card>
    </>
  );
}
