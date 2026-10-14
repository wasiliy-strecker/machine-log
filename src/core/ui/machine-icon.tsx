import { View } from 'react-native';
import { machineIconId, type MachineIconId } from '../domain/machine-icon';
import { Icon, type IconName } from './icon';
import { useTheme } from './components';

export const machineIconOptions = [
  { id: 'machine', label: 'Maschine', glyph: 'precision_manufacturing' },
  { id: 'factory', label: 'Fertigung', glyph: 'factory' },
  { id: 'tools', label: 'Werkzeuge', glyph: 'construction' },
  { id: 'packaging', label: 'Verpackung', glyph: 'inventory_2' },
  { id: 'printer', label: 'Drucker', glyph: 'print' },
  { id: 'pump', label: 'Pumpe', glyph: 'water_drop' },
  { id: 'agriculture', label: 'Landmaschine', glyph: 'agriculture' },
  { id: 'transport', label: 'Transport', glyph: 'local_shipping' },
] as const satisfies readonly {
  id: MachineIconId;
  label: string;
  glyph: IconName;
}[];

export function MachineIcon({ icon }: { icon?: MachineIconId }) {
  const c = useTheme();
  const option = machineIconOptions.find((o) => o.id === machineIconId(icon))!;
  return (
    <View
      accessibilityLabel={`Maschinensymbol: ${option.label}`}
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: c.secondaryContainer,
        alignItems: 'center',
        justifyContent: 'center',
        alignSelf: 'flex-start',
      }}
    >
      <Icon name={option.glyph} color={c.onSecondaryContainer} />
    </View>
  );
}
