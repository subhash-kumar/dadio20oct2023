package com.dadio.app;

import android.app.KeyguardManager;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.view.WindowManager;
import android.os.Looper;
import android.util.Log;

import com.google.firebase.messaging.RemoteMessage;

import androidx.localbroadcastmanager.content.LocalBroadcastManager;

import com.facebook.react.ReactActivity;

public class MainActivity extends ReactActivity {
  
  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    // SplashScreen.show(...) has to be called after super.onCreate(...)
    // Below line is handled by '@expo/configure-splash-screen' command and it's discouraged to modify it manually
    // SplashScreen.show(this, SplashScreenImageResizeMode.CONTAIN, ReactRootView.class, false);
    if(!getIntent().getAction().equals("android.intent.action.MAIN"))
    {
        handleIntent(getIntent());
    }
  }
  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  @Override
  protected String getMainComponentName() {
    return "Dadio";
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    handleIntent(intent);
  }

  private void handleIntent(Intent intent){

    LocalBroadcastManager localBroadcastManager = LocalBroadcastManager.getInstance(this);
    Intent customEvent= new Intent("com.incomingcall.data");

    if(intent.getAction().equals("com.incomingcall.action.answer") || intent.getAction().equals("com.incomingcall.action.reject"))
    {
      KeyguardManager keyguardManager = (KeyguardManager) getSystemService(Context.KEYGUARD_SERVICE);
      if(keyguardManager.isKeyguardLocked()){
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O_MR1) {
          // For newer than Android Oreo: call setShowWhenLocked, setTurnScreenOn
          setShowWhenLocked(true);
          setTurnScreenOn(true);
      
          // If you want to display the keyguard to prompt the user to unlock the phone:
          keyguardManager.requestDismissKeyguard(this, null);
    
        }
        getWindow().addFlags(WindowManager.LayoutParams.FLAG_TURN_SCREEN_ON |
         WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON |
         WindowManager.LayoutParams.FLAG_SHOW_WHEN_LOCKED |
          WindowManager.LayoutParams.FLAG_DISMISS_KEYGUARD);
      }
      
    }

    if(intent.hasExtra("message")){
        final RemoteMessage message = intent.getParcelableExtra("message");
        Log.e("MAIN",message.getData().toString());
        customEvent.putExtra("message",message);
    }
    Boolean isAppRunning =false;
    if(intent.hasExtra("isAppRunning")){
        isAppRunning =intent.getBooleanExtra("isAppRunning",false);
        customEvent.putExtra("isAppRunning",isAppRunning);
    }

    Log.e("MAIN",intent.getAction());
    if(intent.getAction().equals("com.incomingcall.action.answer")){

        localBroadcastManager.sendBroadcast( new Intent("com.incomingcall.action.answer"));
        customEvent.setAction("com.incomingcall.data");
        customEvent.putExtra("action","answer");

    }else if(intent.getAction().equals("com.incomingcall.action.reject")){

        localBroadcastManager.sendBroadcast(new Intent("com.incomingcall.action.reject"));
        customEvent.setAction("com.incomingcall.data");
        customEvent.putExtra("action","reject");
    }
    Log.e("MAIN","Start");
    localBroadcastManager.sendBroadcast(customEvent);
    Log.e("MAIN","isAppRunning: "+isAppRunning);
    Handler handler = new Handler(Looper.getMainLooper());
       handler.postDelayed(new Runnable() {
           @Override
           public void run() {
               //The code you want to run after the time is up
               localBroadcastManager.sendBroadcast(customEvent);
               Log.e("MAIN","Stop");
           }
       }, 9000);
}

}
