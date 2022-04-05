import type { PlatformOSType } from 'react-native';
import { permissionsManager as androidManager } from './android';
import { permissionsManager as iosManager } from './ios';

export const initPermissionsManager = (os: PlatformOSType) =>
  os === 'android' ? androidManager : iosManager;
