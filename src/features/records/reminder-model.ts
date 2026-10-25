import { t, LocalizedError } from '../../core/localization/runtime';
import type { Reminder } from '../../core/domain/models';
import type {
  ReminderStatus,
  ReminderScheduleStatus,
  ReminderTestResult,
  ReminderSettingsTarget,
} from '../../core/native/machine-native';
import { dateTime } from './presentation-model';
export const reminderIntervals = {
  get hourly() {
    return t('hourly');
  },
  get daily() {
    return t('daily');
  },
  get weekly() {
    return t('weekly');
  },
  get monthly() {
    return t('monthly');
  },
  get yearly() {
    return t('annually');
  },
};
export const weekdays = () => [
  t('monday'),
  t('tuesday'),
  t('wednesday'),
  t('thursday'),
  t('friday'),
  t('saturday'),
  t('sunday'),
];
export const reminderModes = {
  normal: {
    get title() {
      return t('normalReminder');
    },
    get description() {
      return t('mayAppearSlightlyDelayedTheDoNotDisturbSystemSettingIsHonored');
    },
    icon: 'notifications_outlined' as const,
  },
  punctualWithSound: {
    get title() {
      return t('onTimeWithSound');
    },
    get description() {
      return t('isTriggeredLikeAnAlarmAsPreciselyAsPossibleAtTheSelectedTime');
    },
    icon: 'alarm_outlined' as const,
  },
};
export const testReminderHint = () =>
  t('pullDownTheNotificationBarTheTestReminderDisappearsAfterOneMinute');
export function defaultReminder(now = new Date()): Reminder {
  return {
    interval: 'monthly',
    day: Math.min(now.getDate(), 28),
    month: now.getMonth() + 1,
    hour: 9,
    minute: 0,
    deliveryMode: 'normal',
    startsAtMillis:
      now.getTime() -
      now.getMinutes() * 60000 -
      now.getSeconds() * 1000 -
      now.getMilliseconds() +
      3600000,
  };
}
export function nextHourlyTrigger(start: number, now = Date.now()): number {
  return start > now
    ? start
    : start + (Math.floor((now - start) / 3600000) + 1) * 3600000;
}
export function hourlyStart(date: Date, time: Date): number {
  const value = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    time.getHours(),
    time.getMinutes(),
  );
  if (
    value.getHours() !== time.getHours() ||
    value.getMinutes() !== time.getMinutes() ||
    value.getDate() !== date.getDate()
  )
    throw new LocalizedError(
      'thisTimeIsNotAvailableDueToTheTimeChangePleaseChooseADifferentTime',
    );
  return value.getTime();
}
export function reminderAvailability(
  status: ReminderStatus | undefined,
  mode: Reminder['deliveryMode'],
) {
  return (
    status?.availability?.[mode] ??
    (status?.notifications === false ? 'appBlocked' : 'unknown')
  );
}
export function reminderSchedule(
  status: ReminderStatus | undefined,
  counterId: string,
) {
  return status?.schedules.find((schedule) => schedule.recordId === counterId);
}
export function needsReminderRepair(
  reminder: Reminder | null,
  schedule: ReminderScheduleStatus | undefined,
): boolean {
  return (
    schedule?.planningState === 'cancelFailed' ||
    (!!reminder &&
      (schedule?.planningState !== 'scheduled' ||
        schedule.nextTriggerAtMillis === null ||
        (reminder.deliveryMode === 'punctualWithSound' &&
          schedule.isExact !== true)))
  );
}
export function reminderSaveWarning(
  reminder: Reminder | null,
  status: ReminderStatus | undefined,
  counterId: string,
): string | null {
  const schedule = reminderSchedule(status, counterId);
  if (schedule?.planningState === 'cancelFailed')
    return t(
      'dataSavedTheReminderCouldNotBeTurnedOffOpenTheReminderAndSaveAgain',
    );
  if (!reminder)
    return status
      ? null
      : t(
          'dataSavedTheReminderStatusCouldNotBeCheckedOpenTheReminderAndSaveAgain',
        );
  const availability = reminderAvailability(status, reminder.deliveryMode);
  if (availability === 'appBlocked' || availability === 'channelBlocked')
    return t(
      'dataSavedRemindersAreBlockedInAndroidOpenTheReminderAndThenAndroidSettings',
    );
  if (!status || availability === 'unknown')
    return t(
      'dataSavedTheReminderStatusCouldNotBeCheckedOpenTheReminderAndSaveAgain',
    );
  if (
    schedule?.planningState !== 'scheduled' ||
    schedule.nextTriggerAtMillis === null
  )
    return t(
      'dataSavedTheReminderCouldNotBeConfirmedOpenTheReminderAndSaveAgain',
    );
  if (
    reminder.deliveryMode === 'punctualWithSound' &&
    (!status.exact || schedule.isExact !== true)
  )
    return t(
      'dataSavedForAnOnTimeReminderOpenAlarmsRemindersInAndroidSettings',
    );
  return null;
}
export function reminderTestMessage(
  result: ReminderTestResult,
  quiet: boolean | null | undefined,
): string {
  if (result === 'posted')
    return (
      t('testErinnerungWurdeAnAndroidUebergeben') +
      testReminderHint() +
      (quiet === true
        ? t('doNotDisturbIsActiveSoundAndBannersCanBeSuppressed')
        : '')
    );
  if (result === 'appBlocked') return t('notificationsAreNotAllowed');
  if (result === 'channelBlocked')
    return t('thisReminderTypeIsBlockedInAndroid');
  return t('testReminderCouldNotBeDisplayed');
}
export function reminderSettingsFailure(
  target: ReminderSettingsTarget,
): string {
  if (target === 'exact')
    return t('theAndroidAlarmsRemindersSettingIsNotAvailableOnThisDevice');
  if (target === 'doNotDisturb')
    return t(
      'systemPreferencesCouldNotBeOpenedYouCanFindDoNotDisturbInYourSmartphoneSSettings',
    );
  return t(
    'dieEinstellungenKonntenNichtGeoeffnetWerdenOffneInDenEinstellungenDeinesSmartphonesAppsDannMasc',
  );
}
export type ReminderPresentation = {
  title: string;
  description: string;
  error: boolean;
  action: 'edit' | ReminderSettingsTarget | null;
};
export function reminderPresentation(
  reminder: Reminder | null,
  status: ReminderStatus | undefined,
  counterId: string,
  now = Date.now(),
): ReminderPresentation | null {
  const schedule = reminderSchedule(status, counterId);
  if (schedule?.planningState === 'cancelFailed')
    return {
      title: t('couldNotTurnOffReminder'),
      description: t('pleaseOpenTheReminderAndSaveAgain'),
      error: true,
      action: 'edit',
    };
  if (!reminder) return null;
  const availability = reminderAvailability(status, reminder.deliveryMode);
  if (availability === 'appBlocked' || availability === 'channelBlocked')
    return {
      title: t('reminderBlocked'),
      description:
        availability === 'appBlocked'
          ? t('notificationsAreTurnedOff125')
          : t('thisReminderTypeIsSwitchedOff'),
      error: true,
      action: availability === 'appBlocked' ? 'notifications' : 'channel',
    };
  if (
    schedule?.planningState === 'failed' ||
    schedule?.planningState === 'none'
  )
    return {
      title: t('reminderNotScheduled'),
      description: t('pleaseOpenTheReminderAndSaveAgain'),
      error: true,
      action: 'edit',
    };
  if (reminder.deliveryMode === 'punctualWithSound' && status?.exact === false)
    return {
      title: t('exactAlarmsNotAllowed'),
      description: t(
        'allowAlarmsRemindersInAndroidUntilThenRemindersMayArriveLate',
      ),
      error: true,
      action: 'exact',
    };
  if (
    reminder.deliveryMode === 'punctualWithSound' &&
    status?.exact === true &&
    schedule?.isExact === false
  )
    return {
      title: t('exactSchedulingPending'),
      description: t(
        'thisReminderIsNotScheduledAsAnExactAlarmYetOpenTheReminderAndSaveAgain',
      ),
      error: false,
      action: 'edit',
    };
  if (schedule?.deliveryFailed)
    return {
      title: t('lastDeliveryFailed'),
      description: t('openTheReminderAndSelectTestReminderNow'),
      error: true,
      action: 'edit',
    };
  if (
    schedule?.planningState !== 'scheduled' ||
    schedule.nextTriggerAtMillis === null ||
    availability !== 'available' ||
    (reminder.deliveryMode === 'punctualWithSound' &&
      (!status || schedule.isExact === null))
  )
    return {
      title: t('schedulingStatusUnknown'),
      description: t(
        'theReminderStatusCouldNotBeConfirmedOpenTheReminderToReview',
      ),
      error: false,
      action: 'edit',
    };
  const due = schedule.nextTriggerAtMillis <= now;
  return {
    title: due ? t('reminderPending') : t('nextReminder'),
    description:
      dateTime(schedule.nextTriggerAtMillis) +
      t('uhr') +
      (due ? t('reminderNotProcessed') : ''),
    error: false,
    action: null,
  };
}
