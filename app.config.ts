import type { ExpoConfig } from 'expo/config';

const config: ExpoConfig = {
  name: 'MaschinenLog Dev',
  slug: 'maschinenlog',
  version: '1.0.0',
  scheme: 'maschinenlog',
  orientation: 'default',
  userInterfaceStyle: 'automatic',
  backgroundColor: '#006B63',
  platforms: ['android'],
  icon: './assets/icon.png',
  android: {
    package: 'com.appfactory.maschinenlog',
    versionCode: 5,
    allowBackup: false,
    adaptiveIcon: {
      foregroundImage: './assets/icon-foreground.png',
      backgroundColor: '#006B63',
    },
    permissions: [
      'android.permission.CAMERA',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.SCHEDULE_EXACT_ALARM',
      'android.permission.VIBRATE',
    ],
    blockedPermissions: [
      'android.permission.RECORD_AUDIO',
      'android.permission.READ_MEDIA_AUDIO',
      'android.permission.READ_MEDIA_VIDEO',
    ],
  },
  plugins: [
    'expo-router',
    'expo-sqlite',
    'expo-dev-client',
    // Android mods unwind in reverse order. Our final theme overrides must
    // run after expo-splash-screen has generated Theme.App.SplashScreen.
    './plugins/with-machine-android',
    [
      'expo-splash-screen',
      {
        image: './assets/icon-foreground.png',
        // The existing adaptive icon includes safe space around the gear.
        imageWidth: 288,
        resizeMode: 'contain',
        backgroundColor: '#006B63',
        dark: { backgroundColor: '#006B63' },
      },
    ],
    'expo-font',
    'expo-asset',
    'expo-sharing',
    ['expo-image-picker', { microphonePermission: false }],
  ],
};
export default config;
