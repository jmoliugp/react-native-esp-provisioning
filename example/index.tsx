import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import { DevicesList } from './src/scenes/DevicesList';

AppRegistry.registerComponent(appName, () => DevicesList);
