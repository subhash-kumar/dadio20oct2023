package com.dadio.app.IncomingCall;


import android.app.KeyguardManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.os.Build;
import android.os.Handler;
import android.view.WindowManager;
import android.widget.ImageButton;

import com.facebook.react.ReactActivity;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.firebase.messaging.RemoteMessage;
import com.dadio.app.MainActivity;
import com.dadio.app.R;

import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.localbroadcastmanager.content.LocalBroadcastManager;

public class IncomingCallScreenActivity extends ReactActivity {

    private static final String TAG = "MessagingService";
    LocalBroadcastManager mLocalBroadcastManager;
    BroadcastReceiver mBroadcastReceiver = new BroadcastReceiver() {
        @Override
        public void onReceive(Context context, Intent intent) {
            if(intent.getAction().equals("com.incomingcallscreenactivity.action.close")){
                finish();
            }
        }
    };
    @Override
    protected void onCreate(android.os.Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);

        mLocalBroadcastManager = LocalBroadcastManager.getInstance(this);
        IntentFilter mIntentFilter = new IntentFilter();
        mIntentFilter.addAction("com.incomingcallscreenactivity.action.close");
        mLocalBroadcastManager.registerReceiver(mBroadcastReceiver, mIntentFilter);

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
            // For newer than Android Oreo: call setShowWhenLocked, setTurnScreenOn
            setShowWhenLocked(true);
            setTurnScreenOn(true);
        
            // If you want to display the keyguard to prompt the user to unlock the phone:
            KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
            keyguardManager.requestDismissKeyguard(this, null);
        }

        getWindow().addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
         WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
         WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);        

        setContentView(R.layout.layout_incoming_call);


        Intent intent = getIntent();

        final Boolean isAppRuning=intent.getBooleanExtra("isAppRunning",false);

        final RemoteMessage message = intent.getParcelableExtra("message");
        String host_name =  message.getData().get("incomingdisplay_name");

        android.widget.TextView tvName = (android.widget.TextView)findViewById(R.id.callerName);
        tvName.setText(host_name);


       final ReactContext reactContext = getReactInstanceManager().getCurrentReactContext();

        ImageButton acceptCallBtn = (ImageButton) findViewById(R.id.accept_call_btn);
        acceptCallBtn.setOnClickListener(new android.view.View.OnClickListener() {
            @Override
            public void onClick(android.view.View view) {
//                sendBroadcast(new Intent("com.incomingcall.action.answer"));
                Intent intent = getMainActivityIntent(message,isAppRuning);
                intent.setAction("com.incomingcall.action.answer");
                startActivity(intent);
                finish();
            }
        });

        ImageButton rejectCallBtn = (ImageButton) findViewById(R.id.reject_call_btn);
        rejectCallBtn.setOnClickListener(new android.view.View.OnClickListener() {
            @Override
            public void onClick(android.view.View view) {
//                sendBroadcast(new Intent("com.incomingcall.action.reject"));
                Intent intent = getMainActivityIntent(message,isAppRuning);
                intent.setAction("com.incomingcall.action.reject");
                startActivity(intent);
                finish();
            }
        });

        Handler handler = new Handler();

        handler.postDelayed(new Runnable() {
            public void run() {
                finish();
            }
        }, 30000);
    }

    private Intent getMainActivityIntent(RemoteMessage remoteMessage,boolean isAppRunning){
        Intent intent = new Intent(IncomingCallScreenActivity.this, MainActivity.class);
        intent.addFlags(Intent.FLAG_ACTIVITY_REORDER_TO_FRONT);
        // intent.addFlags(WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED +
        //                      WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD +
        //                      WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON +
        //                      WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON);
        intent.putExtra("message",remoteMessage);
        intent.putExtra("isAppRunning",isAppRunning);
        return intent;
    }

    @Override
    public void onDestroy() {
        super.onDestroy();
        mLocalBroadcastManager.unregisterReceiver(mBroadcastReceiver);
    }

    private void onDisconnected() {
//do something
    }

   private void sendEvent(ReactContext reactContext, String eventName, WritableMap params) {
       reactContext
               .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
               .emit(eventName, params);
   }
}