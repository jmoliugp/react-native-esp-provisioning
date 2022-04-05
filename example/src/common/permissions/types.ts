interface PermissionsManager {
  checkBLEPermissions: () => Promise<boolean>;
  checkLocationPermissions: () => Promise<boolean>;
  requestBLEPermissions: () => Promise<boolean>;
  requestLocationPermissions: () => Promise<boolean>;
}
