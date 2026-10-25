import { useEffect, type ReactNode } from 'react';
import { AppState } from 'react-native';
import { machineNative } from '../native/machine-native';
import { setLocalization } from './runtime';

// Native preferences are synchronous and available before the first React render.
setLocalization(machineNative.getLocalization());

export function LocalizationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const refresh = () => setLocalization(machineNative.getLocalization());
    refresh();
    const native = machineNative.addListener('localizationChanged', refresh);
    const foreground = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => {
      native.remove();
      foreground.remove();
    };
  }, []);
  return children;
}
