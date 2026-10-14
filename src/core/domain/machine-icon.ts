// Stable IDs are stored in SQLite, backups and Android reminder state.
export const machineIconIds = [
  'machine',
  'factory',
  'tools',
  'packaging',
  'printer',
  'pump',
  'agriculture',
  'transport',
] as const;

export type MachineIconId = (typeof machineIconIds)[number];
export const defaultMachineIcon: MachineIconId = 'machine';

export function machineIconId(value?: string): MachineIconId {
  return machineIconIds.find((id) => id === value) ?? defaultMachineIcon;
}
