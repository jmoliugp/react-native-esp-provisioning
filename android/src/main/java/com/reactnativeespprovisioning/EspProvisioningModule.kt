import android.Manifest
import android.bluetooth.BluetoothDevice
import android.content.pm.PackageManager
import android.bluetooth.le.ScanResult
import android.os.ParcelUuid
import com.espressif.provisioning.listeners.BleScanListener

import androidx.core.app.ActivityCompat
import android.util.Log
import com.espressif.provisioning.*

import com.espressif.provisioning.listeners.WiFiScanListener
import com.facebook.react.bridge.*
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.ThreadMode

import org.greenrobot.eventbus.Subscribe




class EspProvisioningModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "EspProvisioning"
  }

  // Example method
  // See https://reactnative.dev/docs/native-modules-android
  @ReactMethod
  fun multiply(a: Int, b: Int, promise: Promise) {
    promise.resolve(a * b)
  }

  private val foundBLEDevices = HashMap<String, BleDevice>();

  @ReactMethod
  fun getBleDevices(prefix: String, promise: Promise) {
    // TODO: CHECK IF I NEED ALSO TO CHECK ANDROID 12 AND DIFFERENT VERSIONS
    if (ActivityCompat.checkSelfPermission(
        reactApplicationContext,
        Manifest.permission.ACCESS_FINE_LOCATION
      ) != PackageManager.PERMISSION_GRANTED
    ) {
      Log.e("ESPProvisioning", "## getBleDevices - Location Permission denied")
      promise.reject("500", "Location Permission denied")
      return;
    }

    // Search for BLE devices
    ESPProvisionManager.getInstance(reactApplicationContext).searchBleEspDevices(prefix, object :
      BleScanListener {
      override fun scanStartFailed() {
        Log.e("ESPProvisioning", "## getBleDevices - Scan start failed")
        promise.reject("500", "Please turn on Bluetooth to connect BLE device")
      }

      override fun onPeripheralFound(device: BluetoothDevice, scanResult: ScanResult) {
        Log.e("ESPProvisioning", "## onPeripheralFound - device.address: $device.address")

        val uuids = scanResult.scanRecord?.serviceUuids
        if (uuids != null) {
          foundBLEDevices[device.address] = BleDevice(uuids = uuids, device = device)
        }
      }

      override fun scanCompleted() {
        val result = WritableNativeArray();

        foundBLEDevices.forEach { (address, bleDevice) ->
          val device: WritableMap = Arguments.createMap();

          Log.d("ESPProvisioning", "## foundBLEDevice - device.name: $foundBLEDevices[it]?.name")

          device.putString("address", address);
          device.putString("name", bleDevice.device.name);
          device.putString("uuid", bleDevice.uuids.first().uuid.toString());
          result.pushMap(device)
        }

        // Return found BLE devices
        promise.resolve(result);
      }

      override fun onFailure(p0: Exception?) {
        promise.reject("500", p0.toString())
      }
    });
  }
  lateinit var esp: ESPDevice
  @ReactMethod
  fun connectToDevice(
    deviceAddress: String,
    deviceProofOfPossession: String,
    mainUUID: String,
    promise: Promise
  ) {
    Log.e("ESPProvisioning", "## connectBleDevice")

    // TODO: CHECK IF I NEED ALSO TO CHECK ANDROID 12 AND DIFFERENT VERSIONS
    if (ActivityCompat.checkSelfPermission(
        reactApplicationContext,
        Manifest.permission.ACCESS_FINE_LOCATION
      ) != PackageManager.PERMISSION_GRANTED
    ) {
      promise.reject("500", "Not enough permissions");
      return
    }

 esp =ESPProvisionManager.getInstance(reactApplicationContext).createESPDevice(
      ESPConstants.TransportType.TRANSPORT_BLE,
      ESPConstants.SecurityType.SECURITY_1
    );
    // esp.proofOfPossession = deviceProofOfPossession


    val device = foundBLEDevices[deviceAddress]
    if (device == null) {
      promise.reject("500", "Device not found, invalid $deviceAddress")
      return
    }

    esp.connectBLEDevice(device.device, mainUUID);
    EventBus.getDefault().register(ConnectEventBusRegister(promise));
  }

  @ReactMethod
  fun scanWifiList(
    deviceAddress: String,
    deviceProofOfPossession: String,
    mainUUID: String,
    promise: Promise
  ) {
//    val device = ESPProvisionManager.getInstance(reactApplicationContext).espDevice

//    val device: ESPDevice = ESPProvisionManager.getInstance(reactApplicationContext).createESPDevice(
//      ESPConstants.TransportType.TRANSPORT_BLE,
//      ESPConstants.SecurityType.SECURITY_0
//    );
//    device.proofOfPossession = deviceProofOfPossession


   // esp.proofOfPossession = deviceProofOfPossession


    Log.e("ESPProvisioning", "Start scan")
    if(esp == null) {
      promise.reject("No device found")
      return;
    }

    esp.scanNetworks(object: WiFiScanListener {
      override fun onWifiListReceived(wifiList: ArrayList<WiFiAccessPoint>?) {
        val result = WritableNativeArray();
        wifiList?.forEach {
          val network: WritableMap = Arguments.createMap()
          network.putString("name", it.wifiName);
          network.putInt("rssi", it.rssi);
          network.putInt("security", it.security);
          result.pushMap(network)
        }
        promise.resolve(result)
      }

      override fun onWiFiScanFailed(p0: java.lang.Exception?) {
        Log.e("ESPProvisioning ", "WiFi scan failed", p0)
        promise.reject("Failed to get Wi-Fi scan list")
      }
    })
  }

}

internal data class BleDevice(val uuids: List<ParcelUuid>, val device: BluetoothDevice)

class ConnectEventBusRegister(private val promise: Promise){
  @Subscribe(threadMode = ThreadMode.MAIN)
  fun onMessageEvent(event: DeviceConnectionEvent) {
    Log.d("ESPProvisioning SOLO", event.eventType.toString());
    if (event.eventType == ESPConstants.EVENT_DEVICE_CONNECTED){
      promise.resolve("Connection success")
    } else {
      // TODO implement error
      promise.reject("500", "Device not found, invalid ")
    }
    EventBus.getDefault().unregister(this)
  }
}
