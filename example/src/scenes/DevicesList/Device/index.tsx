import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { provision, scanWifi } from 'react-native-esp-provisioning';
import type { BleDevice } from 'src/entities';

import { styles } from './styles';

interface Props {
  device: BleDevice;
}

export const Device: React.FC<Props> = (props) => {
  const onPress = async () => {
    // const wifiList = await scanWifi(props.device);
    // console.log('## wifiList: ', wifiList);
    // const provisioningStatus = await provision(props.device, SSID, PASS_PHRASE);
    // console.log('## provisioningStatus: ', provisioningStatus);
  };

  return (
    <View style={styles.listElement}>
      <TouchableOpacity onPress={onPress}>
        <View style={styles.listContent}>
          <View style={styles.textGroup}>
            <Text style={styles.todoTitle}>{props.device.deviceName}</Text>
            <Text style={styles.todoDescription}>
              {props.device.deviceName}
            </Text>
          </View>
        </View>
        <View style={styles.separation} />
      </TouchableOpacity>
    </View>
  );
};
