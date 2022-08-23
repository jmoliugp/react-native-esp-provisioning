import React from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';
import { android, ios } from '../../../../../src/index';
import type { BleDevice } from 'src/entities';

import { styles } from './styles';

interface Props {
  device: BleDevice;
}

const SSID = 'MySsid';
const PASS_PHRASE = 'MyPassPhrase';

export const Device: React.FC<Props> = (props) => {
  const onPress = async () => {
    let wifiList = [];
    if (Platform.OS === 'ios') {
      wifiList = await ios.scanWifi(props.device);
    } else {
      wifiList = await android.scanWifi(
        props.device.uuid,
        props.device.address
      );
    }

    const provisioningStatus = await android.provision(
      props.device.uuid,
      props.device.address,
      SSID,
      PASS_PHRASE
    );
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
