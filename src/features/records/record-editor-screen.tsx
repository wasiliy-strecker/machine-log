import { presetLabel, presetValue } from '../../core/localization/presets';
import { t } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Body,
  Button,
  Busy,
  Field,
  Notice,
  Page,
} from '../../core/ui/components';
import { SuggestionField } from '../../core/ui/suggestion-field';
import { units } from '../../core/domain/models';
import { counterTypeLabel } from '../../core/domain/counter-type';
import { ReminderEditor } from './reminder-editor';
import { useRecordEditor } from './use-record-editor';
import { FormErrorTarget } from '../../core/ui/form-error-target';
import { MachineIconPicker } from './machine-icon-picker';
export function RecordEditorScreen() {
  useLocalization();
  const { id, counterId } = useLocalSearchParams<{
    id?: string;
    counterId?: string;
  }>();
  const vm = useRecordEditor(id, counterId);
  const form = vm.form;
  const firstError = [
    'type',
    'name',
    'number',
    'location',
    'unit',
    'reminder',
  ].find((field) => vm.fieldErrors[field]);
  if (!form)
    return (
      <Page ready={!!vm.error}>
        {!!vm.error && (
          <FormErrorTarget active attempt={vm.errorAttempt}>
            <Notice error text={vm.error} />
          </FormErrorTarget>
        )}
        {!vm.error && <Busy />}
      </Page>
    );
  return (
    <Page
      bottom={
        <>
          {!id && (
            <Body muted style={{ fontSize: 12 }}>
              {t(
                'speichereZuerstDenZaehlerAnschliessendKannstDuDenErstenStandFotografierenOderOhneFotoErfassen',
              )}
            </Body>
          )}
          {vm.reminderNeedsRepair && (
            <Body>
              {t('theReminderIsNotConfirmedWithSaveItWillBeSetUpAgain')}
            </Body>
          )}
          <Button
            icon={id && !vm.dirty ? 'check_circle_outline' : 'save_outlined'}
            title={
              vm.busy
                ? t('saving')
                : id && !vm.dirty && !vm.reminderNeedsRepair
                  ? t('everythingSaved')
                  : vm.reminderNeedsRepair && !vm.dirty
                    ? t('saveReminderAgain')
                    : id
                      ? t('saveChanges')
                      : t('saveMeter')
            }
            disabled={vm.busy || (!vm.dirty && !vm.reminderNeedsRepair)}
            onPress={() => void vm.save()}
          />
        </>
      }
    >
      <Stack.Screen options={{ title: id ? t('editMeter') : t('addMeter') }} />
      <View style={{ gap: 16 }}>
        {!!vm.error && (
          <FormErrorTarget active attempt={vm.errorAttempt}>
            <Notice error text={vm.error} />
          </FormErrorTarget>
        )}
        <FormErrorTarget
          active={firstError === 'type'}
          attempt={vm.errorAttempt}
          style={{ zIndex: 2 }}
        >
          <SuggestionField
            label={t('zaehlerart')}
            placeholder={t('zBStueckzahlOderChargen')}
            helper={t(
              'vorschlagAuswaehlenOderEigeneZaehlerartEingebenDiePassendeEinheitKannstDuUntenFestlegen',
            )}
            value={counterTypeLabel(form.type)}
            suggestions={vm.typeSuggestions.map(counterTypeLabel)}
            onChange={vm.changeType}
            disabled={vm.busy}
            showAllOnFocus
            error={vm.fieldErrors.type}
          />
        </FormErrorTarget>
        <MachineIconPicker
          value={form.icon}
          disabled={vm.busy}
          onChange={(value) => vm.change('icon', value)}
        />
        <FormErrorTarget
          active={firstError === 'name'}
          attempt={vm.errorAttempt}
        >
          <Field
            label={t('name')}
            error={vm.fieldErrors.name}
            placeholder={t('zBMontagelinie1')}
            value={form.name}
            onChangeText={(value) => vm.change('name', value)}
            editable={!vm.busy}
          />
        </FormErrorTarget>
        <FormErrorTarget
          active={firstError === 'number'}
          attempt={vm.errorAttempt}
        >
          <Field
            label={t('maschinenZaehlernummerOptional')}
            error={vm.fieldErrors.number}
            value={form.number}
            onChangeText={(value) => vm.change('number', value)}
            editable={!vm.busy}
          />
        </FormErrorTarget>
        <FormErrorTarget
          active={firstError === 'location'}
          attempt={vm.errorAttempt}
        >
          <Field
            label={t('produktionsbereichOptional')}
            error={vm.fieldErrors.location}
            placeholder={t('zBHalle2')}
            value={form.location}
            onChangeText={(value) => vm.change('location', value)}
            editable={!vm.busy}
          />
        </FormErrorTarget>
        <FormErrorTarget
          active={firstError === 'unit'}
          attempt={vm.errorAttempt}
          style={{ zIndex: 1 }}
        >
          <SuggestionField
            label={t('unit')}
            error={vm.fieldErrors.unit}
            value={presetLabel(form.unit)}
            suggestions={units.map((value) => presetLabel(value))}
            disabled={vm.busy}
            showAllOnFocus
            helper={t(
              'vorschlagAuswaehlenOderEigeneEinheitEingebenFruehereAblesungenBehaltenIhreEinheit',
            )}
            onChange={(value) => vm.change('unit', presetValue(value))}
          />
        </FormErrorTarget>
        <FormErrorTarget
          active={firstError === 'reminder'}
          attempt={vm.errorAttempt}
        >
          <ReminderEditor
            reminder={form.reminder}
            busy={vm.busy}
            onChange={(value) => vm.change('reminder', value)}
            counterId={id ? vm.counterId : null}
            label={form.name || counterTypeLabel(form.type)}
            icon={form.icon}
            status={vm.reminderStatus}
            refreshStatus={vm.refreshReminderStatus}
          />
          <Notice error text={vm.fieldErrors.reminder} />
        </FormErrorTarget>
      </View>
    </Page>
  );
}
