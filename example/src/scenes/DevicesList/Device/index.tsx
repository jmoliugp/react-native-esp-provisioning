import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import {
  provision,
  provisionAndroid,
  scanWifi,
  scanWifiAndroid,
} from '../../../../../src/index';
import type { BleDevice } from 'src/entities';

import { styles } from './styles';

interface Props {
  device: BleDevice;
}

const SSID = 'Xmartlabs';
const PASS_PHRASE = 'Xmartlabs33';

export const Device: React.FC<Props> = (props) => {
  const onPress = async () => {
    console.log('## onPress START');
    let wifiList = [];
    if (Platform.OS === 'ios') {
      wifiList = await scanWifi(props.device);
    } else {
      console.log('## scanWifiAndroid START');
      wifiList = await scanWifiAndroid(props.device.uuid, props.device.address);
      console.log('## wifiList: ', wifiList);
    }

    const provisioningStatus = await provisionAndroid(
      props.device.uuid,
      props.device.address,
      SSID,
      PASS_PHRASE
    );
    console.log('## provisioningStatus: ', provisioningStatus);
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
