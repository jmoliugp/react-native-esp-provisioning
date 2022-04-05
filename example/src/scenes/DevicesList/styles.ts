import { defaultSceneSpacing } from '../../styles';
import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: defaultSceneSpacing,
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
  navBar: {
    height: '100%',
    width: '100%',
  },
  title: {
    marginBottom: 15,
  },
});
