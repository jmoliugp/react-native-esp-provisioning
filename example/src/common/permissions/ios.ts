import { rationale } from './rationale';
import { check, PERMISSIONS, request, RESULTS } from 'react-native-permissions';

export const checkBLEPermissions = async () => {
  try {
    const checks = await check(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    return RESULTS.GRANTED === checks;
  } catch (e) {
    return false;
  }
};

export const requestBLEPermissions = async () => {
  try {
    const result = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL);
    return RESULTS.GRANTED === result;
  } catch (e) {
    return false;
  }
};

export const checkLocationPermissions = async () => {
  try {
    const checks = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);
    return checks === RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
};

export const requestLocationPermissions = async () => {
  try {
    const checks = await request(
      PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      rationale
    );
    return checks === RESULTS.GRANTED;
  } catch (e) {
    return false;
  }
};

export const permissionsManager: PermissionsManager = {
  checkBLEPermissions,
  checkLocationPermissions,
  requestBLEPermissions,
  requestLocationPermissions,
};
