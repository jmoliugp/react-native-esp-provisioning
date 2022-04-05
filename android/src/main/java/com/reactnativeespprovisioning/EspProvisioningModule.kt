import android.Manifest
import android.bluetooth.BluetoothDevice
import android.content.pm.PackageManager
import android.bluetooth.le.ScanResult
import android.os.ParcelUuid
import com.espressif.provisioning.listeners.BleScanListener

import androidx.core.app.ActivityCompat
import android.util.Log

import com.espressif.provisioning.ESPProvisionManager
import com.espressif.provisioning.ESPConstants
import com.espressif.provisioning.ESPDevice
import com.facebook.react.bridge.*

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

    val esp: ESPDevice = ESPProvisionManager.getInstance(reactApplicationContext).createESPDevice(
      ESPConstants.TransportType.TRANSPORT_BLE,
      ESPConstants.SecurityType.SECURITY_0
    );
    esp.proofOfPossession = deviceProofOfPossession


    val device = foundBLEDevices[deviceAddress]
    if (device == null) {
      promise.reject("500", "Device not found, invalid $deviceAddress")
      return
    }

    esp.connectBLEDevice(device.device, mainUUID);
    promise.resolve("Connection success");
  }

}

internal data class BleDevice(val uuids: List<ParcelUuid>, val device: BluetoothDevice)
