import ESPProvision
import Foundation

class EspDeviceWrapper {
  static let shared = EspDeviceWrapper()
  var espDevice: ESPDevice?
  func setDevice(device: ESPDevice) {
    self.espDevice = device
  }
}

class ErrorMessages {
  static let DEVICE_NOT_FOUND = "Device not found"
  static let NOT_FOUND_DEVICES = "No devices found"
  static let DEFAULT_CONNECTION_ERROR = "Default connection error"

  static func getLocalizedError(domain: String, code: Int, message: String) -> NSError {
    let error = NSError(domain: domain, code: code, userInfo: [NSLocalizedDescriptionKey: message])
    return error
  }

}

@objc(EspProvisioning)
class EspProvisioning: NSObject {
  var bleDevices: [ESPDevice]?
  @objc(getBleDevices:withResolver:withRejecter:)
  func getBleDevices(
    prefix: String, resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {

    ESPProvisionManager.shared.searchESPDevices(devicePrefix: prefix, transport: .ble) {
      bleDevices, error in
      if let _ = error {
        let error = NSError(
          domain: "getBleDevices", code: 404,
          userInfo: [NSLocalizedDescriptionKey: "No devices found"])
        reject("404", "getBleDevices", error)

        return
      }

      let deviceNames = bleDevices!.map { device in
        [
          "deviceName": device.name,
          "security": device.security.rawValue,
          "transport": "\(device.transport)",
          "proofOfPossession": "abcd1234",
          "softAPPassword": "mySoftAppPassword",  // It is not required.
          "advertisementData": [:],
        ]
      }

      resolve(deviceNames)
    }

  }

  func parseRawEspTransport(rawValue: String) -> ESPTransport {
    if rawValue == "ble" {
      return ESPTransport.ble
    } else {
      return ESPTransport.softap
    }
  }

  @objc(scanWifi:withResolver:withRejecter:)
  func scanWifi(
    rawEspDevice: [String: Any], resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    ESPProvisionManager.shared.createESPDevice(
      deviceName: rawEspDevice["deviceName"] as! String,
      transport: parseRawEspTransport(rawValue: rawEspDevice["transport"] as! String),
      security: ESPSecurity(rawValue: rawEspDevice["security"] as! Int)!
    ) { device, error in

      guard let device = device else {
        reject("404", "scanWifi", error)
        return
      }

      device.connect(delegate: self) { status in
        switch status {
        case .connected:
          device.scanWifiList { wifiList, _ in
            if let list = wifiList {
              let wifiNetworks = list.map { network in
                [
                  "ssid": network.ssid,
                  "channel": network.channel,
                  "rssi": network.rssi,
                  "auth": network.auth.rawValue,
                    // bssid
                    // unknownFields
                ]
              }

              resolve(wifiNetworks)
            }
          }
        case let .failedToConnect(error):
          reject("404", "scanWifi", error)
        default:
          reject("404", "scanWifi", NSError(domain: "EspProvisioning", code: 500))
        }
      }
    }
  }

  @objc(provision:ssid:passPhrase:withResolver:withRejecter:)
  func scanWifi(
    rawEspDevice: [String: Any],
    ssid: String,
    passPhrase: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    ESPProvisionManager.shared.createESPDevice(
      deviceName: rawEspDevice["deviceName"] as! String,
      transport: parseRawEspTransport(rawValue: rawEspDevice["transport"] as! String),
      security: ESPSecurity(rawValue: rawEspDevice["security"] as! Int)!
    ) { device, error in

      guard let device = device else {
        reject("404", "provision", error)
        return
      }

      device.connect(delegate: self) { status in
        switch status {
        case .connected:
          device.provision(ssid: ssid, passPhrase: passPhrase) { status in
              switch status {
              case .success:
                resolve("SUCCESS")
              case let .failure(error):
                switch error {
                case .configurationError:
                  resolve("CONFIGURATION_ERROR")
                case .sessionError:
                  resolve("SESSION_ERROR")
                case .wifiStatusDisconnected:
                  resolve("WIFI_DISCONNECTED")
                default:
                  resolve("UNKNOWN_ERROR")
                }
              case .configApplied:
//                resolve("CONFIG_APPLIED")
                  NSLog("configApplied")
              }
          }
        case .failedToConnect(_):
            reject("404", "provision", NSError(domain: "EspProvisioning", code: 501))
        case .disconnected:
            reject("404", "provision", NSError(domain: "EspProvisioning", code: 502))
        }
      }
    }
  }
}

extension EspProvisioning: ESPDeviceConnectionDelegate {
  func getProofOfPossesion(forDevice: ESPDevice, completionHandler: @escaping (String) -> Void) {
    completionHandler("abcd1234")
  }
}
