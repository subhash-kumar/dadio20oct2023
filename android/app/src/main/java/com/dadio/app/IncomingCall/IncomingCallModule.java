package com.dadio.app.IncomingCall;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;

import com.dadio.app.Firebase.MessagingSerializer;

import com.google.firebase.messaging.RemoteMessage;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import java.net.SocketTimeoutException;

public class IncomingCallModule extends ReactContextBaseJavaModule{

    private ReactContext reactContext;
    private WritableMap messageMap=null;
    private Boolean isDashboardMounted;
    private LocalBroadcastReceiver  mLocalBroadcastReceiver;
    LocalBroadcastManager localBroadcastManager;

    IncomingCallModule(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        this.mLocalBroadcastReceiver = new LocalBroadcastReceiver();
        localBroadcastManager = LocalBroadcastManager.getInstance(reactContext);
        localBroadcastManager.registerReceiver(mLocalBroadcastReceiver, new IntentFilter("com.incomingcall.data"));
    }

//    Name of the React Module
    @Override
    public String getName() {
        return "IncomingCall";  // Name of the Native Modules.
    }



//React method to be extracted
    /**
     * @param message FCM Remote Message
     */
    @ReactMethod
    public void displayIncomingCall(ReadableMap message) {
        try {
        WritableNativeMap data = Arguments.makeNativeMap(Arguments.toBundle(message));
        WritableMap response = Arguments.createMap();
            response.putMap("data",data);
        // message.putString("message","Event Traveled From native -> React");
        sendEvent("gotcha",response);
        }catch (RuntimeException e){
            System.out.println(e);
        }
      
    }

    @ReactMethod
    public void stopRingtone() {
        localBroadcastManager.sendBroadcast(new Intent("com.incomingcall.action.stopringtone"));
        // Intent stopIntent = new Intent(reactContext, RingtonePlayingService.class);
        // reactContext.stopService(stopIntent);
    }

    @ReactMethod
    public void dashboardMounted() {
        try{
            Log.e("MODULE" ,"dashboardMounted : "+ true);
            this.isDashboardMounted =true;
            sendIncomingCallData();
        } catch (RuntimeException e){
            System.out.println(e);
        }
    }

    @ReactMethod
    public void dashboardUnMounted() {
        try{
            Log.e("MODULE" ,"dashboardMounted : "+false);
            this.isDashboardMounted =false;
     } catch (RuntimeException e){
        System.out.println(e);
    }

    }

    @ReactMethod
    public void sendIncomingCallData() {
        if(isDashboardMounted && getMessage() != null)
        {
            sendEvent("incomingcall", getMessage());
            Log.e("MODULE" , "Remote message data sent!");
        }
    }

    private void sendEvent(String eventName, WritableMap params) {
        try{

            reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, params);

        } catch (RuntimeException e){
            System.out.println(e);
        }

    }

    private void setMessage(WritableMap messageMap) {
        try{
        this.messageMap=messageMap;
        }catch (RuntimeException e){
            System.out.println(e);
        }
    }

    private WritableMap getMessage() {
        
        return this.messageMap;
    }

    public class LocalBroadcastReceiver extends BroadcastReceiver {
        @Override
        public void onReceive(Context context, Intent intent) {
            try{
            if(intent.getAction().equals("com.incomingcall.data") && intent.hasExtra("message")){
                    Log.e("MODULE" , "Recieved");
                    RemoteMessage message = intent.getParcelableExtra("message");
                    Log.e("MODULE" , message.getData().toString());
                    WritableMap messageMap = MessagingSerializer.parseRemoteMessage(message);
                    messageMap.putString("action", intent.getStringExtra("action"));
                    messageMap.putBoolean("isAppRunning", intent.getBooleanExtra("isAppRunning",false));
                    setMessage(messageMap);
                    sendIncomingCallData();
                }
            } catch(RuntimeException e){
            System.out.println(e);

            }
        }
    }
}
