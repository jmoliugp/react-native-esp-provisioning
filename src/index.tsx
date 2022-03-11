import { NativeModules, Platform } from 'react-native';
import type { BleDevice } from 'src/types';

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

export function getBleDevices(prefix: String): Promise<BleDevice[]> {
  return EspProvisioning.getBleDevices(prefix);
}

export function provideProofOfPoss(proofOfPoss: String): Promise<String> {
  return EspProvisioning.provideProofOfPoss(proofOfPoss);
}

export function createDevice(name: String): Promise<String> {
  return EspProvisioning.createDevice(name);
}

export function connectDevice(): Promise<String> {
  return EspProvisioning.connectDevice();
}
