import { useState } from 'react';
import { View } from 'react-native';
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
} from '../../core/ui/components';
import { SuggestionField } from '../../core/ui/suggestion-field';
import { units, eventLabels, type EventState } from '../../core/domain/models';
import { formatValue } from '../../core/domain/reading-value';
import {
  PhotoEditor,
  Documents,
  type AttachmentActions,
} from '../media/attachments';
import { useEntryEditor } from './use-entry-editor';
export function EntryEditorScreen() {
  const { recordId, entryId, counterId } = useLocalSearchParams<{
    recordId: string;
    entryId?: string;
    counterId?: string;
  }>();
  const [openedAt] = useState(() => Date.now());
  const vm = useEntryEditor(recordId, entryId, counterId);
  const draft = vm.draft;
  if (!draft)
    return (
      <Page ready={!!vm.error}>
        <Notice error text={vm.error} />
        {!vm.error && <Busy />}
      </Page>
    );
  const form = draft.form;
  const photos = form.attachments.filter((a) => a.kind === 'photo');
  const documents = form.attachments.filter((a) => a.kind === 'pdf');
  const actions: AttachmentActions = {
    busy: vm.busy,
    pick: vm.pick,
    remove: vm.remove,
    move: vm.move,
    reorder: vm.reorderKind,
  };
  return (
    <Page>
      <Stack.Screen
        options={{
          title: entryId ? 'Eintrag korrigieren' : 'Zählerstand erfassen',
        }}
      />
      <Notice error text={vm.error} />
      <Notice text={vm.notice} />
      {vm.phase === 'choose' ? (
        <>
          <Card>
            <Body strong style={{ fontSize: 16 }}>
              Produktion festhalten
            </Body>
            <Body>
              Fotografiere die Zähleranzeige gerade und gut lesbar. Vermeide
              Spiegelungen und Schatten.
            </Body>
            <Body muted>
              MaschinenLog erkennt Zahlen lokal auf deinem Gerät. Du prüfst den
              erkannten Stand vor dem Speichern. Fotos werden ohne Aufnahme- und
              Standortmetadaten gespeichert.
            </Body>
          </Card>
          <Button
            icon="photo_camera_outlined"
            title="Zähler fotografieren"
            disabled={vm.busy}
            onPress={() => void vm.pick('camera')}
          />
          <Button
            secondary
            icon="photo_library_outlined"
            title="Foto aus Galerie"
            disabled={vm.busy}
            onPress={() => void vm.pick('gallery')}
          />
          <Button
            secondary
            icon="edit_note_outlined"
            title="Ohne Foto erfassen"
            disabled={vm.busy}
            onPress={() => void vm.chooseManual()}
          />
        </>
      ) : (
        <View style={{ gap: 16 }}>
          <SelectField
            label="Art des Eintrags"
            value={form.kind}
            disabled={vm.busy}
            options={Object.entries(eventLabels).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(v) => vm.change('kind', v as EventState['kind'])}
          />
          <PhotoEditor photos={photos} actions={actions} />
          {photos.length > 0 && (
            <Card>
              <Body strong>Zahlen im Foto erkennen</Body>
              {photos.length > 1 && (
                <SelectField
                  label="Foto für die Zahlenerkennung"
                  value={form.ocr?.photoId ?? photos[0]!.id}
                  options={photos.map((p, i) => ({
                    value: p.id,
                    label: `Foto ${i + 1} · ${p.name}`,
                  }))}
                  disabled={vm.busy}
                  onChange={(id) => void vm.recognize(id)}
                />
              )}
              <Button
                secondary
                icon="manage_search_outlined"
                title="Zahlen erneut erkennen"
                disabled={vm.busy}
                onPress={() => void vm.recognize(form.ocr?.photoId)}
              />
              {vm.candidates.map((candidate) => (
                <Button
                  key={formatValue(candidate.value)}
                  secondary
                  title={`${formatValue(candidate.value)} ${form.unit} übernehmen`}
                  disabled={vm.busy}
                  onPress={() => vm.selectCandidate(candidate)}
                />
              ))}
              <Body muted>
                Der Vorschlag ersetzt keine Prüfung. Maßgeblich ist der von dir
                bestätigte Wert.
              </Body>
            </Card>
          )}
          {form.kind !== 'reading' && (
            <Card>
              <Body strong>Alter Zählerstand</Body>
              <Field
                label="Endstand vor dem Wechsel (optional)"
                suffix={form.closingUnit}
                keyboardType="decimal-pad"
                value={form.closingValue}
                editable={!vm.busy}
                onChangeText={(v) => vm.change('closingValue', v)}
              />
              <SuggestionField
                label="Einheit des alten Endstands"
                helper="Einheit vor dem Wechsel."
                value={form.closingUnit}
                suggestions={units}
                disabled={vm.busy}
                onChange={(v) => vm.change('closingUnit', v)}
              />
              <Body muted>
                Ist der Endstand unbekannt, bleibt die fehlende Menge als
                Berechnungslücke sichtbar.
              </Body>
            </Card>
          )}
          <SuggestionField
            label="Einheit *"
            helper="Vorschlag auswählen oder eigene Einheit eingeben."
            value={form.unit}
            suggestions={units}
            disabled={vm.busy}
            showAllOnFocus
            onChange={(v) => vm.change('unit', v)}
          />
          <Field
            label={
              form.kind === 'reading' ? 'Zählerstand *' : 'Neuer Startstand *'
            }
            suffix={form.unit}
            keyboardType="decimal-pad"
            value={form.value}
            onChangeText={(v) => vm.change('value', v)}
            editable={!vm.busy}
          />
          {form.unit === 'h' && (
            <Body muted>
              Betriebsstunden dezimal eingeben, zum Beispiel 12,5 für 12 Stunden
              und 30 Minuten.
            </Body>
          )}
          {form.kind === 'replacement' && (
            <Field
              label="Neue Zählernummer (optional)"
              value={form.newCounterNumber}
              editable={!vm.busy}
              onChangeText={(v) => vm.change('newCounterNumber', v)}
            />
          )}
          <Card>
            <Body strong>Datum und Uhrzeit</Body>
            <DateField
              label="Zeitpunkt der Ablesung oder des Wechsels"
              time
              value={form.occurredAt}
              disabled={vm.busy}
              onChange={(v) => vm.change('occurredAt', v)}
            />
          </Card>
          {Date.parse(form.occurredAt) > openedAt && (
            <Notice text="Dieser Zeitpunkt liegt in der Zukunft und wird im Protokoll entsprechend gekennzeichnet." />
          )}
          <Field
            label="Notiz (optional)"
            multiline
            value={form.note}
            onChangeText={(v) => vm.change('note', v)}
            editable={!vm.busy}
          />
          <Documents documents={documents} />
          {entryId && (
            <Card>
              <Body strong>Nachvollziehbare Korrektur</Body>
              <Body muted>
                Die ursprünglichen Angaben und Fotos bleiben in der
                Korrekturhistorie erhalten.
              </Body>
              <Field
                label="Änderungsgrund *"
                multiline
                value={form.reason}
                onChangeText={(v) => vm.change('reason', v)}
                editable={!vm.busy}
              />
            </Card>
          )}
          <Button
            icon="verified_outlined"
            title={
              vm.busy
                ? 'Wird gespeichert …'
                : entryId
                  ? 'Korrektur bestätigen und speichern'
                  : 'Bestätigen und speichern'
            }
            disabled={vm.busy}
            onPress={() => void vm.save()}
          />
        </View>
      )}
      {vm.busy && <Busy label="Fotos und Zählerstand werden verarbeitet …" />}
    </Page>
  );
}
