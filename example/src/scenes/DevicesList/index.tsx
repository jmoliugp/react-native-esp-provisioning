import * as React from 'react';

import { View, Text, SafeAreaView, FlatList, Platform } from 'react-native';
import { getBleDevices } from '../../../../src/index';
import type { BleDevice } from 'src/entities';
import { styles } from './styles';
import { strings } from './strings';
import { Device } from './Device';

import { initPermissionsManager } from '../../common/permissions';

const ESP_PREFIX = 'EKG-';

export const DevicesList: React.FC = () => {
  const [bleDevices, setBleDevices] = React.useState<BleDevice[] | undefined>();

  React.useEffect(() => {
    const getDevices = async () => {
      const permissionsManager = initPermissionsManager(Platform.OS);

      const bleEnabled = await permissionsManager.checkBLEPermissions();
      if (!bleEnabled) {
        await permissionsManager.requestBLEPermissions();
      }

      const locationEnabled =
        await permissionsManager.checkLocationPermissions();
      if (!locationEnabled) {
        await permissionsManager.requestLocationPermissions();
      }

      const res = await getBleDevices(ESP_PREFIX);

      setBleDevices(res);
    };

    getDevices();
  }, []);

  return (
    <SafeAreaView style={styles.navBar}>
      <View style={styles.container}>
        <Text style={styles.title}>{strings.title}</Text>
        <View>
          <FlatList<BleDevice>
            data={bleDevices}
            renderItem={({ item }) => <Device device={item} />}
            keyExtractor={(item) => item.deviceName}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};
