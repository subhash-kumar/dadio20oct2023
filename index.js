import {AppRegistry} from 'react-native';
import App from 'src/App';
import {name as appName} from './app.json';
import FirebaseBackgroundMessageHandler from './src/res/Services/FirebaseBackgroundMessageHandler';

AppRegistry.registerComponent(appName, () => App);
// AppRegistry.registerHeadlessTask('RNFirebaseBackgroundMessage', () => FirebaseBackgroundMessageHandler);
