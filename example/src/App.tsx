import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { getBleDevices } from 'react-native-esp-provisioning';
import type { BleDevice } from 'src/types';

export default function App() {
  const [bleDevices, setBleDevices] = React.useState<BleDevice[] | undefined>();

  React.useEffect(() => {
    const getDevices = async () => {
      const res = await getBleDevices('');

      setBleDevices(res);
    };

    getDevices();
  }, []);

  return (
    <View style={styles.container}>
      <Text>Bluetooth devices:</Text>
      {bleDevices?.map(({ address, name }) => {
        return (
          <>
            <Text>
              Address: {address}, Name: {name}
            </Text>
          </>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
