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
import { formatValue } from '../../core/domain/reading-value';
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
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
      <Body
        muted={comparison}
        style={{ width: comparison ? 62 : 130, flexShrink: 1 }}
      >
        {label}
      </Body>
      <Body strong={!comparison} style={{ flex: 1 }}>
        {value || 'Keine Angabe'}
      </Body>
    </View>
  );
}

export function EntryInformation({ entry: e }: { entry: CounterEvent }) {
  return (
    <Card>
      <DetailRow
        label="Zeitpunkt der Ablesung"
        value={dateTime(e.occurredAt)}
      />
      <DetailRow label="Quelle" value={sourceLabels[e.source]} />
      {e.kind !== 'reading' && (
        <>
          <DetailRow label="Art des Eintrags" value={eventLabels[e.kind]} />
          <DetailRow
            label="Alter Endstand"
            value={
              e.closing
                ? `${formatValue(e.closing.value)} ${e.closing.unit}`
                : 'Unbekannt'
            }
          />
        </>
      )}
      {!!e.newCounterNumber && (
        <DetailRow label="Neue Zählernummer" value={e.newCounterNumber} />
      )}
      {!!e.note && <DetailRow label="Notiz" value={e.note} />}
    </Card>
  );
}

function changedFields({ before, after }: Revision) {
  const measurement = (state: Revision['before']) =>
    `${formatValue(state.measurement.value)} ${state.measurement.unit}`;
  const closing = (state: Revision['before']) =>
    state.closing
      ? `${formatValue(state.closing.value)} ${state.closing.unit}`
      : 'Unbekannt';
  const rows: [string, string, string][] = [
    ['Zählerstand', measurement(before), measurement(after)],
    [
      'Zeitpunkt der Ablesung',
      dateTime(before.occurredAt),
      dateTime(after.occurredAt),
    ],
    ['Art des Eintrags', eventLabels[before.kind], eventLabels[after.kind]],
    ['Alter Endstand', closing(before), closing(after)],
    ['Neue Zählernummer', before.newCounterNumber, after.newCounterNumber],
    ['Notiz', before.note, after.note],
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
      <Body strong>Korrektur vom {dateTime(revision.changedAt)}</Body>
      {!!revision.reason && <Body>Grund: {revision.reason}</Body>}
      {changedFields(revision).map(([label, before, after]) => (
        <View key={label} style={{ gap: 3 }}>
          <Body strong>{label}</Body>
          <DetailRow comparison label="Vorher:" value={before} />
          <DetailRow comparison label="Neu:" value={after} />
        </View>
      ))}
      {photoChanged &&
        (afterPhotos.length ? (
          <View style={{ gap: 8 }}>
            <Body strong>Neues Foto</Body>
            <PhotoGallery photos={afterPhotos} />
          </View>
        ) : (
          <Body strong>Nachweisfoto geändert</Body>
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
                ? 'Vorherige Anhänge anzeigen'
                : 'Vorheriges Foto anzeigen'}
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
  const c = useTheme();
  const revisions = [...entry.revisions].sort(
    (a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt),
  );
  return (
    <Card>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Icon name="history_outlined" color={c.primary} />
        <Body strong style={{ flex: 1 }}>
          Korrekturverlauf
        </Body>
      </View>
      <Body>
        Hier findest du jede gespeicherte Korrektur mit Zeitpunkt, den
        geänderten Angaben und – falls angegeben – einem Grund.
      </Body>
      {revisions.length === 0 ? (
        <Body>Für diese Ablesung gibt es noch keine Korrekturen.</Body>
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
