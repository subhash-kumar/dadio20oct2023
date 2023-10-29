package com.dadio.app;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.Toast;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.ActivityEventListener;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.paytm.pgsdk.PaytmOrder;
import com.paytm.pgsdk.PaytmPaymentTransactionCallback;
import com.paytm.pgsdk.TransactionManager;
// this line add by me 
import com.paytm.pgsdk.PaytmPGService;


import java.util.Objects;

public class AllInOneSDKManager extends ReactContextBaseJavaModule implements ActivityEventListener {
    protected static final int REQ_CODE = 0;
    private Callback callback;
    public AllInOneSDKManager(ReactApplicationContext reactContext) {
        super(reactContext);
        reactContext.addActivityEventListener(this);
    }

    @NonNull

    @Override
    public String getName() {
        return "AllInOneSDKManager";
    }

    @ReactMethod
    public void startTransaction(String orderId, String mid, String txnToken, String amount, String callbackUrl, boolean isStaging, Callback call) {
        callback = call;
        if (orderId == null || mid == null || txnToken == null || amount == null || orderId.isEmpty() || mid.isEmpty() || txnToken.isEmpty() || amount.isEmpty()) {
            if (txnToken == null || txnToken.isEmpty()) {
                Toast.makeText(getReactApplicationContext(), "txnToken error", Toast.LENGTH_LONG).show();
            }
            else {
                Toast.makeText(getReactApplicationContext(), "Please enter all field", Toast.LENGTH_LONG).show();
            }
            return;
        }

        String host = "https://securegw.paytm.in/";
        if (isStaging) {

            host = "https://securegw-stage.paytm.in/";

        }

        if (callbackUrl.isEmpty()) {
            callbackUrl = host + "theia/paytmCallback?ORDER_ID=" + orderId;


        }

        PaytmOrder paytmOrder = new PaytmOrder(orderId, mid, txnToken, amount, callbackUrl);
      TransactionManager transactionManager = new TransactionManager(paytmOrder, new PaytmPaymentTransactionCallback() {

            @Override
            public void onTransactionResponse(Bundle bundle) {
                Log.d("LOG", "Payment Transaction is successful " + bundle);
                setResult("Payment Transaction response " + bundle.toString(), call);
            }
            // @Override
            // public void onTransactionResponse(Bundle bundle) {
            //     Log.d("paytm_gateway", "onTransactionResponse: "+inResponse.toString());

            //     String s = bundle.getString("STATUS");
            //     String oid = bundle.getString("ORDERID");
            //     Log.d("paytm_gateway", "onTransactionResponse: trxID: "+oid);

            //     if (s != null && s.equals("TXN_SUCCESS")){
            //         Toast.makeText(this, "Success", Toast.LENGTH_SHORT).show();
            //         updatePostLimit(oid);
            //     }
            //     else {
            //         Toast.makeText(this, "Failed", Toast.LENGTH_SHORT).show();
            //         finish();
            //     }
            // }

            @Override
            public void networkNotAvailable() {
                setResult("networkNotAvailable", call);
            }

            @Override
            public void onErrorProceed(String s) {
                setResult(s, call);
            }

            @Override
            public void clientAuthenticationFailed(String s) {
                setResult(s, call);
            }

            @Override
            public void someUIErrorOccurred(String s) {
                setResult(s, call);
            }

            @Override
            public void onErrorLoadingWebPage(int iniErrorCode, String inErrorMessage, String inFailingUrl) {
                setResult(inErrorMessage, call);
            }

            @Override
            public void onBackPressedCancelTransaction() {
                setResult("onBackPressedCancelTransaction", call);
            }

            @Override
            public void onTransactionCancel(String s, Bundle bundle) {
                setResult(s + " " + bundle.toString(), call);
            }

        });


        transactionManager.setShowPaymentUrl(host + "theia/api/v1/showPaymentPage");
        transactionManager.startTransaction(Objects.requireNonNull(getCurrentActivity()), REQ_CODE);

    }

    @Override
    public void onActivityResult(Activity activity, int requestCode, int resultCode, Intent data) {
        if (requestCode == REQ_CODE && data != null) {
            setResult(data.getStringExtra("nativeSdkForMerchantMessage") + data.getStringExtra("response"), callback);
            //data.getStringExtra("nativeSdkForMerchantMessage") this return message if transaction was stopped by users<span>
            // data.getStringExtra("response") this returns the shared response if the transaction was successful or failure.
        }
    }

    @Override
    public void onNewIntent(Intent intent) {

    }

    private void setResult(String message, Callback call) {
        Log.e("log", message);
        if (call != null) {
            call.invoke(message);
        }
        else {
            Toast.makeText(getReactApplicationContext(), "call is null", Toast.LENGTH_LONG).show();
        }
    }

}