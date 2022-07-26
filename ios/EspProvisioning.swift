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
    static let DEVICE_NOT_FOUND = "Device not found";
    static let NOT_FOUND_DEVICES = "No devices found";
    static let DEFAULT_CONNECTION_ERROR = "Default connection error";

    static func getLocalizedError(domain: String, code: Int, message: String) -> NSError {
        let error = NSError(domain: domain, code: code, userInfo: [NSLocalizedDescriptionKey : message])
        return error
    }

}

@objc(EspProvisioning)
class EspProvisioning: NSObject {
    var bleDevices:[ESPDevice]?
    @objc(getBleDevices:withResolver:withRejecter:)
    func getBleDevices(prefix: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
        
        ESPProvisionManager.shared.searchESPDevices(devicePrefix: prefix, transport: .ble) { bleDevices, error in
            if let _ = error {
              let error = NSError(domain: "getBleDevices", code: 404, userInfo: [NSLocalizedDescriptionKey : "No devices found"])
              reject("404", "getBleDevices", error)

              return
            }
            
            let deviceNames = bleDevices!.map {device in [
              "deviceName": device.name,
              "security": device.security.rawValue,
              "transport": "\(device.transport)",
              "proofOfPossession": "myProofOfPosession", // It is not required.
              "softAPPassword": "mySoftAppPassword", // It is not required.
              "advertisementData": []
            ]}
            
            resolve(deviceNames)
        }

    }
    
    func parseRawEspTransport(rawValue: String) -> ESPTransport {
        if (rawValue == "ble") {
            return ESPTransport.ble
        } else {
            return ESPTransport.softap
        }
    }
    
    func scanDeviceForWiFiList() {
        espDevice.scanWifiList { wifiList, _ in
            if let list = wifiList {
                self.wifiDetailList = list.sorted { $0.rssi > $1.rssi }
            }
        }
    }
    
    @objc(scanWifi:withResolver:withRejecter:)
    func scanWifi(rawEspDevice: [String: Any], resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
      
        let device = ESPDevice(
            name: rawEspDevice["deviceName"] as! String,
            security: ESPSecurity(rawValue: rawEspDevice["security"] as! Int)!,
            transport: parseRawEspTransport(rawValue: rawEspDevice["transport"] as! String),
            proofOfPossession: rawEspDevice["proofOfPossession"] as! String,
            softAPPassword: rawEspDevice["softAPPassword"] as! String,
            advertisementData: rawEspDevice["advertisementData"] as!  [String:Any])
        
        
        device.connect(delegate: self) { status in
            DispatchQueue.main.async {
                Utility.hideLoader(view: self.view)
            }
            switch status {
            case .connected:
                espDevice.scanWifiList { wifiList, _ in
                    if let list = wifiList {
                        let wifiNetworks = list.map {network in [
                          "deviceName": device.name,
                          "security": device.security.rawValue,
                          "transport": "\(device.transport)",
                          "proofOfPossession": "myProofOfPosession", // It is not required.
                          "softAPPassword": "mySoftAppPassword", // It is not required.
                          "advertisementData": []
                        ]}
                        
                        resolve(wifiNetworks)
                    }
                }
            case let .failedToConnect(error):
                DispatchQueue.main.async {
                    var errorDescription = ""
                    switch error {
                    case .securityMismatch, .versionInfoError:
                        errorDescription = error.description
                    default:
                        errorDescription = error.description + "\nCheck if POP is correct."
                    }
                    let action = UIAlertAction(title: "Retry", style: .default, handler: nil)
                    self.showAlert(error: errorDescription, action: action)
                }
            default:
                DispatchQueue.main.async {
                    let action = UIAlertAction(title: "Retry", style: .default, handler: nil)
                    self.showAlert(error: "Device disconnected", action: action)
                }
            }
        }
    }
}




