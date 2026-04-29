import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dataghost.app',
  appName: 'DataGhost',
  webDir: 'www',
  plugins: {
    StatusBar: {
      style: 'dark',
      backgroundColor: '#0a0c10'
    },
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0a0c10',
      showSpinner: false
    }
  }
};

export default config;
