import { t } from '../localization/runtime';
import { useLocalization } from '../localization/react';
import { View } from 'react-native';
import { machineIconId, type MachineIconId } from '../domain/machine-icon';
import { Icon, type IconName } from './icon';
import { useTheme } from './components';
export const machineIconOptions = [
  {
    id: 'machine',
    get label() {
      return t('maschine');
    },
    glyph: 'precision_manufacturing',
  },
  {
    id: 'factory',
    get label() {
      return t('fertigung');
    },
    glyph: 'factory',
  },
  {
    id: 'tools',
    get label() {
      return t('werkzeuge');
    },
    glyph: 'construction',
  },
  {
    id: 'packaging',
    get label() {
      return t('verpackung');
    },
    glyph: 'inventory_2',
  },
  {
    id: 'printer',
    get label() {
      return t('drucker');
    },
    glyph: 'print',
  },
  {
    id: 'pump',
    get label() {
      return t('pumpe');
    },
    glyph: 'water_drop',
  },
  {
    id: 'agriculture',
    get label() {
      return t('landmaschine');
    },
    glyph: 'agriculture',
  },
  {
    id: 'transport',
    get label() {
      return t('transport');
    },
    glyph: 'local_shipping',
  },
] as const satisfies readonly {
  id: MachineIconId;
  label: string;
  glyph: IconName;
}[];
export function MachineIcon({ icon }: { icon?: MachineIconId }) {
  useLocalization();
  const c = useTheme();
  const option = machineIconOptions.find((o) => o.id === machineIconId(icon))!;
  return (
    <View
      accessibilityLabel={t('maschinensymbolValue', { p0: option.label })}
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
