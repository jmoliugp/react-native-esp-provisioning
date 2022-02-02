import * as React from 'react';

import { StyleSheet, View, Text } from 'react-native';
import { helloGreeter } from 'react-native-esp-provisioning';

const greeter = 'Test McTesterson';

export default function App() {
  const [result, setResult] = React.useState<number | String | undefined>();

  React.useEffect(() => {
    helloGreeter(greeter).then(setResult);
  }, []);

  console.log('## result: ', result);

  return (
    <View style={styles.container}>
      <Text>Result: {result}</Text>
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
