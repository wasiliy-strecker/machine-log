import { createContext, useContext, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import { StartupError, StartupPending } from '../startup/startup';
export const light = {
  background: '#F0F5F3',
  card: '#FAFDFB',
  input: '#E4EFEB',
  ink: '#16201D',
  muted: '#414A46',
  primary: '#006B63',
  onPrimary: '#FFFFFF',
  soft: '#BCECE2',
  onSoft: '#004E46',
  secondaryContainer: '#D4E8E1',
  onSecondaryContainer: '#344A43',
  errorContainer: '#FFDAD6',
  onErrorContainer: '#93000A',
  border: '#BDCEC7',
  outline: '#6F7A74',
  danger: '#BA1A1A',
  onDanger: '#FFFFFF',
  elevated: '#E3EAE6',
  disabled: '#D5DDD8',
  dark: false,
};
export const dark: typeof light = {
  background: '#141D1B',
  card: '#202D29',
  input: '#101916',
  ink: '#DFE5E0',
  muted: '#BECAC2',
  primary: '#87D5C6',
  onPrimary: '#003731',
  soft: '#004E46',
  onSoft: '#BCECE2',
  secondaryContainer: '#344A43',
  onSecondaryContainer: '#D4E8E1',
  errorContainer: '#93000A',
  onErrorContainer: '#FFDAD6',
  border: '#42564E',
  outline: '#88968E',
  danger: '#FFB4AB',
  onDanger: '#690005',
  elevated: '#26342E',
  disabled: '#2E3C35',
  dark: true,
};
const ThemeContext = createContext(light);
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [attempt, setAttempt] = useState(0);
  return (
    <FontThemeProvider key={attempt} retry={() => setAttempt((n) => n + 1)}>
      {children}
    </FontThemeProvider>
  );
}
function FontThemeProvider({
  children,
  retry,
}: {
  children: ReactNode;
  retry(): void;
}) {
  const scheme = useColorScheme();
  const [loaded, error] = useFonts({
    Roboto: require('../../../assets/ui/Roboto-Regular.ttf'),
    RobotoMedium: require('../../../assets/ui/Roboto-Medium.ttf'),
    RobotoBold: require('../../../assets/ui/Roboto-Bold.ttf'),
    RobotoBlack: require('../../../assets/ui/Roboto-Black.ttf'),
    MaterialIcons: require('../../../assets/ui/MaterialIcons-Regular.otf'),
  });
  if (error)
    return (
      <StartupError
        message="Die Schriftarten konnten nicht geladen werden."
        retry={retry}
      />
    );
  if (!loaded) return <StartupPending />;
  return (
    <ThemeContext.Provider value={scheme === 'dark' ? dark : light}>
      {children}
    </ThemeContext.Provider>
  );
}
export const useTheme = () => useContext(ThemeContext);
