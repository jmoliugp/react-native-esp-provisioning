import { NativeModules, Platform } from 'react-native';
import type { BleDevice, ProvisionStatus, WifiNetwork } from 'src/entities';

const LINKING_ERROR =
  `The package 'react-native-esp-provisioning' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: '' }) +
  '- You rebuilt the app after installing the package\n' +
  '- You are not using Expo managed workflow\n';

const EspProvisioning = NativeModules.EspProvisioning
  ? NativeModules.EspProvisioning
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      }
    );

export enum ResultOfOperation {
  SUCCESS = 'Connection success',
}

export function getBleDevices(prefix: String): Promise<BleDevice[]> {
  return EspProvisioning.getBleDevices(prefix);
}

export function scanWifi(rawEspDevice: BleDevice): Promise<WifiNetwork[]> {
  return EspProvisioning.scanWifi(rawEspDevice);
}

export function provision(
  rawEspDevice: BleDevice,
  ssid: string,
  passPhrase: string
): Promise<ProvisionStatus> {
  return EspProvisioning.provision(rawEspDevice, ssid, passPhrase);
}
