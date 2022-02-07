import React from 'react';
import { Pressable, Text, View } from 'react-native';
import type { BleDevice } from 'src/types';

import { styles } from './styles';

interface Props {
  device: BleDevice;
}

export const Device: React.FC<Props> = (props) => {
  return (
    <View style={styles.listElement}>
      <Pressable onPress={() => console.log('noop')}>
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
