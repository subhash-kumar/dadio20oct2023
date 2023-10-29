import React from 'react';
import Utils from 'res/Utils';
import RootNavigator from 'res/Routes';
import firebase from 'react-native-firebase';
import {
  DeviceEventEmitter,
  SafeAreaView,
  AppState,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import {RNNotificationBanner} from 'react-native-notification-banner';
import InCallManager from 'react-native-incall-manager';
import R from 'res/R';

import IncomingCall from './native_modules/IncomingCall';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      Call_Alert_Visibility: false,
      callData: '',
      appState: AppState.currentState,
      callId: '',
      isDashboardMounted: false,
    };
  }
  componentDidMount() {
    AppState.addEventListener('change', this._handleAppStateChange);
    //we check if user has granted permission to receive push notifications.
    this.checkPermission();
    // Register all listener for notification
    this.createNotificationListeners();
    this._updateUserStatus(0);
    //new CallService().setup();

    DeviceEventEmitter.addListener('decline_call', () => {
      this.setState({callId: ''});
    });
    DeviceEventEmitter.addListener('end_call', () => {
      this.setState({callId: ''});
    });
    DeviceEventEmitter.addListener('dashboardMounted', () => {
      IncomingCall.dashboardMounted();
      this.setState({isDashboardMounted: true});
    });
    DeviceEventEmitter.addListener('dashboardUnmounted', () => {
      IncomingCall.dashboardUnMounted();
      this.setState({isDashboardMounted: false});
    });
    DeviceEventEmitter.addListener('incomingcall', (res) => {
      //Do something!
      if (this.state.callId != res.data.incomingcall_id) {
        this.setState({callId: res.data.incomingcall_id});
        IncomingCall.stopRingtone();
        console.log('Stop Ringtone');
        console.log('incomingcall : ', res);
        if (res.action === 'answer') {
          //DeviceEventEmitter.emit('receive_call', {data: res.data});
          this.recieveCall(res.data);
        } else {
          // DeviceEventEmitter.emit('decline_call', {data: res.data});
          this.declineCall(res.data);
        }
      }
    });
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this._handleAppStateChange);
  }

  _handleAppStateChange = (nextAppState) => {
    console.log('nextAppState,,,,,,+>>>', nextAppState);
    if (
      this.state.appState.match(/inactive|background/) &&
      nextAppState === 'active'
    ) {
      console.log('App has come to the foreground!');
      this._updateUserStatus(0);
    }
    if (
      this.state.appState.match(/active/) &&
      (nextAppState === 'background' || nextAppState === 'inactive')
    ) {
      console.log('App has come to background');
      this._updateUserStatus(1);
    }
    this.setState({appState: nextAppState});
  };

  _updateUserStatus(type) {
    Utils.getData(
      'userData',
      (value = (data) => {
        var userData = JSON.parse(data.value);
        // this.setState({user_id:userData.user_id})
        console.log(userData);
        if (userData !== undefined) {
          console.log(
            `${R.constants.Api.updateOnlineStatus}${userData.user_id}&type=${
              type == 0 ? 'online' : 'offline'
            }`,
          );
          Utils.ApiPost(
            `${R.constants.Api.updateOnlineStatus}${userData.user_id}&type=${
              type == 0 ? 'online' : 'offline'
            }`,
            (response = (data) => {
              if (data.res == 200) {
                if (data.data.res_status == 'success') {
                  type == 0
                    ? null
                    : Utils.storeData('activeCall', false, 'appJS');
                  console.log('updateOnlineStatus===>', data.data);
                }
              } else {
                this.setState({isLoading: false});
                // Toast.show("please check your internet.",Toast.SHORT)
              }
            }),
          );
        }
      }),
    );
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    // If Premission granted proceed towards token fetch
    console.log('enabled====>', enabled);
    if (enabled) {
      this.getToken();
    } else {
      // If permission hasn’t been granted to our app, request user in requestPermission method.
      this.requestPermission();
    }

    // Setting Up Channel for recieving notification messages.
    let channel = new firebase.notifications.Android.Channel(
      'incoming_call',
      'Dadio',
      firebase.notifications.Android.Importance.Max,
    ).setDescription('A Channel for Incoming Call');

    //Creating the above mentioned channel
    firebase.notifications().android.createChannel(channel);
    console.log('Channel Created');
  }

  async getToken() {
    Utils.getData(
      'fcmToken',
      (value = (data) => {
        console.log(data);
        if (data.value == null) {
          this.generateToken();
        } else {
          console.log('0===fcmToken==  ' + data);
          // await AsyncStorage.setItem('fcmToken', fcmToken);
        }
      }),
    );
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      // User has authorised
      this.getToken();
    } catch (error) {
      // User has rejected permissions
      console.log('permission rejected');
    }
  }

  generateToken = async () => {
    let fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      console.log('8===fcmToken==  ' + JSON.stringify(fcmToken));
      // await AsyncStorage.setItem('fcmToken', fcmToken);
      Utils.storeData('fcmToken', fcmToken);
    }
  };

  async createNotificationListeners() {
    // This listener triggered when notification has been received in foreground
    this.notificationListener = firebase
      .notifications()
      .onNotification((notification) => {
        const {title, body, data} = notification;
        console.log('On Notification ==>', this.state.callId);
        if (
          this.state.isDashboardMounted &&
          this.state.callId != data.incomingcall_id
        ) {
          //setTimeout(()=>{},100);
          this.setState({callId: data.incomingcall_id});
          this.displayBanner('foreground', title, body, data);
        }
      });

    // This listener triggered when app is in backgound and we click, tapped and opened notifiaction
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen) => {
        console.log(
          'notificationOpen====background====>',
          notificationOpen.notification,
        );
        const {title, body, data} = notificationOpen.notification;
        // console.log("title==>>",title)
        // console.log("body===>>",body)
        // console.log("data===>>",data)
        // console.log("======background===>>")

        //Incoming Call Handling with notification
        if (notificationOpen.action === 'recieve_call') {
          this.recieveCall(data);
        } else if (notificationOpen.action === 'decline_call') {
          this.declineCall(data);
        } else if (title == undefined) {
          console.log('data====>', data);
          this.displayBanner('background', data.notification_type, '', data);
        }
      });

    // This listener triggered when app is closed and we click,tapped and opened notification
    const notificationOpen = await firebase
      .notifications()
      .getInitialNotification();
    if (notificationOpen) {
      console.log(
        'notificationOpen====closed====>',
        notificationOpen.notification,
      );
      const {title, body, data} = notificationOpen.notification;
      // setTimeout for app to launch and initate and then to perform the block mentionbelow.
      setTimeout(() => {
        // Incoming Call Handling with notification
        if (notificationOpen.action === 'recieve_call') {
          this.recieveCall(data);
        } else if (notificationOpen.action === 'decline_call') {
          this.declineCall(data);
        } else if (title == undefined) {
          console.log('data====>', data);
          this.displayBanner('background', data.notification_type, '', data);
        }
      }, 7000);
    }
  }

  recieveCall(data) {
    this.setState({callerId: data.incomingcall_byid});
    DeviceEventEmitter.emit('receive_call', {data: data});
    DeviceEventEmitter.emit('recieve', {data: data});
    console.log('CALL RECIEVE COMPLETE !');
    firebase.notifications().removeAllDeliveredNotifications();
  }

  declineCall(data) {
    this.setState({callerId: data.incomingcall_byid});
    console.log('CALL DECLINED !');
    InCallManager.stopRingtone();
    DeviceEventEmitter.emit('decline_call', {data: data});
    firebase.notifications().removeAllDeliveredNotifications();
  }

  displayBanner(type, title, body, data) {
    console.log('type===>>', type);
    console.log('title==>>', title);
    console.log('body===>>', body);
    console.log('data===>>', data);

    // if(title=="Incoming Call"){
    // 	DeviceEventEmitter.emit("incoming_call",{"data":data})
    // }
    if (data.notification_type == 'incoming_call') {
      //console.log(data.notification_type)
      DeviceEventEmitter.emit('incoming_call', {data: data});
      firebase.notifications().removeAllDeliveredNotifications();
    }
    if (
      data.notification_type == 'like_unlike' ||
      data.notification_type == 'chat_message'
    ) {
      if (type == 'foreground') {
        RNNotificationBanner.Show({
          type: 1,
          title: title,
          subTitle: body,
          duration: 5000,
          dismissable: true,
        });
        DeviceEventEmitter.emit('update_footer', {data: data});
      }
      if (type == 'background') {
        if (data.notification_type == 'like_unlike') {
          DeviceEventEmitter.emit('update_footer', {data: data, nav: 2});
        }
        if (data.notification_type == 'chat_message') {
          DeviceEventEmitter.emit('update_footer', {data: data, nav: 4});
        }
      }
    }
    if (data.notification_type == 'decline_call') {
      DeviceEventEmitter.emit('decline_call', {data: data});
    }
    if (data.notification_type == 'receive_call') {
      DeviceEventEmitter.emit('receive_call', {data: data});
    }
    if (data.notification_type == 'end_call') {
      DeviceEventEmitter.emit('end_call', {data: data});
    }
  }

  render() {
    return (
      <SafeAreaView style={{flex: 1}}>
        <RootNavigator />
      </SafeAreaView>
    );
  }
}

