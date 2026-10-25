import { presetLabel, presetValue } from '../../core/localization/presets';
import { t } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
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
import {
  displayValue as formatValue,
  displayInput,
} from '../../core/localization/numbers';
import {
  PhotoEditor,
  Documents,
  type AttachmentActions,
} from '../media/attachments';
import { useEntryEditor } from './use-entry-editor';
import { FormErrorTarget } from '../../core/ui/form-error-target';
import { CaptureGuidance } from './capture-guidance';
import { PhotoExamplesButton } from './photo-examples-button';
export function EntryEditorScreen() {
  useLocalization();
  const { recordId, entryId, counterId } = useLocalSearchParams<{
    recordId: string;
    entryId?: string;
    counterId?: string;
  }>();
  const [openedAt] = useState(() => Date.now());
  const vm = useEntryEditor(recordId, entryId, counterId);
  const draft = vm.draft;
  const firstError = [
    'closingValue',
    'closingUnit',
    'unit',
    'value',
    'newCounterNumber',
    'occurredAt',
    'note',
    'reason',
  ].find((field) => vm.fieldErrors[field]);
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
          title: entryId ? t('eintragKorrigieren') : t('erfassenFotografieren'),
        }}
      />
      {!!vm.error && (
        <FormErrorTarget active attempt={vm.errorAttempt}>
          <Notice error text={vm.error} />
        </FormErrorTarget>
      )}
      {vm.phase === 'choose' ? (
        <>
          <Notice text={vm.notice} />
          <CaptureGuidance />
          <PhotoExamplesButton disabled={vm.busy} />
          <Button
            icon="photo_camera_outlined"
            title={t('takeAPhotoOfTheMeter')}
            disabled={vm.busy}
            onPress={() => void vm.pick('camera')}
          />
          <Button
            secondary
            icon="photo_library_outlined"
            title={t('photoFromGallery')}
            disabled={vm.busy}
            onPress={() => void vm.pick('gallery')}
          />
          <Button
            secondary
            icon="edit_note_outlined"
            title={t('captureWithoutPhoto')}
            disabled={vm.busy}
            onPress={() => void vm.chooseManual()}
          />
        </>
      ) : (
        <View style={{ gap: 16 }}>
          <SelectField
            label={t('artDesEintrags')}
            value={form.kind}
            disabled={vm.busy}
            options={Object.entries(eventLabels).map(([value, label]) => ({
              value,
              label,
            }))}
            onChange={(v) => vm.change('kind', v as EventState['kind'])}
          />
          <PhotoEditor photos={photos} actions={actions} />
          <Notice text={vm.notice} />
          {photos.length > 0 &&
            (photos.length > 1 || vm.candidates.length > 0) && (
              <Card>
                <Body strong>{t('zahlenImFotoErkennen')}</Body>
                {photos.length > 1 && (
                  <SelectField
                    label={t('fotoFuerDieZahlenerkennung')}
                    value={form.ocr?.photoId ?? photos[0]!.id}
                    options={photos.map((p, i) => ({
                      value: p.id,
                      label: t('fotoValueValue', { p0: i + 1, p1: p.name }),
                    }))}
                    disabled={vm.busy}
                    onChange={(id) => void vm.recognize(id)}
                  />
                )}
                {vm.candidates.map((candidate) => (
                  <Button
                    key={formatValue(candidate.value)}
                    secondary
                    title={t('valueValueUebernehmen', {
                      p0: formatValue(candidate.value),
                      p1: presetLabel(form.unit),
                    })}
                    disabled={vm.busy}
                    onPress={() => vm.selectCandidate(candidate)}
                  />
                ))}
                {vm.candidates.length > 0 && (
                  <Body muted>
                    {t(
                      'derVorschlagErsetztKeinePruefungMassgeblichIstDerVonDirBestaetigteWert',
                    )}
                  </Body>
                )}
              </Card>
            )}
          {form.kind !== 'reading' && (
            <Card>
              <Body strong>{t('alterZaehlerstand')}</Body>
              <FormErrorTarget
                active={firstError === 'closingValue'}
                attempt={vm.errorAttempt}
              >
                <Field
                  label={t('endstandVorDemWechselOptional')}
                  error={vm.fieldErrors.closingValue}
                  suffix={form.closingUnit}
                  keyboardType="decimal-pad"
                  inputMode="decimal"
                  autoCorrect={false}
                  autoCapitalize="none"
                  value={displayInput(form.closingValue)}
                  editable={!vm.busy}
                  onChangeText={(v) => vm.change('closingValue', v)}
                />
              </FormErrorTarget>
              <FormErrorTarget
                active={firstError === 'closingUnit'}
                attempt={vm.errorAttempt}
                style={{ zIndex: 1 }}
              >
                <SuggestionField
                  label={t('einheitDesAltenEndstands')}
                  error={vm.fieldErrors.closingUnit}
                  helper={t('einheitVorDemWechsel')}
                  value={presetLabel(form.closingUnit)}
                  suggestions={units.map((value) => presetLabel(value))}
                  disabled={vm.busy}
                  onChange={(v) => vm.change('closingUnit', presetValue(v))}
                />
              </FormErrorTarget>
              <Body muted>
                {t(
                  'istDerEndstandUnbekanntBleibtDieFehlendeMengeAlsBerechnungslueckeSichtbar',
                )}
              </Body>
            </Card>
          )}
          <FormErrorTarget
            active={firstError === 'unit'}
            attempt={vm.errorAttempt}
            style={{ zIndex: 1 }}
          >
            <SuggestionField
              label={t('unit')}
              error={vm.fieldErrors.unit}
              helper={t('vorschlagAuswaehlenOderEigeneEinheitEingeben')}
              value={presetLabel(form.unit)}
              suggestions={units.map((value) => presetLabel(value))}
              disabled={vm.busy}
              showAllOnFocus
              onChange={(v) => vm.change('unit', presetValue(v))}
            />
          </FormErrorTarget>
          <FormErrorTarget
            active={firstError === 'value'}
            attempt={vm.errorAttempt}
          >
            <Field
              label={
                form.kind === 'reading'
                  ? t('meterReading677')
                  : t('neuerStartstand490')
              }
              suffix={presetLabel(form.unit)}
              error={vm.fieldErrors.value}
              keyboardType="decimal-pad"
              inputMode="decimal"
              autoCorrect={false}
              autoCapitalize="none"
              value={displayInput(form.value)}
              onChangeText={(v) => vm.change('value', v)}
              editable={!vm.busy}
            />
          </FormErrorTarget>
          <Body muted style={{ fontSize: 12, paddingHorizontal: 16 }}>
            {t('numberHint', { p0: displayInput('0,1').slice(1, 2) })}
          </Body>
          {form.unit === 'h' && (
            <Body muted>
              {t(
                'betriebsstundenDezimalEingebenZumBeispiel125Fuer12StundenUnd30Minuten',
                { p0: displayInput('12,5') },
              )}
            </Body>
          )}
          {form.kind === 'replacement' && (
            <FormErrorTarget
              active={firstError === 'newCounterNumber'}
              attempt={vm.errorAttempt}
            >
              <Field
                label={t('neueZaehlernummerOptional')}
                error={vm.fieldErrors.newCounterNumber}
                value={form.newCounterNumber}
                editable={!vm.busy}
                onChangeText={(v) => vm.change('newCounterNumber', v)}
              />
            </FormErrorTarget>
          )}
          <FormErrorTarget
            active={firstError === 'occurredAt'}
            attempt={vm.errorAttempt}
          >
            <Card>
              <Body strong>{t('datumUndUhrzeit')}</Body>
              <Body muted>{t('zeitpunktDerAblesungOderDesWechsels')}</Body>
              <DateField
                label={t('datumUndUhrzeit')}
                showLabel={false}
                time
                value={form.occurredAt}
                disabled={vm.busy}
                onChange={(v) => vm.change('occurredAt', v)}
              />
              <Notice error text={vm.fieldErrors.occurredAt} />
            </Card>
          </FormErrorTarget>
          {Date.parse(form.occurredAt) > openedAt && (
            <Notice
              text={t(
                'dieserZeitpunktLiegtInDerZukunftUndWirdImProtokollEntsprechendGekennzeichnet',
              )}
            />
          )}
          <FormErrorTarget
            active={firstError === 'note'}
            attempt={vm.errorAttempt}
          >
            <Field
              label={t('notizOptional')}
              error={vm.fieldErrors.note}
              multiline
              value={form.note}
              onChangeText={(v) => vm.change('note', v)}
              editable={!vm.busy}
            />
          </FormErrorTarget>
          <Documents documents={documents} />
          {entryId && (
            <Card>
              <Body strong>{t('nachvollziehbareKorrektur')}</Body>
              <Body muted>
                {t(
                  'dieUrspruenglichenAngabenUndFotosBleibenInDerKorrekturhistorieErhalten',
                )}
              </Body>
              <FormErrorTarget
                active={firstError === 'reason'}
                attempt={vm.errorAttempt}
              >
                <Field
                  label={t('anderungsgrundOptional')}
                  error={vm.fieldErrors.reason}
                  multiline
                  value={form.reason}
                  onChangeText={(v) => vm.change('reason', v)}
                  editable={!vm.busy}
                />
              </FormErrorTarget>
            </Card>
          )}
          <Button
            icon="verified_outlined"
            title={
              vm.busy
                ? t('saving')
                : entryId
                  ? t('korrekturBestaetigenUndSpeichern')
                  : t('bestaetigenUndSpeichern')
            }
            disabled={vm.busy}
            onPress={() => void vm.save()}
          />
        </View>
      )}
      {vm.busy && <Busy label={t('fotosUndZaehlerstandWerdenVerarbeitet')} />}
    </Page>
  );
}
