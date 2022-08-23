import { NativeModules } from 'react-native';
import type { BleDevice, ProvisionStatus, WifiNetwork } from 'src/entities';

const LINKING_ERROR =
  "The package 'react-native-esp-provisioning' doesn't seem to be linked. Make sure the gradle dependencies are properly configured";

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

export function getBleDevices(prefix: String): Promise<BleDevice[]> {
  return EspProvisioning.getBleDevices(prefix);
}

export function scanWifi(
  uuid: String,
  address: String
): Promise<WifiNetwork[]> {
  return EspProvisioning.scanWifi(address, uuid);
}

export function provision(
  uuid: String,
  address: String,
  ssid: string,
  passPhrase: string
): Promise<ProvisionStatus> {
  return EspProvisioning.provision(address, uuid, ssid, passPhrase);
}
