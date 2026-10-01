import { View, Text } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Body,
  Button,
  Busy,
  Card,
  Notice,
  Page,
  useTheme,
} from '../../core/ui/components';
import {
  eventLabels,
  sourceLabels,
  allAttachments,
} from '../../core/domain/models';
import { formatValue } from '../../core/domain/reading-value';
import { dateTime, entrySummary } from '../records/presentation-model';
import { Reports } from '../records/reports';
import { PhotoGallery, Documents } from '../media/attachments';
import { useEntryDetail } from './use-entry-detail';
export function EntryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const vm = useEntryDetail(id),
    c = useTheme();
  const e = vm.entry;
  if (!e)
    return (
      <Page ready={!vm.loading}>
        <Notice error text={vm.error} />
        {vm.loading ? <Busy /> : <Body>Eintrag nicht gefunden.</Body>}
      </Page>
    );
  const photos = e.attachments.filter((a) => a.kind === 'photo');
  return (
    <Page ready={!vm.loading}>
      <Stack.Screen options={{ title: 'Eintrag' }} />
      {!!photos.length && (
        <View style={{ gap: 8 }}>
          <Body strong style={{ fontSize: 16 }}>
            Aktuelle Fotos ({photos.length})
          </Body>
          <PhotoGallery photos={photos} />
        </View>
      )}
      <Text
        style={{
          fontFamily: 'RobotoBlack',
          fontSize: 36,
          lineHeight: 44,
          color: c.ink,
        }}
      >
        {entrySummary(e)}
      </Text>
      <Body>
        {vm.record?.category} · {vm.record?.name}
      </Body>
      <View style={{ gap: 12, marginTop: 4, marginBottom: 6 }}>
        <Button
          secondary
          icon="edit_outlined"
          title="Korrigieren"
          onPress={() =>
            router.push({
              pathname: '/entry/edit',
              params: {
                recordId: e.recordId,
                entryId: id,
                counterId: e.counterId,
              },
            })
          }
        />
        <Button
          secondary
          danger
          icon="delete_outline"
          title="Eintrag löschen"
          disabled={vm.busy}
          onPress={() => void vm.remove()}
        />
      </View>
      <Notice error text={vm.error} />
      <Card>
        <Body strong>Eintragsinformationen</Body>
        <Body>{dateTime(e.occurredAt)}</Body>
        <Body>
          {e.counterName} · {sourceLabels[e.source]}
        </Body>
        <Body>{eventLabels[e.kind]}</Body>
        {e.kind !== 'reading' && (
          <Body>
            Alter Endstand:{' '}
            {e.closing
              ? `${formatValue(e.closing.value)} ${e.closing.unit}`
              : 'Unbekannt'}
          </Body>
        )}
        {!!e.newCounterNumber && (
          <Body>Neue Zählernummer: {e.newCounterNumber}</Body>
        )}
        {vm.delta && <Notice text={vm.delta.label} />}
        {e.ocr && (
          <Body muted>
            OCR-Vorschlag: {e.ocr.selectedText || 'Kein Vorschlag übernommen'}
          </Body>
        )}
        {Date.parse(e.occurredAt) > Date.parse(e.updatedAt) && (
          <Notice text="Der Ablesezeitpunkt lag beim Speichern dieses Stands in der Zukunft." />
        )}
        {!!e.note && <Body>{e.note}</Body>}
        <Body muted style={{ fontSize: 12 }}>
          Zuletzt bearbeitet: {dateTime(e.updatedAt)}
        </Body>
      </Card>
      <Documents documents={e.attachments.filter((a) => a.kind === 'pdf')} />
      {e.revisions.length > 0 && (
        <Card>
          <Body strong>Korrekturhistorie</Body>
          <Body>
            Ursprünglich: {formatValue(e.original.measurement.value)}{' '}
            {e.original.measurement.unit} · {dateTime(e.original.occurredAt)}
          </Body>
          {e.revisions.map((revision, index) => (
            <View key={revision.id} style={{ gap: 6, marginTop: 12 }}>
              <Body strong>
                Korrektur {index + 1} · {dateTime(revision.changedAt)}
              </Body>
              <Body>Grund: {revision.reason}</Body>
              <Body>
                {eventLabels[revision.before.kind]} →{' '}
                {eventLabels[revision.after.kind]}
              </Body>
              <Body>
                Stand: {formatValue(revision.before.measurement.value)}{' '}
                {revision.before.measurement.unit} →{' '}
                {formatValue(revision.after.measurement.value)}{' '}
                {revision.after.measurement.unit}
              </Body>
              <Body>
                Zeitpunkt: {dateTime(revision.before.occurredAt)} →{' '}
                {dateTime(revision.after.occurredAt)}
              </Body>
              {(revision.before.closing || revision.after.closing) && (
                <Body>
                  Endstand:{' '}
                  {revision.before.closing
                    ? `${formatValue(revision.before.closing.value)} ${revision.before.closing.unit}`
                    : 'Unbekannt'}{' '}
                  →{' '}
                  {revision.after.closing
                    ? `${formatValue(revision.after.closing.value)} ${revision.after.closing.unit}`
                    : 'Unbekannt'}
                </Body>
              )}
              {revision.before.note !== revision.after.note && (
                <Body>
                  Notiz: {revision.before.note || '–'} →{' '}
                  {revision.after.note || '–'}
                </Body>
              )}
              <PhotoGallery
                photos={revision.before.attachments.filter(
                  (a) => a.kind === 'photo',
                )}
              />
              <Documents
                documents={revision.before.attachments.filter(
                  (a) => a.kind === 'pdf',
                )}
              />
            </View>
          ))}
        </Card>
      )}
      <Reports
        recordId={e.recordId}
        entryId={e.id}
        hasAttachments={!!allAttachments(e).length}
        summary={entrySummary(e)}
      />
    </Page>
  );
}
