import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { PermissionsAndroid, Platform } from 'react-native';
import { useServices } from '../../core/composition';
import type { Machine } from '../../core/domain/models';
import {
  counterDetails,
  recordWithCounterDetails,
  type CounterDetails,
} from '../../core/domain/production-counter';
import { useTask } from '../../core/ui/use-task';
import { errorText } from '../../core/ui/components';
import { useFeedback } from '../../core/ui/feedback';
import { useLeaveGuard } from '../../core/ui/use-leave-guard';

export function useRecordEditor(id?: string, counterId?: string) {
  const { machine, refresh } = useServices();
  const feedback = useFeedback();
  const [record, setRecord] = useState<Machine | undefined>(() => {
    if (id) return;
    const now = machine.env.now();
    return {
      id: machine.env.id(),
      name: '',
      category: '',
      number: '',
      location: '',
      manufacturer: '',
      model: '',
      serial: '',
      installedOn: '',
      note: '',
      counters: [
        {
          id: machine.env.id(),
          name: '',
          type: 'pieces',
          unit: 'Stück',
          number: '',
          reminder: null,
        },
      ],
      createdAt: now,
      updatedAt: now,
    };
  });
  const [selectedId, setSelectedId] = useState(
    counterId ?? record?.counters[0]?.id ?? '',
  );
  const [form, setForm] = useState<CounterDetails | undefined>(() =>
    record ? counterDetails(record, record.counters[0]!) : undefined,
  );
  const [initial, setInitial] = useState(() => JSON.stringify(form));
  const task = useTask();
  const { setError } = task;
  useEffect(() => {
    if (!id) return;
    let active = true;
    machine.repository
      .records()
      .then((records) => {
        if (!active) return;
        const found = records.find((r) => r.id === id);
        const counter = counterId
          ? found?.counters.find((c) => c.id === counterId)
          : found?.counters[0];
        if (!found || !counter)
          throw new Error('Der Zähler wurde nicht gefunden.');
        const details = counterDetails(found, counter);
        setRecord(found);
        setSelectedId(counter.id);
        setForm(details);
        setInitial(JSON.stringify(details));
      })
      .catch((error) => {
        if (active) setError(errorText(error));
      });
    return () => {
      active = false;
    };
  }, [machine, id, counterId, setError]);
  const dirty = !!form && JSON.stringify(form) !== initial;
  const leave = useLeaveGuard({
    dirty,
    busy: task.busy,
    discard: async () => {},
    title: id ? 'Änderungen verwerfen?' : 'Eingaben verwerfen?',
  });
  function change<K extends keyof CounterDetails>(
    key: K,
    value: CounterDetails[K],
  ) {
    setForm((current) => current && { ...current, [key]: value });
  }
  return {
    form,
    dirty,
    change,
    ...task,
    save: () =>
      task.run(async () => {
        if (!record || !form) return;
        if (
          form.reminder &&
          Platform.OS === 'android' &&
          Number(Platform.Version) >= 33
        )
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        const warnings = id
          ? await machine.saveCounter(record.id, selectedId, form)
          : await machine.saveRecord(
              recordWithCounterDetails(record, selectedId, form),
            );
        refresh();
        leave(() => {
          const target = {
            pathname: '/record/[id]' as const,
            params: { id: record.id, counterId: selectedId },
          };
          if (id) router.dismissTo(target);
          else router.replace(target);
        });
        feedback.notify(
          warnings.join('\n') ||
            (id
              ? 'Änderungen gespeichert.'
              : 'Zähler gespeichert. Als Nächstes kannst du den ersten Stand erfassen.'),
        );
      }),
  };
}
