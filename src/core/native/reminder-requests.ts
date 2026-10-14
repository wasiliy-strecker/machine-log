import type { CounterEvent, Machine } from '../domain/models';
import { machineIconId } from '../domain/machine-icon';
import { counterTitle } from '../domain/production-counter';
import { formatValue } from '../domain/reading-value';

export function reminderRequests(records: Machine[], entries: CounterEvent[]) {
  return records.flatMap((record) =>
    record.counters.flatMap((counter) => {
      if (!counter.reminder) return [];
      const latest = entries
        .filter((entry) => entry.counterId === counter.id)
        .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt))[0];
      return [
        {
          ...counter.reminder,
          recordId: counter.id,
          label: counterTitle(record, counter),
          icon: machineIconId(counter.icon),
          category: 'machine',
          categoryLabel: 'Produktionszähler',
          latestValue: latest ? formatValue(latest.measurement.value) : null,
          latestUnit: latest?.measurement.unit ?? counter.unit,
        },
      ];
    }),
  );
}
