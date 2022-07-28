export enum Security {
  unsecure = 0,
  secure = 1,
}

export enum Transport {
  Ble = 'ble',
  Softap = 'softap',
}

export interface BleDevice {
  advertisementData: [];
  deviceName: string;
  proofOfPossession: string;
  security: Security;
  softAPPassword: string;
  transport: Transport;
}

export enum Auth {
  Open = 0,
  Wep = 1,
  WpaPsk = 2,
  Wpa2Psk = 3,
  WpaWpa2Psk = 4,
  Wpa2Enterprise = 5,
}

export interface WifiNetwork {
  ssid: string;
  channel: number;
  rssi: number;
  auth: Auth;
}

export enum ProvisionStatus {
  Success = 'SUCCESS',
  ConfigurationError = 'CONFIGURATION_ERROR',
  SessionError = 'SESSION_ERROR',
  WifiDisconnected = 'WIFI_DISCONNECTED',
  UnknownError = 'UNKNOWN_ERROR',
}
