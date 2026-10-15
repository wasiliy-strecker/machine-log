import type { Counter, Machine } from './models';
import { machineIconId, type MachineIconId } from './machine-icon';
import { counterTypeLabel, counterTypeValue } from './counter-type';

export type CounterDetails = Pick<
  Counter,
  'name' | 'number' | 'type' | 'unit' | 'reminder'
> & {
  location: string;
  icon: MachineIconId;
};

export function counterTitle(record: Machine, counter: Counter): string {
  return record.counters.length > 1
    ? `${record.name} · ${counter.name}`
    : record.name;
}

export function counterLocation(record: Machine, counter: Counter): string {
  return counter.location ?? record.location;
}

export function counterDetails(
  record: Machine,
  counter: Counter,
): CounterDetails {
  return {
    name: record.counters.length > 1 ? counter.name : record.name,
    number: counter.number || record.number,
    type: counterTypeLabel(counter.type),
    unit: counter.unit,
    reminder: counter.reminder,
    location: counterLocation(record, counter),
    icon: machineIconId(counter.icon),
  };
}

export function recordWithCounterDetails(
  record: Machine,
  counterId: string,
  details: CounterDetails,
): Machine {
  if (!record.counters.some((counter) => counter.id === counterId))
    throw new Error('Der Zähler wurde nicht gefunden.');
  return {
    ...record,
    ...(record.counters.length === 1
      ? {
          name: details.name,
          number: details.number,
          location: details.location,
        }
      : {}),
    counters: record.counters.map((counter) =>
      counter.id === counterId
        ? {
            ...counter,
            name: details.name,
            number: details.number,
            type: counterTypeValue(details.type),
            unit: details.unit,
            reminder: details.reminder,
            location: details.location,
            icon: details.icon,
          }
        : counter,
    ),
  };
}
