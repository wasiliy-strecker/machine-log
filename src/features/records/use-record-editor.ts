import { useEffect, useState } from 'react';
import { router } from 'expo-router';
import { PermissionsAndroid, Platform } from 'react-native';
import { useServices } from '../../core/composition';
import type { Machine, Counter } from '../../core/domain/models';
import { useTask } from '../../core/ui/use-task';
import { errorText } from '../../core/ui/components';
import { useFeedback } from '../../core/ui/feedback';
import { useLeaveGuard } from '../../core/ui/use-leave-guard';
import { categorySuggestions } from './presentation-model';
export function useRecordEditor(id?: string) {
  const { machine, refresh } = useServices();
  const feedback = useFeedback();
  const [record, setRecord] = useState<Machine | undefined>(() => {
    if (id) return;
    const now = machine.env.now();
    return {
      id: machine.env.id(),
      name: '',
      category: 'Fertigung',
      number: '',
      location: '',
      manufacturer: '',
      model: '',
      serial: '',
      installedOn: '',
      note: '',
      counters: [newCounter(machine.env.id())],
      createdAt: now,
      updatedAt: now,
    };
  });
  const [initial, setInitial] = useState(() => JSON.stringify(record));
  const [initialReady, setReady] = useState(!id);
  const [suggestions, setSuggestions] = useState(() => categorySuggestions([]));
  const [technicalExpanded, setTechnicalExpanded] = useState(false);
  const task = useTask();
  const { setError } = task;
  useEffect(() => {
    let active = true;
    machine.repository
      .records()
      .then((records) => {
        if (!active) return;
        setSuggestions(categorySuggestions(records));
        if (id) {
          const found = records.find((r) => r.id === id);
          if (!found) throw new Error('Die Maschine wurde nicht gefunden.');
          setRecord(found);
          setInitial(JSON.stringify(found));
          setReady(true);
          setTechnicalExpanded(
            !!(found.manufacturer || found.model || found.serial),
          );
        }
      })
      .catch((e) => {
        if (active) setError(errorText(e));
      });
    return () => {
      active = false;
    };
  }, [machine, id, setError]);
  const dirty = initialReady && JSON.stringify(record) !== initial;
  const leave = useLeaveGuard({
    dirty,
    busy: task.busy,
    discard: async () => {},
    title: id ? 'Änderungen verwerfen?' : 'Eingaben verwerfen?',
  });
  function change<K extends keyof Machine>(key: K, value: Machine[K]) {
    setRecord((current) => current && { ...current, [key]: value });
  }
  return {
    record,
    dirty,
    change,
    categorySuggestions: suggestions,
    technicalExpanded,
    toggleTechnical: () => setTechnicalExpanded((expanded) => !expanded),
    ...task,
    addCounter: () => {
      if (record)
        change('counters', [...record.counters, newCounter(machine.env.id())]);
    },
    save: () =>
      task.run(async () => {
        if (!record) return;
        if (
          record.counters.some((c) => c.reminder) &&
          Platform.OS === 'android' &&
          Number(Platform.Version) >= 33
        )
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          );
        const warnings = await machine.saveRecord(record);
        refresh();
        leave(() => {
          if (id)
            router.dismissTo({
              pathname: '/record/[id]',
              params: { id: record.id },
            });
          else
            router.replace({
              pathname: '/record/[id]',
              params: { id: record.id },
            });
        });
        feedback.notify(
          warnings.join('\n') ||
            (id
              ? 'Änderungen an der Maschine gespeichert.'
              : 'Maschine gespeichert. Als Nächstes kannst du den ersten Eintrag erfassen.'),
        );
      }),
  };
}

function newCounter(id: string): Counter {
  return {
    id,
    name: 'Produktionszähler',
    type: 'pieces',
    unit: 'Stück',
    number: '',
    reminder: null,
  };
}
