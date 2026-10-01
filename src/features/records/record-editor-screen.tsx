import { Pressable, View } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import {
  Body,
  Button,
  Busy,
  Card,
  DateField,
  Field,
  Notice,
  Page,
  SelectField,
  useTheme,
} from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import { SuggestionField } from '../../core/ui/suggestion-field';
import {
  type Counter,
  counterTypes,
  defaultUnits,
  units,
} from '../../core/domain/models';
import { ReminderEditor } from './reminder-editor';
import { useRecordEditor } from './use-record-editor';
export function RecordEditorScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const vm = useRecordEditor(id),
    c = useTheme();
  const r = vm.record;
  if (!r)
    return (
      <Page ready={!!vm.error}>
        <Notice error text={vm.error} />
        {!vm.error && <Busy />}
      </Page>
    );
  return (
    <Page
      bottom={
        <>
          {!id && (
            <Body muted style={{ fontSize: 12 }}>
              Speichere zuerst die Maschine. Anschließend kannst du den ersten
              Eintrag mit oder ohne Fotos und Dokumente erfassen.
            </Body>
          )}
          <Button
            icon={id && !vm.dirty ? 'check_circle_outline' : 'save_outlined'}
            title={
              vm.busy
                ? 'Wird gespeichert …'
                : id && !vm.dirty
                  ? 'Alles gespeichert'
                  : id
                    ? 'Änderungen speichern'
                    : 'Maschine speichern'
            }
            disabled={vm.busy || !vm.dirty}
            onPress={() => void vm.save()}
          />
        </>
      }
    >
      <Stack.Screen
        options={{ title: id ? 'Maschine bearbeiten' : 'Maschine anlegen' }}
      />
      <View style={{ gap: 16 }}>
        <Notice error text={vm.error} />
        <SuggestionField
          label="Kategorie"
          placeholder="z. B. Fertigung oder Verpackung"
          helper="Vorschlag auswählen oder eigene Kategorie eingeben."
          value={r.category}
          suggestions={vm.categorySuggestions}
          disabled={vm.busy}
          showAllOnFocus
          onChange={(v) => vm.change('category', v)}
        />
        <Field
          label="Name *"
          value={r.name}
          onChangeText={(v) => vm.change('name', v)}
          editable={!vm.busy}
        />
        <Field
          label="Maschinennummer (optional)"
          value={r.number}
          onChangeText={(v) => vm.change('number', v)}
          editable={!vm.busy}
        />
        <Field
          label="Produktionsbereich / Standort (optional)"
          value={r.location}
          onChangeText={(v) => vm.change('location', v)}
          editable={!vm.busy}
          multiline
          numberOfLines={3}
          submitBehavior="newline"
          scrollEnabled={false}
        />
        <Card>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Anlagendaten (optional)"
            accessibilityState={{
              expanded: vm.technicalExpanded,
              disabled: vm.busy,
            }}
            disabled={vm.busy}
            onPress={vm.toggleTechnical}
            style={({ pressed }) => ({
              minHeight: 48,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
              opacity: pressed && !vm.busy ? 0.8 : 1,
            })}
          >
            <View style={{ flex: 1, gap: 4 }}>
              <Body style={{ fontSize: 16, lineHeight: 24 }}>
                Anlagendaten (optional)
              </Body>
              <Body muted>Hersteller, Modell und Seriennummer</Body>
            </View>
            <View
              style={{
                transform: [
                  { rotate: vm.technicalExpanded ? '180deg' : '0deg' },
                ],
              }}
            >
              <Icon name="expand_more" color={c.primary} />
            </View>
          </Pressable>
          {vm.technicalExpanded && (
            <View style={{ gap: 16, paddingTop: 4 }}>
              <Field
                label="Hersteller (optional)"
                value={r.manufacturer}
                onChangeText={(v) => vm.change('manufacturer', v)}
                editable={!vm.busy}
              />
              <Field
                label="Modell (optional)"
                value={r.model}
                onChangeText={(v) => vm.change('model', v)}
                editable={!vm.busy}
              />
              <Field
                label="Seriennummer (optional)"
                value={r.serial}
                onChangeText={(v) => vm.change('serial', v)}
                editable={!vm.busy}
              />
            </View>
          )}
        </Card>
        <DateField
          label="Inbetriebnahme (optional)"
          value={r.installedOn}
          onChange={(v) => vm.change('installedOn', v)}
          optional
          disabled={vm.busy}
        />
        <Body strong>Produktionszähler</Body>
        {r.counters.map((counter, index) => (
          <CounterFields
            key={counter.id}
            counter={counter}
            busy={vm.busy}
            onChange={(value) =>
              vm.change(
                'counters',
                r.counters.map((c) => (c.id === counter.id ? value : c)),
              )
            }
            onRemove={
              r.counters.length > 1
                ? () =>
                    vm.change(
                      'counters',
                      r.counters.filter((c) => c.id !== counter.id),
                    )
                : undefined
            }
            index={index + 1}
          />
        ))}
        <Button
          secondary
          title="Weiteren Zähler hinzufügen"
          icon="add"
          disabled={vm.busy}
          onPress={vm.addCounter}
        />
        <Field
          label="Notiz (optional)"
          multiline
          value={r.note}
          onChangeText={(v) => vm.change('note', v)}
          editable={!vm.busy}
        />
      </View>
    </Page>
  );
}

function CounterFields({
  counter,
  busy,
  onChange,
  onRemove,
  index,
}: {
  counter: Counter;
  busy: boolean;
  onChange(value: Counter): void;
  onRemove?: () => void;
  index: number;
}) {
  return (
    <Card>
      <Body strong>Zähler {index}</Body>
      <Field
        label="Zählerbezeichnung *"
        value={counter.name}
        editable={!busy}
        onChangeText={(name) => onChange({ ...counter, name })}
      />
      <SelectField
        label="Zählerart"
        value={counter.type}
        disabled={busy}
        options={Object.entries(counterTypes).map(([value, label]) => ({
          value,
          label,
        }))}
        onChange={(type) =>
          onChange({
            ...counter,
            type: type as Counter['type'],
            unit: defaultUnits[type as Counter['type']],
          })
        }
      />
      <SuggestionField
        label="Einheit *"
        value={counter.unit}
        suggestions={units}
        disabled={busy}
        showAllOnFocus
        helper="Vorschlag auswählen oder eigene Einheit eingeben. Frühere Ablesungen behalten ihre Einheit."
        onChange={(unit) => onChange({ ...counter, unit })}
      />
      <Field
        label="Zählernummer (optional)"
        value={counter.number}
        editable={!busy}
        onChangeText={(number) => onChange({ ...counter, number })}
      />
      <ReminderEditor
        reminder={counter.reminder}
        busy={busy}
        onChange={(reminder) => onChange({ ...counter, reminder })}
      />
      {onRemove && (
        <Button
          secondary
          danger
          title="Zähler entfernen"
          disabled={busy}
          onPress={onRemove}
        />
      )}
    </Card>
  );
}
