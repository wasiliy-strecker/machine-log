import { presetLabel } from '../../core/localization/presets';
import { t } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Body, Card, useTheme } from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import {
  eventLabels,
  sourceLabels,
  type Attachment,
  type CounterEvent,
  type Revision,
} from '../../core/domain/models';
import { displayValue as formatValue } from '../../core/localization/numbers';
import { dateTime } from '../records/presentation-model';
import { Documents, PhotoGallery } from '../media/attachments';
function DetailRow({
  label,
  value,
  comparison = false,
}: {
  label: string;
  value: string;
  comparison?: boolean;
}) {
  useLocalization();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <Body
        muted={comparison}
        style={{ width: comparison ? 62 : 130, flexShrink: 1 }}
      >
        {label}
      </Body>
      <Body strong={!comparison} style={{ flex: 1 }}>
        {value || t('notSpecified')}
      </Body>
    </View>
  );
}
export function EntryInformation({ entry: e }: { entry: CounterEvent }) {
  useLocalization();
  return (
    <Card>
      <DetailRow label={t('timeOfReading')} value={dateTime(e.occurredAt)} />
      <DetailRow label={t('source')} value={sourceLabels[e.source]} />
      {e.kind !== 'reading' && (
        <>
          <DetailRow label={t('artDesEintrags')} value={eventLabels[e.kind]} />
          <DetailRow
            label={t('alterEndstand')}
            value={
              e.closing
                ? `${formatValue(e.closing.value)} ${presetLabel(e.closing.unit)}`
                : t('unbekannt')
            }
          />
        </>
      )}
      {!!e.newCounterNumber && (
        <DetailRow label={t('neueZaehlernummer')} value={e.newCounterNumber} />
      )}
      {!!e.note && <DetailRow label={t('note')} value={e.note} />}
    </Card>
  );
}
function changedFields({ before, after }: Revision) {
  const measurement = (state: Revision['before']) =>
    `${formatValue(state.measurement.value)} ${presetLabel(state.measurement.unit)}`;
  const closing = (state: Revision['before']) =>
    state.closing
      ? `${formatValue(state.closing.value)} ${presetLabel(state.closing.unit)}`
      : t('unbekannt');
  const rows: [string, string, string][] = [
    [t('meterReading'), measurement(before), measurement(after)],
    [
      t('timeOfReading'),
      dateTime(before.occurredAt),
      dateTime(after.occurredAt),
    ],
    [t('artDesEintrags'), eventLabels[before.kind], eventLabels[after.kind]],
    [t('alterEndstand'), closing(before), closing(after)],
    [t('neueZaehlernummer'), before.newCounterNumber, after.newCounterNumber],
    [t('note'), before.note, after.note],
  ];
  return rows.filter(([, previous, next]) => previous !== next);
}
function filesChanged(before: Attachment[], after: Attachment[]) {
  return (
    JSON.stringify(before.map((a) => [a.file, a.sha256])) !==
    JSON.stringify(after.map((a) => [a.file, a.sha256]))
  );
}
function RevisionEntry({ revision }: { revision: Revision }) {
  useLocalization();
  const c = useTheme();
  const [showPrevious, setShowPrevious] = useState(false);
  const beforePhotos = revision.before.attachments.filter(
    (a) => a.kind === 'photo',
  );
  const afterPhotos = revision.after.attachments.filter(
    (a) => a.kind === 'photo',
  );
  const beforeDocuments = revision.before.attachments.filter(
    (a) => a.kind === 'pdf',
  );
  const afterDocuments = revision.after.attachments.filter(
    (a) => a.kind === 'pdf',
  );
  const photoChanged = filesChanged(beforePhotos, afterPhotos);
  const documentsChanged = filesChanged(beforeDocuments, afterDocuments);
  const previousPhotos = photoChanged ? beforePhotos : [];
  const previousDocuments = documentsChanged ? beforeDocuments : [];
  return (
    <View style={{ gap: 10 }}>
      <Body strong>
        {t('korrekturVom') + ' '}
        {dateTime(revision.changedAt)}
      </Body>
      {!!revision.reason && (
        <Body>
          {t('grund') + ' '}
          {revision.reason}
        </Body>
      )}
      {changedFields(revision).map(([label, before, after]) => (
        <View key={label} style={{ gap: 3 }}>
          <Body strong>{label}</Body>
          <DetailRow comparison label={t('vorher')} value={before} />
          <DetailRow comparison label={t('neu')} value={after} />
        </View>
      ))}
      {photoChanged &&
        (afterPhotos.length ? (
          <View style={{ gap: 8 }}>
            <Body strong>{t('newPhoto')}</Body>
            <PhotoGallery photos={afterPhotos} />
          </View>
        ) : (
          <Body strong>{t('supportingPhotoChanged')}</Body>
        ))}
      {documentsChanged && <Documents documents={afterDocuments} />}
      {(previousPhotos.length > 0 || previousDocuments.length > 0) && (
        <>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ expanded: showPrevious }}
            onPress={() => setShowPrevious(!showPrevious)}
            style={{
              minHeight: 48,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <Body style={{ flex: 1 }}>
              {previousDocuments.length
                ? t('vorherigeAnhaengeAnzeigen')
                : t('viewPreviousPhoto')}
            </Body>
            <Icon
              name={showPrevious ? 'expand_less' : 'expand_more'}
              color={c.primary}
            />
          </Pressable>
          {showPrevious && (
            <View style={{ gap: 8 }}>
              {previousPhotos.length > 0 && (
                <PhotoGallery photos={previousPhotos} />
              )}
              <Documents documents={previousDocuments} />
            </View>
          )}
        </>
      )}
    </View>
  );
}
export function CorrectionHistory({ entry }: { entry: CounterEvent }) {
  useLocalization();
  const c = useTheme();
  const revisions = [...entry.revisions].sort(
    (a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt),
  );
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="history_outlined" color={c.primary} />
        <Body strong style={{ flex: 1 }}>
          {t('correctionHistory')}
        </Body>
      </View>
      <Body>
        {t(
          'hereYouWillFindEverySavedCorrectionWithTheTimeTheChangedInformationAndIfSpecifiedAReason',
        )}
      </Body>
      {revisions.length === 0 ? (
        <Body>{t('thereAreNoCorrectionsForThisReadingYet')}</Body>
      ) : (
        revisions.map((revision, index) => (
          <View
            key={revision.id}
            style={{
              paddingTop: index ? 16 : 0,
              borderTopWidth: index ? 1 : 0,
              borderTopColor: c.border,
            }}
          >
            <RevisionEntry revision={revision} />
          </View>
        ))
      )}
    </Card>
  );
}
