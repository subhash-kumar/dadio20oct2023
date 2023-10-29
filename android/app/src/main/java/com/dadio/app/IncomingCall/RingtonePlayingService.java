package com.dadio.app.IncomingCall;

import android.app.IntentService;
import android.content.Intent;
import android.media.Ringtone;
import android.media.RingtoneManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.util.Log;

public class RingtonePlayingService extends IntentService
{
    private Ringtone ringtone;
    public RingtonePlayingService() {
        super(RingtonePlayingService.class.getSimpleName());
    }
 
    @Override
    public IBinder onBind(Intent intent) {
       return null;
    }

    @Override
    protected void onHandleIntent(Intent intent) {
         //ringtoneManager start
         Uri incoming_call_notif = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE);

         Uri ringtoneUri = Uri.parse(intent.getExtras().getString("ringtone-uri"));
 
         this.ringtone = RingtoneManager.getRingtone(this, ringtoneUri);
         if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.P)
         {
             ringtone.setLooping(true);
         }
         ringtone.play();
         Log.e("RingToneService" , "Playing...");
 
         final Handler handler = new Handler(Looper.getMainLooper());
         handler.postDelayed(new Runnable() {
             @Override
             public void run() {
                 //The code you want to run after the time is up
                 stopSelf();
             }
         }, 30000); //the time you want to delay in milliseconds
 
    }

    @Override
    public void onDestroy()
    {
        ringtone.stop();
        Log.e("RingToneService" , "Stopped Playing...");
    }
}