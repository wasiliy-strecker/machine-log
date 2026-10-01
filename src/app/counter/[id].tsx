import { useEffect, useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { useServices } from '../../core/composition';
import { Busy, Notice, Page } from '../../core/ui/components';
export default function CounterRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
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
        else setError('Dieser Zähler wurde nicht gefunden.');
      })
      .catch(() => {
        if (active) setError('Der Zähler konnte nicht geladen werden.');
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
