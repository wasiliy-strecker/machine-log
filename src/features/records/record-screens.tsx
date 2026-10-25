import { t, localization } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
import { FlatList, View, Text, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  dashboardCount,
  entrySummary,
  reminderSummary,
  sortLabels,
  type RecordSort,
  type DashboardItem,
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
  useLocalization();
  const c = useTheme();
  const r = record.reminder;
  const s = status?.schedules.find((s) => s.recordId === record.id);
  if (!r && s?.planningState !== 'cancelFailed') return null;
  return (
    <View style={{ gap: 6 }}>
      {r && (
        <Body strong style={{ fontSize: 12 }}>
          {t('erinnern') + ' '}
          {reminderSummary(r)}
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
          {t('letzteErinnerung')}{' '}
          {s?.lastTriggeredAtMillis
            ? t('value', { p0: dateTime(s.lastTriggeredAtMillis) })
            : t('nochKeine')}
        </Body>
      </View>
    </View>
  );
}
type DashboardHeaderProps = Pick<
  ReturnType<typeof useRecords>,
  'search' | 'setSearch' | 'sort' | 'setSort' | 'error' | 'retry'
> & {
  count: number;
};
// Keep the header component type stable so typing never remounts its input.
function DashboardHeader({
  search,
  setSearch,
  sort,
  setSort,
  count,
  error,
  retry,
}: DashboardHeaderProps) {
  useLocalization();
  const feedback = useFeedback();
  return (
    <View style={{ gap: 12, paddingBottom: 12 }}>
      {!!error && (
        <>
          <Notice error text={error} />
          <Button title={t('reload')} onPress={retry} />
        </>
      )}
      <Title
        subtitle={t(
          'zaehlerstaendeErfassenUndProduktionszuwaechseNachvollziehen',
        )}
      >
        {t('deineProduktionszaehler')}
      </Title>
      <View style={{ marginTop: 4 }}>
        <Field
          label={t('searchMeters')}
          leading="search"
          value={search}
          onChangeText={setSearch}
          trailing={search ? 'close' : undefined}
          onTrailingPress={() => setSearch('')}
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
        <Body muted>{dashboardCount(count, !!search.trim())}</Body>
        <Button
          secondary
          icon="sort"
          menu
          title={sortLabels[sort]}
          onPress={(anchor) =>
            void feedback
              .choose({
                title: t('zaehlerSortieren'),
                anchor,
                options: (Object.keys(sortLabels) as RecordSort[]).map(
                  (value) => ({
                    value,
                    label: sortLabels[value],
                    icon: value === sort ? 'check' : undefined,
                  }),
                ),
              })
              .then((value) => {
                if (value) setSort(value as RecordSort);
              })
          }
        />
      </View>
    </View>
  );
}
function DashboardCard({
  item,
  hasDraft,
  status,
}: {
  item: DashboardItem;
  hasDraft: boolean;
  status?: ReminderStatus;
}) {
  useLocalization();
  const { record, counter, latest, lastEdited } = item;
  const c = useTheme();
  return (
    <Card
      onPress={() =>
        router.push({
          pathname: '/record/[id]',
          params: { id: record.id, counterId: counter.id },
        })
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View style={{ flex: 1, gap: 4 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <MachineIcon icon={counter.icon} />
            <Body strong style={{ flex: 1, fontSize: 16, lineHeight: 24 }}>
              {counterTitle(record, counter)}
            </Body>
            {status?.schedules.find((s) => s.recordId === counter.id)
              ?.isNotificationActive && (
              <View
                accessibilityLabel={t('aktiveAbleseerinnerung')}
                style={{
                  backgroundColor: c.danger,
                  borderRadius: 10,
                  paddingHorizontal: 5,
                }}
              >
                <Text style={{ color: c.background, fontSize: 11 }}>1</Text>
              </View>
            )}
          </View>
          <Body muted>
            {[counterTypeLabel(counter.type), counterLocation(record, counter)]
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
            {t('zuletztBearbeitet') + ' '}
            {dateTime(lastEdited)}
          </Body>
          {hasDraft && (
            <Body muted style={{ fontSize: 12 }}>
              {t('gesicherterFormularentwurf')}
            </Body>
          )}
          <ReminderInfo
            record={counter}
            status={status}
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
  );
}
function CounterSeparator() {
  useLocalization();
  return <View style={{ height: 12 }} />;
}
const dashboardKey = (item: DashboardItem) => item.counter.id;
export function RecordsScreen() {
  useLocalization();
  const vm = useRecords(),
    c = useTheme(),
    safe = useSafeAreaInsets(),
    { fontScale } = useWindowDimensions();
  const create = () => router.push('/record/edit');
  const showList = !vm.loading && !vm.empty;
  return (
    <Page
      ready={!vm.loading}
      scroll={!showList}
      fab={<Fab title={t('addMeter')} onPress={create} />}
    >
      {vm.loading ? (
        <Busy label={t('produktionszaehlerWerdenGeladen')} />
      ) : vm.error && vm.empty ? (
        <>
          <Notice error text={vm.error} />
          <Button title={t('reload')} onPress={vm.retry} />
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
          <Title>{t('erstenProduktionszaehlerAnlegen')}</Title>
          <Body style={{ textAlign: 'center' }}>
            {t(
              'dokumentiereProduktionsstaendeDeinerMaschinenErfasseStueckzahlenZyklenBetriebsstundenUndMengenM',
            )}
          </Body>
        </View>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 8,
            paddingBottom: Math.max(112, 56 * fontScale + 48) + safe.bottom,
            width: '100%',
            maxWidth: 800,
            alignSelf: 'center',
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={vm.items}
          keyExtractor={dashboardKey}
          ListHeaderComponent={
            <DashboardHeader
              search={vm.search}
              setSearch={vm.setSearch}
              sort={vm.sort}
              setSort={vm.setSort}
              count={vm.items.length}
              error={vm.error}
              retry={vm.retry}
            />
          }
          ListEmptyComponent={
            <Card>
              <Icon name="search" size={42} color={c.primary} />
              <Body>{t('noMatchingMetersFound')}</Body>
            </Card>
          }
          ItemSeparatorComponent={CounterSeparator}
          renderItem={({ item }) => (
            <DashboardCard
              item={item}
              hasDraft={vm.drafts.some((d) => d.counterId === item.counter.id)}
              status={vm.status}
            />
          )}
        />
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
  useLocalization();
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
        label={t('vorherigeSeite')}
        disabled={offset === 0}
        onPress={() => onChange(Math.max(0, offset - PAGE_SIZE))}
      />
      <Body>
        {t('page') + ' '}
        {Math.floor(offset / PAGE_SIZE) + 1} von {Math.ceil(total / PAGE_SIZE)}
      </Body>
      <IconButton
        icon="chevron_right"
        label={t('naechsteSeite')}
        disabled={offset + PAGE_SIZE >= total}
        onPress={() => onChange(offset + PAGE_SIZE)}
      />
    </View>
  ) : null;
}
export function RecordDetailScreen() {
  useLocalization();
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
        {vm.loading ? <Busy /> : <Body>{t('meterNotFound')}</Body>}
      </Page>
    );
  return (
    <Page
      ready={!vm.loading}
      fab={
        <Fab
          title={t('erfassenFotografieren')}
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
              : t('produktionszaehler')}
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
          <Body>
            {t('zuletztAm') + ' '}
            {dateTime(vm.entries[0].occurredAt)}
          </Body>
        )}
        <View style={{ marginTop: 10 }}>
          {vm.counter && !!counterLocation(r, vm.counter) && (
            <Body>
              {t('produktionsbereich') + ' '}
              {counterLocation(r, vm.counter)}
            </Body>
          )}
          {!!(r.manufacturer || r.model) && (
            <Body>
              {t('herstellerModell')}{' '}
              {[r.manufacturer, r.model].filter(Boolean).join(' · ')}
            </Body>
          )}
          {!!(vm.counter?.number || r.number) && (
            <Body>
              {t('maschinenZaehlernummer') + ' '}
              {vm.counter?.number || r.number}
            </Body>
          )}
          {!!r.serial && (
            <Body>
              {t('seriennummer') + ' '}
              {r.serial}
            </Body>
          )}
          {!!r.installedOn && (
            <Body>
              {t('inbetriebnahme')}{' '}
              {new Date(r.installedOn).toLocaleDateString(
                localization().formatLocale,
                {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                },
              )}
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
          title={t('editMeter')}
          onPress={edit}
        />
        <Button
          secondary
          danger
          icon="delete_outline"
          title={t('deleteMeter')}
          disabled={vm.busy}
          onPress={() =>
            void feedback
              .confirm(
                t('deleteMeter668'),
                t(
                  'dieserZaehlerSeineAblesungenUndSeineProtokolleWerdenGeloeschtAndereZaehlerUndFruehereGemeinsame',
                ),
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
        <Heading>{t('meterHistory')}</Heading>
        {vm.total > 0 && (
          <Body style={{ fontFamily: 'RobotoMedium', letterSpacing: 0.1 }}>
            {vm.total === 1
              ? t('1Entry')
              : t('valueOfValueEntries', {
                  p0: vm.entries.length,
                  p1: vm.total,
                })}
          </Body>
        )}
        {!vm.total && (
          <Card
            onPress={capture}
            style={{ margin: 4, padding: 23, gap: 0, alignItems: 'center' }}
          >
            <Icon name="add_a_photo_outlined" size={44} color={c.primary} />
            <Body style={{ marginTop: 10, textAlign: 'center' }}>
              {t(
                'nochKeinEintragFuerDiesenZaehlerErfasseDenErstenStandMitFotoOderManuell',
              )}
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
                {t('addFirstEntry')}
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
          title={t('showAllEntries')}
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
  useLocalization();
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
            label={t('searchEntries')}
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
      <Stack.Screen options={{ title: t('meterHistory') }} />
      <Notice error text={vm.error} />
      {vm.loading ? (
        <Busy />
      ) : (
        <View style={{ gap: 8 }}>
          <Body style={{ fontFamily: 'RobotoMedium', letterSpacing: 0.1 }}>
            {vm.total === 0
              ? t('keineEintraegeGefunden')
              : vm.total === 1
                ? vm.search.trim()
                  ? t('1Result')
                  : t('1Entry')
                : t('valueValueOfValueValue', {
                    p0: vm.offset + 1,
                    p1: Math.min(vm.offset + PAGE_SIZE, vm.total),
                    p2: vm.total,
                    p3: vm.search.trim() ? t('results') : t('entries'),
                  })}
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
