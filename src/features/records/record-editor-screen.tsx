import { View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Body,
  Button,
  Busy,
  Field,
  Notice,
  Page,
  SelectField,
} from '../../core/ui/components';
import { SuggestionField } from '../../core/ui/suggestion-field';
import {
  type Counter,
  counterTypes,
  defaultUnits,
  units,
} from '../../core/domain/models';
import { ReminderEditor } from './reminder-editor';
import { useRecordEditor } from './use-record-editor';
import { FormErrorTarget } from '../../core/ui/form-error-target';

export function RecordEditorScreen() {
  const { id, counterId } = useLocalSearchParams<{
    id?: string;
    counterId?: string;
  }>();
  const vm = useRecordEditor(id, counterId);
  const form = vm.form;
  const firstError = ['name', 'number', 'location', 'unit', 'reminder'].find(
    (field) => vm.fieldErrors[field],
  );
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
              Speichere zuerst den Zähler. Anschließend kannst du den ersten
              Stand fotografieren oder ohne Foto erfassen.
            </Body>
          )}
          {vm.reminderNeedsRepair && (
            <Body>
              Die Erinnerung ist nicht bestätigt. Mit Speichern wird sie erneut
              eingerichtet.
            </Body>
          )}
          <Button
            icon={id && !vm.dirty ? 'check_circle_outline' : 'save_outlined'}
            title={
              vm.busy
                ? 'Wird gespeichert …'
                : id && !vm.dirty && !vm.reminderNeedsRepair
                  ? 'Alles gespeichert'
                  : vm.reminderNeedsRepair && !vm.dirty
                    ? 'Erinnerung erneut speichern'
                    : id
                      ? 'Änderungen speichern'
                      : 'Zähler speichern'
            }
            disabled={vm.busy || (!vm.dirty && !vm.reminderNeedsRepair)}
            onPress={() => void vm.save()}
          />
        </>
      }
    >
      <Stack.Screen
        options={{ title: id ? 'Zähler bearbeiten' : 'Zähler anlegen' }}
      />
      <View style={{ gap: 16 }}>
        {!!vm.error && (
          <FormErrorTarget active attempt={vm.errorAttempt}>
            <Notice error text={vm.error} />
          </FormErrorTarget>
        )}
        <SelectField
          label="Zählerart"
          value={form.type}
          disabled={vm.busy}
          options={Object.entries(counterTypes).map(([value, label]) => ({
            value,
            label,
          }))}
          onChange={(value) => {
            const type = value as Counter['type'];
            vm.change('type', type);
            vm.change('unit', defaultUnits[type]);
          }}
        />
        <FormErrorTarget
          active={firstError === 'name'}
          attempt={vm.errorAttempt}
        >
          <Field
            label="Bezeichnung *"
            error={vm.fieldErrors.name}
            placeholder="z. B. Montagelinie 1"
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
            label="Maschinen-/Zählernummer (optional)"
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
            label="Produktionsbereich (optional)"
            error={vm.fieldErrors.location}
            placeholder="z. B. Halle 2"
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
            label="Einheit *"
            error={vm.fieldErrors.unit}
            value={form.unit}
            suggestions={units}
            disabled={vm.busy}
            showAllOnFocus
            helper="Vorschlag auswählen oder eigene Einheit eingeben. Frühere Ablesungen behalten ihre Einheit."
            onChange={(value) => vm.change('unit', value)}
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
            label={form.name || counterTypes[form.type]}
            status={vm.reminderStatus}
            refreshStatus={vm.refreshReminderStatus}
          />
          <Notice error text={vm.fieldErrors.reminder} />
        </FormErrorTarget>
      </View>
    </Page>
  );
}
