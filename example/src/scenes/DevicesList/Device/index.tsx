import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { connectDevice, createDevice } from 'react-native-esp-provisioning';
import type { BleDevice } from 'src/types';

import { styles } from './styles';

interface Props {
  device: BleDevice;
}

export const Device: React.FC<Props> = (props) => {
  const onPress = async () => {
    await createDevice(props.device.name);
    await connectDevice();
  };

  return (
    <View style={styles.listElement}>
      <Pressable onPress={onPress}>
        <View style={styles.listContent}>
          <View style={styles.textGroup}>
            <Text style={styles.todoTitle}>{props.device.name}</Text>
            <Text style={styles.todoDescription}>{props.device.address}</Text>
          </View>
        </View>
        <View style={styles.separation} />
      </Pressable>
    </View>
  );
};
