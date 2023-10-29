import React from 'react';
import {Alert, NativeModules} from 'react-native';
import Toast from 'react-native-simple-toast';
import Utils from 'res/Utils';
import R from 'res/R';

const AllInOneSDKManager = NativeModules.AllInOneSDKManager;

const paytmConfig = {
  MID: 'VvkOTl25918912776148',
  WEBSITE: 'DEFAULT',
  CHANNEL_ID: 'WAP',
  INDUSTRY_TYPE_ID: 'Retail',
  // CALLBACK_URL: 'https://securegw.paytm.in/theia/paytmCallback?ORDER_ID=', 
 CALLBACK_URL:" https://securegw-stage.paytm.in/theia/paytmCallback?ORDER_ID=",
  // CALLBACK_URL:'dadio://test/:',
};
// var paytmParams = {};

class PayTM {
  static checksumHash = '';
  static txnToken = '';
  static userId = '';
  static orderId = '';
  static paymentFor = '';
  static onPaymentComplete;
  //   static paytmParams = {};

  // static CALLBACK_URL= 'https://securegw.paytm.in/theia/paytmCallback?ORDER_ID=';

  static initiateTransaction(orderId, amount, userId) {
    console.log('orderId : ', orderId);
    console.log('userId :', userId)
    console.log(`${R.constants.Api.initiateTransaction}${orderId}&amount=${amount}&user_id=${userId}`);
    Utils.ApiPost(`${R.constants.Api.initiateTransaction}${orderId}&amount=${amount}&user_id=${userId}`,
      (response = (data) => {
        console.log("initiateTrasaction",JSON.stringify(data.data))
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.checksumHash = data.data.paytm_checksum;
            console.log('checksum: ', this.checksumHash);
            this.txnToken = data.data.paytm_textoken;
            console.log('txnToken: ', this.txnToken);
            console.log("Amount",amount);
            console.log("UserID",userId);
            console.log("OderID",orderId);
            console.log(paytmConfig.CALLBACK_URL+orderId);
            AllInOneSDKManager.startTransaction(
              orderId,
              paytmConfig.MID,
              this.txnToken,
              `${amount}`,
              `${paytmConfig.CALLBACK_URL}${orderId}`,
              false,
              this.updatePayment,
            );
          }
        }
      }),
    );
  }
 
  static updatePayment = (result) => {
    console.log("I am in callback function");
    console.log("Result Value",result);
  //  alert(JSON.stringify(result));
    // alert("I am in  update payment")
    status = 'failure';
    isPaymentResponse = false;
    if (result.includes(`TXN_SUCCESS`)) {
      this.showAlert('Payment Response', 'Success');
      console.log("Payment Responce Success");
      Toast.show('Payment Successful', Toast.SHORT);
      status = 'success';
      isPaymentResponse = true;
    } else if (result.includes(`TXN_FAILURE`)) {
      this.showAlert('Payment Response', 'Failure');
      console.log("Payment Responce  Failed");
      Toast.show('Payment Failed', Toast.SHORT);
      // alert(JSON.stringify("Fail",result))
      status = 'failure';
      isPaymentResponse = true;
    }
    if (isPaymentResponse) {
      paymentUrl = '';
      console.log("Payment URL",paymentUrl);
      if (this.paymentFor === 'gifts') {
        paymentUrl = R.constants.Api.giftPaymentUpdate;
        // paymentUrl(paymentUrl);
        console.log("Payment Log Second payment for the gift",paymentUrl);
      } else if (this.paymentFor === 'points') {
        paymentUrl = R.constants.Api.UpdatePayment;
        // paymentUrl(paymentUrl);
        console.log("Payment Log Second payment for the points",paymentUrl);
      } else if (this.paymentFor === 'chat'){
        console.log("Payment Log Second payment for the chat",paymentUrl);
        paymentUrl = R.constants.Api.chatPaymentUpdate;
        console.log("Payment Log Second payment for the chat",paymentUrl);
      }
      // console.log("Update Payment_API ===>",`${paymentUrl}${this.userId}&action=${status}&order_id=${this.orderId}&payment_notes=${result}`);
        Utils.ApiPost(`${paymentUrl}${this.userId}&action=${status}&order_id=${this.orderId}&payment_notes=${result}`,
          (response = (data) => {
            if (data.res == 200) {
              if (data.data.res_status == 'success') {
                console.log("Payment Sucessfull !!!!!!!!");
                Toast.show('Payment Status Updated', Toast.SHORT);
                // this.onPaymentComplete(true);
                this.onPaymentComplete(true);
                // this.verifyChecksum();

              }
            }
          }),
        );
          } else {
      // this.onPaymentComplete(false);
      this.onPaymentComplete(false);
      console.log("onPaymentComplited false");
      // alert("onPaymentComplited false");
    }
  };
  static showAlert(title, message) {
    Alert.alert(
      title,
      message,
      [{text: 'OK', onPress: () => console.log('OK Pressed')}],
      {cancelable: false},
    );
  }
  static startPayment(orderId, price, userId, paymentFor, callback) {
    console.log("Payment Start ....");
    this.onPaymentComplete = callback;
    this.userId = userId;
    this.orderId = orderId;
    this.paymentFor = paymentFor;
    console.log("This is the values of ==>",price,userId,orderId,paymentFor,this.onPaymentComplete)
    // calling the varification 
      // this.verifyChecksum();
    this.initiateTransaction(orderId, price, userId);
    // this.showAlert('Payment Response', 'Done');
    // AllInOneSDKManager.startTransaction(
    //   orderId,
    //   paytmConfig.MID,
    //   this.txnToken,
    //   price,
    //   paytmConfig.CALLBACK_URL,
    //   false,
    //   this.displayResult,
    // );
  }
  static checkTransactionStatus() {}
  static verifyChecksum(orderId, checksumHash) {
    console.log("Verify Signature",`${R.constants.Api.verifyChecksum}${orderId}&paytm_checksum=${checksumHash}`)
    Utils.ApiPost(
      `${R.constants.Api.verifyChecksum}${orderId}&paytm_checksum=${checksumHash}`,
      (response = (data) => {
        console.log("Verify Signature DATa Return",JSON.stringify(data.data))
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            
            console.log('save-deviceId', data);
          }
        }
      }),
    );
  }
}

export default PayTM;
