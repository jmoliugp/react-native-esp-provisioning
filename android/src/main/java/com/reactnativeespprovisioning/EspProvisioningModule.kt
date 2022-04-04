import android.Manifest
import android.bluetooth.BluetoothDevice
import android.content.pm.PackageManager
import android.bluetooth.le.ScanResult
import com.espressif.provisioning.listeners.BleScanListener

import androidx.core.app.ActivityCompat
import android.util.Log

import com.espressif.provisioning.ESPProvisionManager
import com.facebook.react.bridge.*

class EspProvisioningModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "EspProvisioning"
    }

    // Example method
    // See https://reactnative.dev/docs/native-modules-android
    @ReactMethod
    fun multiply(a: Int, b: Int, promise: Promise) {

      promise.resolve(a * b)

    }

  private val isScanning = false

  @ReactMethod
  fun getBleDevices(prefix: String, promise: Promise) {
    val foundBLEDevices = HashMap<String, BluetoothDevice>();

    // TODO: CHECK IF I NEED ALSO TO CHECK ANDROID 12 AND DIFFERENT VERSIONS
    if (ActivityCompat.checkSelfPermission(reactApplicationContext, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
      Log.e("ESPProvisioning", "## getBleDevices - Location Permission denied")
      promise.reject("500","Location Permission denied")
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
        foundBLEDevices[device.address] = device;
      }

      override fun scanCompleted() {
        val result = WritableNativeArray();

        foundBLEDevices.keys.forEach {
          val device: WritableMap = Arguments.createMap();
          val array: WritableArray = WritableNativeArray();

          foundBLEDevices[it]?.uuids?.forEach { itUuid ->
            array.pushString(itUuid.uuid.toString());
          }

          Log.e("ESPProvisioning", "## foundBLEDevice - device.name: $foundBLEDevices[it]?.name")

          device.putString("address", it);
          device.putString("name", foundBLEDevices[it]?.name);
          device.putArray("uuids", array);
          result.pushMap(device)
        }

        // Return found BLE devices
        promise.resolve(result);
      }

      override fun onFailure(p0: Exception?) {
        promise.reject("500",p0.toString())
      }
    });
  }


}
