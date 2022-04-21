import React from 'react';
import { Alert, Pressable, Text, TouchableOpacity, View } from 'react-native';
import { connectToDevice, scanWifiList } from 'react-native-esp-provisioning';
import type { BleDevice } from 'src/types';

import { styles } from './styles';

interface Props {
  device: BleDevice;
}

export const Device: React.FC<Props> = (props) => {
  // const onPress = async () => console.warn('## TAPPED');
  // const onPress = async () => {
  //   console.log('## create device: ', props.device.name);
  //   await createDevice(props.device.name);
  //   console.log('## connect device: ', props.device.name);
  //   const res = await connectDevice();
  //   console.log('## connect device - res: ', res);
  //   console.log('## FINISHED connection');
  // };
  console.log('## props.device: ', props.device);

  const onPress = (item: any) => async () => {
    console.log('## onPress - START');
    console.log('## item: ', item);
    try {
      const result = await connectToDevice(item.address, 'abcd1234', item.uuid);
      // Alert.alert(`Connected to ${item.name} - with result: ${result}`);
      console.warn(`Connected to ${item.name} - with result: ${result}`);
      await scanWifiList(item.address, 'abcd1234', item.uuid);
      // setConnectedDevice(item);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.listElement}>
      <TouchableOpacity onPress={onPress(props.device)}>
        <View style={styles.listContent}>
          <View style={styles.textGroup}>
            <Text style={styles.todoTitle}>{props.device.name}</Text>
            <Text style={styles.todoDescription}>{props.device.address}</Text>
          </View>
        </View>
        <View style={styles.separation} />
      </TouchableOpacity>
    </View>
  );
};
