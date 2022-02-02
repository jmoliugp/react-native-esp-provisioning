import ESPProvision

class EspDevice {
  static let shared = EspDevice()
  var espDevice: ESPDevice?
  func setDevice(device: ESPDevice) {
    self.espDevice = device
  }
}

@objc(EspProvisioning)
class EspProvisioning: NSObject {
    var bleDevices:[ESPDevice]?

    @objc(multiply:withB:withResolver:withRejecter:)
    func multiply(a: Float, b: Float, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        resolve(1001)
    }
     
    @objc(helloGreeter:withResolver:withRejecter:) 
    func helloGreeter(greeter: String, resolve:RCTPromiseResolveBlock,reject:RCTPromiseRejectBlock) -> Void {
        let greet = "Hello \(greeter)!" 
        resolve(greet)
    }
    
    // Searches for BLE devices with a name starting with the given prefix.
    // The prefix must match the string in '/main/app_main.c'
    // Resolves to an array of BLE devices
    @objc(getBleDevices:withResolver:withRejecter:)
    func getBleDevices(prefix: String, resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) -> Void {
      // Check permissions

      // Search for BLE devices (ESPProvisionManager.searchESPDevices())
      ESPProvisionManager.shared.searchESPDevices(devicePrefix:prefix, transport:.ble) { bleDevices, error in
        DispatchQueue.main.async {
          if bleDevices == nil {
            let error = NSError(domain: "getBleDevices", code: 404, userInfo: [NSLocalizedDescriptionKey : "No devices found"])
            reject("404", "getBleDevices", error)

            return
          }

          // TODO: We only return the name of the devices. Do we want to return more (MAC address, RSSI...)?
          let deviceNames = bleDevices!.map {[
            "name": $0.name,
            "address": $0.name
          ]}
          // Return found BLE device names
          resolve(deviceNames)
        }
      }
    }

}
