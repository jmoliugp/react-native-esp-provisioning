import { Platform } from 'react-native';
import {
  check,
  checkMultiple,
  PERMISSIONS,
  request,
  requestMultiple,
  RESULTS,
} from 'react-native-permissions';

const checkBLEPermissions = async () => {
  try {
    if (Platform.Version <= 30) {
      const checks = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      return RESULTS.GRANTED === checks;
    }

    const checks = await checkMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    ]);

    return (
      checks[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED &&
      checks[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED &&
      checks[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

const requestBLEPermissions = async () => {
  try {
    if (Platform.Version <= 30) {
      const result = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
      return RESULTS.GRANTED === result;
    }

    const checks = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
      PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    ]);
    return (
      checks[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED &&
      checks[PERMISSIONS.ANDROID.BLUETOOTH_SCAN] === RESULTS.GRANTED &&
      checks[PERMISSIONS.ANDROID.BLUETOOTH_CONNECT] === RESULTS.GRANTED
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

const checkLocationPermissions = async () => {
  try {
    const checks = await checkMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    ]);
    return (
      checks[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED &&
      checks[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

const requestLocationPermissions = async () => {
  try {
    const checks = await requestMultiple([
      PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
      PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION,
    ]);
    return (
      checks[PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION] === RESULTS.GRANTED &&
      checks[PERMISSIONS.ANDROID.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED
    );
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const permissionsManager: PermissionsManager = {
  checkBLEPermissions,
  checkLocationPermissions,
  requestBLEPermissions,
  requestLocationPermissions,
};
