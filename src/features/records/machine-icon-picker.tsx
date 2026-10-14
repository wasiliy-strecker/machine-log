import { Pressable, View } from 'react-native';
import { type MachineIconId } from '../../core/domain/machine-icon';
import { Body, Card, useTheme } from '../../core/ui/components';
import { Icon } from '../../core/ui/icon';
import { machineIconOptions } from '../../core/ui/machine-icon';

export function MachineIconPicker({
  value,
  disabled,
  onChange,
}: {
  value: MachineIconId;
  disabled: boolean;
  onChange(value: MachineIconId): void;
}) {
  const c = useTheme();
  const selectedLabel = machineIconOptions.find(
    (option) => option.id === value,
  )!.label;
  return (
    <Card>
      <Body strong>Maschinensymbol</Body>
      <Body muted>
        Das Symbol erscheint in der Übersicht, bei Ablesungen und in
        Erinnerungsnachrichten.
      </Body>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {machineIconOptions.map((option) => {
          const selected = option.id === value;
          return (
            <Pressable
              key={option.id}
              accessibilityRole="radio"
              accessibilityLabel={`Maschinensymbol: ${option.label}`}
              accessibilityState={{ selected, checked: selected, disabled }}
              disabled={disabled}
              onPress={() => onChange(option.id)}
              style={({ pressed }) => ({
                flexBasis: '22%',
                flexGrow: 1,
                minHeight: 56,
                paddingVertical: 10,
                paddingHorizontal: 2,
                borderRadius: 14,
                borderWidth: 2,
                borderColor: selected ? c.primary : c.border,
                backgroundColor: selected ? c.secondaryContainer : c.card,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: disabled ? 0.5 : pressed ? 0.7 : 1,
              })}
            >
              <Icon
                name={option.glyph}
                size={28}
                color={selected ? c.primary : c.muted}
              />
            </Pressable>
          );
        })}
      </View>
      <Body strong>Ausgewählt: {selectedLabel}</Body>
    </Card>
  );
}
