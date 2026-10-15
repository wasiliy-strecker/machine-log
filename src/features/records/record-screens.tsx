import { View, Text } from 'react-native';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  Body,
  Button,
  Busy,
  Card,
  Field,
  Heading,
  Page,
  Title,
  Fab,
  IconButton,
  Notice,
  useTheme,
} from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import { MachineIcon } from '../../core/ui/machine-icon';
import { counterTypeLabel } from '../../core/domain/counter-type';
import {
  counterTitle,
  counterLocation,
} from '../../core/domain/production-counter';
import { useFeedback } from '../../core/ui/feedback';
import { useRecords, useRecordDetail } from './use-records';
import { ReminderScheduleStatus } from './reminder-status';
import { HistoryTile } from './history-tile';
import { Reports } from './reports';
import {
  dateTime,
  entrySummary,
  reminderSummary,
  sortLabels,
  type RecordSort,
} from './presentation-model';
import { PAGE_SIZE, type Counter } from '../../core/domain/models';
import type { ReminderStatus } from '../../core/native/machine-native';
export function ReminderInfo({
  record,
  status,
  onEdit,
}: {
  record: Counter;
  status?: ReminderStatus;
  onEdit(): void;
}) {
  const c = useTheme();
  const r = record.reminder;
  const s = status?.schedules.find((s) => s.recordId === record.id);
  if (!r && s?.planningState !== 'cancelFailed') return null;
  return (
    <View style={{ gap: 6 }}>
      {r && (
        <Body strong style={{ fontSize: 12 }}>
          Erinnern: {reminderSummary(r)}
        </Body>
      )}
      <ReminderScheduleStatus
        reminder={r}
        status={status}
        counterId={record.id}
        onEdit={onEdit}
      />
      <View
        style={{
          paddingHorizontal: 10,
          paddingVertical: 8,
          borderRadius: 12,
          backgroundColor: c.soft,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 8,
        }}
      >
        <Icon name="notifications_active_outlined" size={19} color={c.onSoft} />
        <Body strong style={{ fontSize: 12, color: c.onSoft, flex: 1 }}>
          Letzte Erinnerung:{' '}
          {s?.lastTriggeredAtMillis
            ? `${dateTime(s.lastTriggeredAtMillis)} Uhr`
            : 'noch keine'}
        </Body>
      </View>
    </View>
  );
}
export function RecordsScreen() {
  const vm = useRecords(),
    c = useTheme(),
    feedback = useFeedback();
  const create = () => router.push('/record/edit');
  return (
    <Page
      ready={!vm.loading}
      fab={<Fab title="Zähler anlegen" onPress={create} />}
    >
      {vm.loading ? (
        <Busy label="Produktionszähler werden geladen …" />
      ) : vm.error ? (
        <>
          <Notice error text={vm.error} />
          <Button title="Erneut laden" onPress={vm.retry} />
        </>
      ) : vm.empty ? (
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 16,
            gap: 20,
          }}
        >
          <Icon name="settings_outlined" size={72} color={c.primary} />
          <Title>Ersten Produktionszähler anlegen</Title>
          <Body style={{ textAlign: 'center' }}>
            Dokumentiere Produktionsstände deiner Maschinen. Erfasse
            Stückzahlen, Zyklen, Betriebsstunden und Mengen mit Foto oder
            manuell. Deine Daten bleiben lokal auf deinem Gerät.
          </Body>
        </View>
      ) : (
        <>
          <Title subtitle="Zählerstände erfassen und Produktionszuwächse nachvollziehen.">
            Deine Produktionszähler
          </Title>
          <View style={{ marginTop: 4 }}>
            <Field
              label="Zähler suchen"
              leading="search"
              value={vm.search}
              onChangeText={vm.setSearch}
              trailing={vm.search ? 'close' : undefined}
              onTrailingPress={() => vm.setSearch('')}
              returnKeyType="search"
            />
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: 12,
              flexWrap: 'wrap',
            }}
          >
            <Body muted>
              {vm.items.length} {vm.search ? 'Treffer' : 'Zähler'}
            </Body>
            <Button
              secondary
              icon="sort"
              menu
              title={sortLabels[vm.sort]}
              onPress={(anchor) =>
                void feedback
                  .choose({
                    title: 'Zähler sortieren',
                    anchor,
                    options: (Object.keys(sortLabels) as RecordSort[]).map(
                      (value) => ({
                        value,
                        label: sortLabels[value],
                        icon: value === vm.sort ? 'check' : undefined,
                      }),
                    ),
                  })
                  .then((value) => {
                    if (value) vm.setSort(value as RecordSort);
                  })
              }
            />
          </View>
          {!vm.items.length && (
            <Card>
              <Icon name="search" size={42} color={c.primary} />
              <Body>Keine passenden Zähler gefunden.</Body>
            </Card>
          )}
          {vm.items.map(({ record, counter, latest, lastEdited }) => (
            <Card
              key={counter.id}
              onPress={() =>
                router.push({
                  pathname: '/record/[id]',
                  params: { id: record.id, counterId: counter.id },
                })
              }
            >
              <View
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}
              >
                <View style={{ flex: 1, gap: 4 }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <MachineIcon icon={counter.icon} />
                    <Body
                      strong
                      style={{ flex: 1, fontSize: 16, lineHeight: 24 }}
                    >
                      {counterTitle(record, counter)}
                    </Body>
                    {vm.status?.schedules.find((s) => s.recordId === counter.id)
                      ?.isNotificationActive && (
                      <View
                        accessibilityLabel="Aktive Ableseerinnerung"
                        style={{
                          backgroundColor: c.danger,
                          borderRadius: 10,
                          paddingHorizontal: 5,
                        }}
                      >
                        <Text style={{ color: c.background, fontSize: 11 }}>
                          1
                        </Text>
                      </View>
                    )}
                  </View>
                  <Body muted>
                    {[
                      counterTypeLabel(counter.type),
                      counterLocation(record, counter),
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                  </Body>
                  <Text
                    style={{
                      fontFamily: 'RobotoBlack',
                      fontSize: 22,
                      lineHeight: 28,
                      color: c.ink,
                      marginTop: 2,
                    }}
                  >
                    {entrySummary(latest)}
                  </Text>
                  <Body muted style={{ fontSize: 12, lineHeight: 16 }}>
                    Zuletzt bearbeitet: {dateTime(lastEdited)}
                  </Body>
                  {vm.drafts.some((d) => d.counterId === counter.id) && (
                    <Body muted style={{ fontSize: 12 }}>
                      Gesicherter Formularentwurf
                    </Body>
                  )}
                  <ReminderInfo
                    record={counter}
                    status={vm.status}
                    onEdit={() =>
                      router.push({
                        pathname: '/record/edit',
                        params: { id: record.id, counterId: counter.id },
                      })
                    }
                  />
                </View>
                <Icon name="chevron_right" />
              </View>
            </Card>
          ))}
        </>
      )}
    </Page>
  );
}
export function Pager({
  offset,
  total,
  onChange,
}: {
  offset: number;
  total: number;
  onChange(n: number): void;
}) {
  return total > PAGE_SIZE ? (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 8,
      }}
    >
      <IconButton
        icon="chevron_left"
        label="Vorherige Seite"
        disabled={offset === 0}
        onPress={() => onChange(Math.max(0, offset - PAGE_SIZE))}
      />
      <Body>
        Seite {Math.floor(offset / PAGE_SIZE) + 1} von{' '}
        {Math.ceil(total / PAGE_SIZE)}
      </Body>
      <IconButton
        icon="chevron_right"
        label="Nächste Seite"
        disabled={offset + PAGE_SIZE >= total}
        onPress={() => onChange(offset + PAGE_SIZE)}
      />
    </View>
  ) : null;
}
export function RecordDetailScreen() {
  const { id, counterId } = useLocalSearchParams<{
    id: string;
    counterId?: string;
  }>();
  const vm = useRecordDetail(id, false, counterId),
    c = useTheme(),
    feedback = useFeedback();
  const r = vm.record;
  const edit = () =>
    router.push({
      pathname: '/record/edit',
      params: { id, counterId: vm.counterId },
    });
  const capture = () =>
    router.push({
      pathname: '/entry/edit',
      params: { recordId: id, counterId: vm.counterId },
    });
  if (!r)
    return (
      <Page ready={!vm.loading}>
        <Notice error text={vm.error} />
        {vm.loading ? <Busy /> : <Body>Zähler nicht gefunden.</Body>}
      </Page>
    );
  return (
    <Page
      ready={!vm.loading}
      fab={
        <Fab
          title="Erfassen / Fotografieren"
          icon="add_a_photo_outlined"
          onPress={capture}
        />
      }
    >
      <Stack.Screen
        options={{ title: vm.counter ? counterTitle(r, vm.counter) : r.name }}
      />
      <Card onPress={edit} style={{ margin: 4, padding: 17, gap: 0 }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <MachineIcon icon={vm.counter?.icon} />
          <Body
            strong
            style={{
              flex: 1,
              fontSize: 16,
              lineHeight: 24,
              letterSpacing: 0.15,
            }}
          >
            {vm.counter
              ? counterTypeLabel(vm.counter.type)
              : 'Produktionszähler'}
          </Body>
          <Icon name="chevron_right" color={c.muted} />
        </View>
        <Body
          style={{
            marginTop: 14,
            fontFamily: 'RobotoBlack',
            fontSize: 28,
            lineHeight: 36,
            letterSpacing: 0,
          }}
        >
          {entrySummary(vm.entries[0] ?? null)}
        </Body>
        {!!vm.entries[0] && (
          <Body>Zuletzt am {dateTime(vm.entries[0].occurredAt)}</Body>
        )}
        <View style={{ marginTop: 10 }}>
          {vm.counter && !!counterLocation(r, vm.counter) && (
            <Body>Produktionsbereich: {counterLocation(r, vm.counter)}</Body>
          )}
          {!!(r.manufacturer || r.model) && (
            <Body>
              Hersteller / Modell:{' '}
              {[r.manufacturer, r.model].filter(Boolean).join(' · ')}
            </Body>
          )}
          {!!(vm.counter?.number || r.number) && (
            <Body>
              Maschinen-/Zählernummer: {vm.counter?.number || r.number}
            </Body>
          )}
          {!!r.serial && <Body>Seriennummer: {r.serial}</Body>}
          {!!r.installedOn && (
            <Body>
              Inbetriebnahme:{' '}
              {new Date(r.installedOn).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
              })}
            </Body>
          )}
          {!!r.note && <Body>{r.note}</Body>}
          {vm.counter && (
            <ReminderInfo
              record={vm.counter}
              status={vm.status}
              onEdit={edit}
            />
          )}
        </View>
      </Card>
      <View style={{ gap: 12 }}>
        <Button
          secondary
          icon="edit_outlined"
          title="Zähler bearbeiten"
          onPress={edit}
        />
        <Button
          secondary
          danger
          icon="delete_outline"
          title="Zähler löschen"
          disabled={vm.busy}
          onPress={() =>
            void feedback
              .confirm(
                'Zähler löschen?',
                'Dieser Zähler, seine Ablesungen und seine Protokolle werden gelöscht. Andere Zähler und frühere gemeinsame Maschinenprotokolle bleiben erhalten. Exportierte Dateien bleiben bestehen.',
              )
              .then((ok) => {
                if (ok) void vm.remove();
              })
          }
        />
      </View>
      <Notice error text={vm.error} />
      <Reports
        recordId={id}
        counterId={vm.counterId}
        hasAttachments={vm.hasAttachments}
        summary={vm.counter ? counterTitle(r, vm.counter) : r.name}
      />
      <View style={{ marginTop: vm.total > 0 ? 6 : 18, gap: 8 }}>
        <Heading>Zählerverlauf</Heading>
        {vm.total > 0 && (
          <Body style={{ fontFamily: 'RobotoMedium', letterSpacing: 0.1 }}>
            {vm.total === 1
              ? '1 Eintrag'
              : `${vm.entries.length} von ${vm.total} Einträgen`}
          </Body>
        )}
        {!vm.total && (
          <Card
            onPress={capture}
            style={{ margin: 4, padding: 23, gap: 0, alignItems: 'center' }}
          >
            <Icon name="add_a_photo_outlined" size={44} color={c.primary} />
            <Body style={{ marginTop: 10, textAlign: 'center' }}>
              Noch kein Eintrag für diesen Zähler. Erfasse den ersten Stand mit
              Foto oder manuell.
            </Body>
            <View
              style={{
                marginTop: 14,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
              }}
            >
              <Body
                strong
                style={{ color: c.primary, textAlign: 'center', flexShrink: 1 }}
              >
                Ersten Eintrag erfassen
              </Body>
              <Icon name="chevron_right" color={c.primary} />
            </View>
          </Card>
        )}
        <View style={{ gap: 10 }}>
          {vm.historyItems.map((item) => (
            <HistoryTile key={item.entry.id} item={item} />
          ))}
        </View>
      </View>
      {vm.total > PAGE_SIZE && (
        <Button
          secondary
          icon="manage_search_outlined"
          title="Alle Einträge anzeigen"
          onPress={() =>
            router.push({
              pathname: '/record/history',
              params: { id, counterId: vm.counterId },
            })
          }
        />
      )}
    </Page>
  );
}
export function RecordHistoryScreen() {
  const { id, counterId } = useLocalSearchParams<{
    id: string;
    counterId?: string;
  }>();
  const vm = useRecordDetail(id, true, counterId),
    c = useTheme();
  return (
    <Page
      ready={!vm.loading}
      top={
        <View
          style={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: 12,
            gap: 12,
            backgroundColor: c.background,
          }}
        >
          <Body
            style={{
              fontFamily: 'RobotoMedium',
              fontSize: 16,
              lineHeight: 24,
              letterSpacing: 0.15,
            }}
          >
            {vm.record && vm.counter ? counterTitle(vm.record, vm.counter) : ''}
          </Body>
          <Field
            label="Einträge suchen"
            leading="search"
            value={vm.search}
            onChangeText={vm.setSearch}
            trailing={vm.search ? 'close' : undefined}
            onTrailingPress={() => vm.setSearch('')}
          />
        </View>
      }
      bottom={
        <Pager offset={vm.offset} total={vm.total} onChange={vm.setOffset} />
      }
    >
      <Stack.Screen options={{ title: 'Zählerverlauf' }} />
      <Notice error text={vm.error} />
      {vm.loading ? (
        <Busy />
      ) : (
        <View style={{ gap: 8 }}>
          <Body style={{ fontFamily: 'RobotoMedium', letterSpacing: 0.1 }}>
            {vm.total === 0
              ? 'Keine Einträge gefunden'
              : vm.total === 1
                ? vm.search.trim()
                  ? '1 Treffer'
                  : '1 Eintrag'
                : `${vm.offset + 1}–${Math.min(vm.offset + PAGE_SIZE, vm.total)} von ${vm.total} ${vm.search.trim() ? 'Treffern' : 'Einträgen'}`}
          </Body>
          <View style={{ gap: 10 }}>
            {vm.historyItems.map((item) => (
              <HistoryTile key={item.entry.id} item={item} />
            ))}
          </View>
        </View>
      )}
    </Page>
  );
}
