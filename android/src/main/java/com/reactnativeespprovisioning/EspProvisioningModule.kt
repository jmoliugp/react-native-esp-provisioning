import android.Manifest
import android.bluetooth.BluetoothDevice
import android.bluetooth.le.ScanResult
import android.content.pm.PackageManager
import android.os.Handler
import android.os.ParcelUuid
import android.util.Log
import android.widget.Toast
import androidx.core.app.ActivityCompat
import com.espressif.provisioning.*
import com.espressif.provisioning.listeners.BleScanListener
import com.espressif.provisioning.listeners.ProvisionListener
import com.espressif.provisioning.listeners.WiFiScanListener
import com.facebook.react.bridge.*
import org.greenrobot.eventbus.EventBus
import org.greenrobot.eventbus.Subscribe
import org.greenrobot.eventbus.ThreadMode


class EspProvisioningModule(reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String {
    return "EspProvisioning"
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


          device.putMap("advertisementData", null);
          device.putString("address", address);
          device.putString("deviceName", bleDevice.device.name);
          device.putString("proofOfPossession", "abcd1234")
          //device.putString("transport", bleDevice.device.)
          device.putString("uuid", bleDevice.uuids.first().uuid.toString());
          result.pushMap(device)
        }

        promise.resolve(result);
      }

      override fun onFailure(p0: Exception?) = promise.reject("500", p0.toString())
    })
  }

  private fun scanWifiNetworks(promise: Promise) {
    val disconnectListener = DisconnectEventBusRegister.createAndRegister {
      promise.reject(EspProvisioningError("Device disconnected while scan networks"))
    }

    val provisionManager = ESPProvisionManager.getInstance(reactApplicationContext)
    provisionManager.espDevice.scanNetworks(object : WiFiScanListener {
      override fun onWifiListReceived(wifiList: ArrayList<WiFiAccessPoint>) {
        Log.e("scan", "onWifiListReceived list length ${wifiList.size}")
        val result = WritableNativeArray()
          .also { array ->
            wifiList.map(WiFiAccessPoint::parse)
              .forEach(array::pushMap)
          }
        promise.resolve(result)
        disconnectListener.unregister()
      }

      override fun onWiFiScanFailed(e: java.lang.Exception) {
        Log.e("scan", "onWiFiScanFailed", e)
        promise.resolve(EspProvisioningError("onWiFiScanFailed: Scan error", e))
        disconnectListener.unregister()
      }
    })
  }


  @ReactMethod
  fun scanWifi(deviceAddress: String, mainUUID: String, promise: Promise) {
    val onSuccess = {
      scanWifiNetworks(promise)
    }
    connectToDevice(
      deviceAddress = deviceAddress,
      mainUUID = mainUUID,
      onReject = promise::reject,
      onSuccess = onSuccess
    )
  }

  private fun connectToDevice(
    deviceAddress: String,
    mainUUID: String,
    onSuccess: () -> Unit,
    onReject: (Throwable) -> Unit
  ) {
    val espDevice: ESPDevice =
      ESPProvisionManager.getInstance(reactApplicationContext).createESPDevice(
        ESPConstants.TransportType.TRANSPORT_BLE,
        ESPConstants.SecurityType.SECURITY_1
      )
    val device = foundBLEDevices[deviceAddress]!!
    espDevice.setProofOfPossession("abcd1234")

    ConnectEventBusRegister.createAndRegister(
      onSuccess = onSuccess,
      onReject = onReject
    )
    espDevice.connectBLEDevice(device.device, mainUUID)
  }

  @ReactMethod
  fun provision(
    deviceAddress: String,
    mainUUID: String,
    ssid: String,
    password: String,
    promise: Promise
  ) {
    val onSuccess = {
      ESPProvisionManager.getInstance(reactApplicationContext).espDevice
        .provision(ssid, password, object : ProvisionListener {
          override fun createSessionFailed(e: java.lang.Exception?) {
            // TODO("Not yet implemented")
          }

          override fun wifiConfigSent() {
            // TODO("Not yet implemented")
          }

          override fun wifiConfigFailed(e: java.lang.Exception?) {
            // TODO("Not yet implemented")
          }

          override fun wifiConfigApplied() {
            // TODO("Not yet implemented")
          }

          override fun wifiConfigApplyFailed(e: java.lang.Exception?) {
            // TODO("Not yet implemented")
          }

          override fun provisioningFailedFromDevice(failureReason: ESPConstants.ProvisionFailureReason?) {
            // TODO("Not yet implemented")
          }

          override fun deviceProvisioningSuccess() =
            promise.resolve("SUCCESS")


          override fun onProvisioningFailed(e: java.lang.Exception?) {
            // TODO("Not yet implemented")
          }

        })
    }
    connectToDevice(
      deviceAddress = deviceAddress,
      mainUUID = mainUUID,
      onReject = promise::reject,
      onSuccess = onSuccess
    )
  }
}


internal data class BleDevice(val uuids: List<ParcelUuid>, val device: BluetoothDevice)

internal class ConnectEventBusRegister(
  private val onSuccess: () -> Unit,
  private val onReject: (Throwable) -> Unit
) {
  companion object {
    fun createAndRegister(onSuccess: () -> Unit, onReject: (Throwable) -> Unit) =
      ConnectEventBusRegister(onSuccess, onReject)
        .also { register -> EventBus.getDefault().register(register) }
  }

  @Subscribe(threadMode = ThreadMode.MAIN)
  fun onMessageEvent(event: DeviceConnectionEvent) {
    if (event.eventType == ESPConstants.EVENT_DEVICE_CONNECTED) {
      onSuccess()
    } else {
      onReject(RuntimeException("CONNECTION_REJECTED: ${event.eventType}"))
    }
    unregister()
  }

  private fun unregister() = EventBus.getDefault().unregister(this)
}

internal class DisconnectEventBusRegister(private val disconnectCallback: () -> Unit) {
  companion object {
    fun createAndRegister(disconnectCallback: () -> Unit) =
      DisconnectEventBusRegister(disconnectCallback)
        .also { register -> EventBus.getDefault().register(register) }
  }

  @Subscribe(threadMode = ThreadMode.MAIN)
  fun onMessageEvent(event: DeviceConnectionEvent) {


    if (event.eventType == ESPConstants.EVENT_DEVICE_DISCONNECTED) {
      disconnectCallback();
      unregister()
    }
  }

  fun unregister() = EventBus.getDefault().unregister(this)
}

class EspProvisioningError(message: String, cause: Throwable? = null) :
  RuntimeException(message, cause)

fun WiFiAccessPoint.parse() = Arguments.createMap()
  .apply {
    putString("ssid", wifiName)
    putInt("rssi", rssi)
    putString("channel", null)
    putString("auth", null)
  }


