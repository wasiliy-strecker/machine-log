import { View, Text } from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  Body,
  Button,
  Busy,
  Notice,
  Page,
  useTheme,
} from '../../core/ui/components';
import { allAttachments } from '../../core/domain/models';
import { counterTitle } from '../../core/domain/production-counter';
import { entrySummary } from '../records/presentation-model';
import { Reports } from '../records/reports';
import { PhotoGallery, Documents } from '../media/attachments';
import { useEntryDetail } from './use-entry-detail';
import { MachineIcon } from '../../core/ui/machine-icon';
import { CorrectionHistory, EntryInformation } from './entry-detail-sections';
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
  const counter = vm.record?.counters.find(
    (counter) => counter.id === e.counterId,
  );
  return (
    <Page ready={!vm.loading}>
      <Stack.Screen options={{ title: 'Eintrag' }} />
      {!!photos.length && (
        <View style={{ gap: 8 }}>
          <Body strong style={{ fontSize: 16 }}>
            {photos.length === 1
              ? 'Aktuelles Foto'
              : `Fotos aus dem Altbestand (${photos.length})`}
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
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <MachineIcon icon={counter?.icon} />
        <Body style={{ flex: 1 }}>
          {vm.record && counter
            ? counterTitle(vm.record, counter)
            : e.counterName}
        </Body>
      </View>
      {Date.parse(e.occurredAt) > Date.parse(e.updatedAt) && (
        <Notice text="Beim Speichern lag der angegebene Ablesezeitpunkt in der Zukunft. Der tatsächliche Speicherzeitpunkt bleibt separat erhalten." />
      )}
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
      <EntryInformation entry={e} />
      <Documents documents={e.attachments.filter((a) => a.kind === 'pdf')} />
      <CorrectionHistory key={e.id} entry={e} />
      <Reports
        recordId={e.recordId}
        entryId={e.id}
        hasAttachments={!!allAttachments(e).length}
        summary={entrySummary(e)}
      />
    </Page>
  );
}
