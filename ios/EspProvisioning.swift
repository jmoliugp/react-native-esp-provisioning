import ESPProvision

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

          resolve(deviceNames)
        }
      }
    }
    
    private var connectionDelegate: EPConnectionDelegate?
    
    @objc(connectDevice:withResolver:withRejecter:)
    func connectDevice(successCallback: @escaping RCTResponseSenderBlock, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        let delegate = EPConnectionDelegate()
        
        guard let espDevice = EspDeviceWrapper.shared.espDevice else {
            reject("ESP_DEVICE_NOT_CONNECTED", "There is not an instance of ESPDevice set", nil)
            return
        }
        
        var completedFlag = false
        
        self.connectionDelegate = delegate
        espDevice.connect(delegate: delegate) { status in
            dump(status)
            if(!completedFlag) {
              completedFlag = true
              switch(status) {
              case .connected:
                  resolve("connected")
              case .failedToConnect(_):
                  // Possibly the arg is an error, check on this.
                  reject("FAILED_TO_CONNECT", "Connection failed", nil)
              case .disconnected:
                  resolve("disconnected")
              @unknown default:
                  resolve(status)
              }
            }
        }
    }

    @objc(provideProofOfPoss:withResolver:withRejecter:)
    func provideProofOfPoss(proofString: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) {
        
        guard let delegate = self.connectionDelegate else {
            reject("ESP_DEVICE_NOT_CONNECTED", "There is not an instance of ESPDevice set", nil)
            return
        }
        
        delegate.proofString = proofString
        resolve("Proof of possesion set succesfully")
    }
    
    @objc(connectToDevice:deviceProofOfPossession:withResolver:withRejecter:)
    func connectToDevice(deviceAddress: String, deviceProofOfPossession: String, resolve: @escaping RCTPromiseResolveBlock, rejecter reject: @escaping RCTPromiseRejectBlock) -> Void {

        let errorCode = 404
        let errorDomain = "connectToDevice"

        ESPProvisionManager.shared.createESPDevice(deviceName: deviceAddress, transport: .ble, security: .unsecure, proofOfPossession: deviceProofOfPossession, completionHandler: { device, _ in
            if device == nil {

                reject("\(errorCode)", errorDomain + "Device nil", ErrorMessages.getLocalizedError(domain: errorDomain, code: errorCode, message: ErrorMessages.DEVICE_NOT_FOUND))

                return
            }

            let espDevice: ESPDevice = device!
            EspDeviceWrapper.shared.setDevice(device: espDevice)

            espDevice.connect(completionHandler: { status in

                switch status {
                case .connected:
                    resolve("Connection success")
                case let .failedToConnect(error):
                    reject("\(error.code)", error.description, error)
                default:
                    reject("\(errorCode)", errorDomain + "Common error", ErrorMessages.getLocalizedError(domain: errorDomain, code: errorCode, message: ErrorMessages.DEFAULT_CONNECTION_ERROR))
                }
            })
        })
    }
}





class EPConnectionDelegate: NSObject, ESPDeviceConnectionDelegate {
    var proofString: String?
    override init() {}

    func getProofOfPossesion(forDevice device: ESPDevice, completionHandler: @escaping (String) -> Void) {
      //  if EspDeviceWrapper.shared.espDevice.name != device.name {
      //      print("Not the device I expect")
      //      completionHandler("")
      //      return
      //  }
        guard let proofString = self.proofString else {
            print("No proof string specified")
            completionHandler("")
            return
        }

        completionHandler(proofString)
    }
}
