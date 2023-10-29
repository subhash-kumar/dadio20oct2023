package com.dadio.app;

import android.annotation.SuppressLint;
import android.app.Application;
import android.content.Context;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.Signature;
import android.util.Base64;
import android.util.Log;

import com.facebook.BuildConfig;
import com.facebook.FacebookSdk;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.dadio.app.IncomingCall.IncomingCallPackage;
import com.reactlibrary.LaunchApplicationPackage;
import com.razorpay.rn.RazorpayPackage;
import ui.notificationbanner.RNNotificationBannerPackage;
import com.bitgo.randombytes.RandomBytesPackage;
// import com.rnenxrtc.EnxRtcPackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.RNFirebasePackage;
import com.reactnativecommunity.viewpager.RNCViewPagerPackage;
// import com.reactlibrary.RNDisableBatteryOptimizationsPackage;
// import com.reactlibrary.RNDisableBatteryOptimizationsPackage;
import io.invertase.firebase.RNFirebasePackage;
// import com.rnenxrtc.EnxRtcPackage;
import com.razorpay.rn.RazorpayPackage;

import io.invertase.firebase.RNFirebasePackage;
import io.invertase.firebase.messaging.RNFirebaseMessagingPackage;                       
import io.invertase.firebase.notifications.RNFirebaseNotificationsPackage;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.soloader.SoLoader;
import java.lang.reflect.InvocationTargetException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.List;


public class MainApplication extends Application implements ReactApplication {

  private final ReactNativeHost mReactNativeHost =
      new ReactNativeHost(this) {
          @Override
          public boolean getUseDeveloperSupport() {
              // Return true to load JS from the packager.
              // If BuildConfig.DEBUG is false, assets will be loaded from assets folder.
              return true; // BuildConfig.DEBUG;
          }
        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
          // Packages that cannot be autolinked yet can be added manually here, for example:
//           packages.add(new RNGoogleSigninPackage());
            // packages.add(new EnxRtcPackage());
            packages.add(new RNFirebaseMessagingPackage());
            packages.add(new RNFirebaseNotificationsPackage());
            packages.add(new AllInOneSDKPackage());
            packages.add(new IncomingCallPackage());
            return packages;
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
      try {
          @SuppressLint("PackageManagerGetSignatures") PackageInfo info = getPackageManager().getPackageInfo(
                  "com.dadio.app",
                  PackageManager.GET_SIGNATURES);
          for (Signature signature : info.signatures) {
              MessageDigest md = MessageDigest.getInstance("SHA");
              md.update(signature.toByteArray());
              Log.d("KeyHash:", Base64.encodeToString(md.digest(), Base64.DEFAULT));
          }
      } catch (PackageManager.NameNotFoundException e) {
          Log.d("KeyHash error:", e.toString());
      } catch (NoSuchAlgorithmException e) {
          Log.d("KeyHash error:", e.toString());
      }
      SoLoader.init(this, /* native exopackage */ false);
//    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
      FacebookSdk.sdkInitialize(getApplicationContext());
  }

  /**
   * Loads Flipper in React Native templates. Call this in the onCreate method with something like
   * initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
   *
   * @param context
   * @param reactInstanceManager
   */
  private static void initializeFlipper(
      Context context, ReactInstanceManager reactInstanceManager) {
    if (BuildConfig.DEBUG) {
      try {
        /*
         We use reflection here to pick up the class that initializes Flipper,
        since Flipper library is not available in release mode
        */
        Class<?> aClass = Class.forName("com.dadio.ReactNativeFlipper");
        aClass
            .getMethod("initializeFlipper", Context.class, ReactInstanceManager.class)
            .invoke(null, context, reactInstanceManager);
      } catch (ClassNotFoundException e) {
        e.printStackTrace();
      } catch (NoSuchMethodException e) {
        e.printStackTrace();
      } catch (IllegalAccessException e) {
        e.printStackTrace();
      } catch (InvocationTargetException e) {
        e.printStackTrace();
      }
    }
  }
}
