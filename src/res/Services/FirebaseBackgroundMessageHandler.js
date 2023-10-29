import {DeviceEventEmitter} from 'react-native';
import firebase from 'react-native-firebase';
import uuid from 'uuid';
import InCallManager from 'react-native-incall-manager';
import LaunchApplication from 'react-native-bring-foreground';

export default async (message) => {
  console.log('Message recieved', message);
  if (message.data.message === 'incoming_call') {
    try {
      const data = message.data;
      //const payload = JSON.parse(message.data.sendbird);
      const localNotification = new firebase.notifications.Notification({
        show_in_foreground: true,
      }).android
        .setAutoCancel(false)
        .android.setDefaults(0)
        .android.setCategory('call')
        .android.setTimeoutAfter(30000)
        .android.setOnlyAlertOnce(true)
        .android.setPriority(firebase.notifications.Android.Priority.High)
        .android.setChannelId(data.channelId)
        .android.setColor('#05adf6')
        .android.setVibrate(10000)
        .setNotificationId(message.messageId)
        .setTitle(data.title)
        .setData(data)
        //.setSubtitle(`Unread message: ${payload.unread_message_count}`)
        .setBody(data.body);

      //Build an action
      const recieve_action = new firebase.notifications.Android.Action(
        'recieve_call',
        'ic_launcher',
        'Recieve',
      );
      const decline_action = new firebase.notifications.Android.Action(
        'decline_call',
        'ic_launcher',
        'Decline',
      );
      // Add the action to the notification
      localNotification.android.addAction(recieve_action);
      localNotification.android.addAction(decline_action);

      // Add to play phone ringtone
      InCallManager.startRingtone('_BUNDLE_');
      LaunchApplication.open('com.dadio.app');

      //firebase.notifications().displayNotification(localNotification);

      return firebase.notifications().displayNotification(localNotification); //Promise.resolve();
    } catch (e) {
      console.log(e);
      return Promise.resolve();
    }
  } else {
    return Promise.resolve();
  }
};
