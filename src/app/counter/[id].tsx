import { t } from '../../core/localization/runtime';
import { useLocalization } from '../../core/localization/react';
import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useServices } from '../../core/composition';
import { Busy, Notice, Page } from '../../core/ui/components';
export default function CounterRoute() {
  useLocalization();
  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const { machine } = useServices();
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    machine.repository
      .records()
      .then((records) => {
        if (!active) return;
        const record = records.find((r) => r.counters.some((c) => c.id === id));
        if (record)
          router.replace({
            pathname: '/record/[id]',
            params: { id: record.id, counterId: id },
          });
        else setError(t('dieserZaehlerWurdeNichtGefunden'));
      })
      .catch(() => {
        if (active) setError(t('derZaehlerKonnteNichtGeladenWerden'));
      });
    return () => {
      active = false;
    };
  }, [id, machine]);
  return (
    <Page ready={!!error}>
      {error ? <Notice error text={error} /> : <Busy />}
    </Page>
  );
}
