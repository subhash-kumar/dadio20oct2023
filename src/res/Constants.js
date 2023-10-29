const baseurl = 'https://www.dadio.in/apps/serverapi/server/';
const WEB_CLIENT_ID =
  '265491959516-tc06pvs6cg0ci36hsm2l2fehtujg3p1u.apps.googleusercontent.com';
const WEB_CLIENT_SECRET = 'ztOq_4z1Io5cvTHsslF8FYgW';
const strings = {
  Api: {
    login: baseurl + 'login.php?api_key=HASH490J669&email_id=',
    profileList: baseurl + 'total-users.php?api_key=HASH490J669&user_id=',
    profileDetails: baseurl + 'landing-page.php?api_key=HASH490J669&user_id=',
    likeUnlike: baseurl + 'updateuserlike.php?api_key=HASH490J669&profile_id=',
    saveUserLocation: baseurl + 'save-latlon.php?api_key=HASH490J669&user_id=',
    notificationList: baseurl + 'notification.php?api_key=HASH490J669&user_id=',
    myGifts: baseurl + 'mygift.php?api_key=HASH490J669&user_id=',
    basicInfo: baseurl + 'basic-info.php?api_key=HASH490J669&user_id=',
    updateAboutMe: baseurl + 'save-aboutus.php?api_key=HASH490J669&user_id=',
    getState: baseurl + 'state.php',
    getCity: baseurl + 'city.php?state_id=',
    updateBasicInfo:
      baseurl + 'update-basicinfo.php?api_key=HASH490J669&user_id=',
    updatePrivacy:
      baseurl + 'save-privacy-control.php?api_key=HASH490J669&user_id=',
    saveAudio: baseurl + 'uploadaudio-profile.php?api_key=HASH490J669&user_id=',
    savePreference: baseurl + 'my-preference.php?api_key=HASH490J669&user_id=',
    savePassword: baseurl + 'update-password.php?api_key=HASH490J669&user_id=',
    incomingCalls: baseurl + 'incoming-call.php?api_key=HASH490J669&user_id=',
    createCall:
      baseurl + 'demo-initiate-voicecall.php?api_key=HASH490J669&user_id=',
    answerCall: baseurl + 'receive-call.php?api_key=HASH490J669&call_id=',
    declineCall: baseurl + 'decline-call.php?api_key=HASH490J669&call_id=',
    callStatus:
      baseurl + 'callstatus-updatesession.php?api_key=HASH490J669&call_id=',
    endCall: baseurl + 'end-voicecall.php?api_key=HASH490J669&call_id=',
    callList: baseurl + 'call-log.php?api_key=HASH490J669&user_id=',
    messageList: baseurl + 'message-list.php?api_key=HASH490J669&user_id=',
    chatList: baseurl + 'chat-window.php?api_key=HASH490J669&user_id=',
    chatSend: baseurl + 'chat-send.php?api_key=HASH490J669&user_id=',
    recordingSend:
      baseurl + 'upload-chataudio.php?api_key=HASH490J669&user_id=',
    chatRefresh: baseurl + 'chat-refresh.php?api_key=HASH490J669&user_id=',
    profile: baseurl + 'profile.php?api_key=HASH490J669&user_id=',
    setAsProfileImage:
      baseurl + 'setprofilepicture.php?api_key=HASH490J669&user_id=',
    uploadToAlbum:
      baseurl + 'upload-album-profilepic.php?api_key=HASH490J669&user_id=',
    deleteFromAlbum: baseurl + 'delete-album.php?api_key=HASH490J669&user_id=',
    searchUser: baseurl + 'search-userid.php?api_key=HASH490J669&user_id=',
    earned: baseurl + 'earned.php?api_key=HASH490J669&user_id=',
    spend: baseurl + 'spend.php?api_key=HASH490J669&user_id=',
    payoutLog: baseurl + 'payout-log.php?api_key=HASH490J669&user_id=',
    buyUserPoints: baseurl + 'buy-points.php?api_key=HASH490J669&user_id=',
    UpdatePayment: baseurl + 'points-payment.php?api_key=HASH490J669&user_id=',
    applyPayout: baseurl + 'payout.php?api_key=HASH490J669&user_id=',
    logOut: baseurl + 'logout.php?api_key=HASH490J669&user_id=',
    SocialSignup: baseurl + 'socialmedia-login.php?api_key=HASH490J669&action=',
    updateGenAndAge: baseurl + 'save-gender.php?api_key=HASH490J669&user_id=',
    contactUs: baseurl + 'contact-us.php?api_key=HASH490J669&user_id=',
    giftShop: baseurl + 'gift-shop.php?api_key=HASH490J669&user_id=',
    giftDetails: baseurl + 'gift-details.php?api_key=HASH490J669&user_id=',
    giftPayment: baseurl + 'gift-payment.php?api_key=HASH490J669&user_id=',
    giftPaymentUpdate:
      baseurl + 'giftpayment-update.php?api_key=HASH490J669&user_id=',
    deleteAccount: baseurl + 'delete-account.php?api_key=HASH490J669&user_id=',
    giftsForSend: baseurl + 'gift-forsend.php?api_key=HASH490J669&user_id=',
    sendGift: baseurl + 'send-gift.php?api_key=HASH490J669&user_id=',
    updateFooter: baseurl + 'footer-count.php?api_key=HASH490J669&user_id=',
    clearChatList: baseurl + 'clear-history.php?api_key=HASH490J669&user_id=',
    blockUnblock: baseurl + 'block-unblock.php?api_key=HASH490J669&user_id=',
    reportProfile: baseurl + 'report-profile.php?api_key=HASH490J669&user_id=',
    updateOnlineStatus:
      baseurl + 'save-onlinestatus.php?api_key=HASH490J669&user_id=',
    forgetPassword:
      baseurl + 'forgot-password.php?api_key=HASH490J669&email_id=',
    sendDeviceId: baseurl + 'save-deviceid.php?api_key=HASH490J669&user_id=',
    initiateTransaction:baseurl + 'paytm-checksum.php?api_key=HASH490J669&order_id=',
    verifyChecksum:
      baseurl + 'paytm-verifysignature.php?api_key=HASH490J669&order_id=',
    randomCall: baseurl + 'random-call.php?api_key=HASH490J669&user_id=',
    getRemainigSecond: baseurl + 'get-remainingsecond.php?api_key=HASH490J669&user_id=',
    chatPackage:baseurl + 'chat-package.php?api_key=HASH490J669&user_id=',
    chatPayment:baseurl + 'chat-payment.php?api_key=HASH490J669&user_id=',
  chatPaymentUpdate: baseurl + 'chatpayment-update.php?api_key=HASH490J669&user_id=',
  OnlineUser: baseurl + 'show-onlineuser.php?api_key=HASH490J669&user_id=',
  subscription: baseurl + 'mychat-subscription.php?api_key=HASH490J669&user_id=',
  },
};
export default strings;
// This is chatPackage
// https://dadio.in/apps/serverapi/server/chat-package.php?api_key=HASH490J669

// This is the chatPayment 
// https://www.dadio.in/apps/serverapi/server/chat-payment.php?api_key=HASH490J669
// Chat Payment Update
// https://www.dadio.in/apps/serverapi/server/chatpayment-update.php?api_key=HASH490J669

// Create Paytm Checksum with Transaction Token
// https://www.dadio.in/apps/serverapi/server/paytm-checksum.php?api_key=HASH490J669

// Verify Signature
// https://www.dadio.in/apps/serverapi/server/paytm-verifysignature.php?api_key=HASH490J669

// Chat Payment Update


// Create Paytm Checksum with Transaction Token
// https://www.dadio.in/apps/serverapi/server/paytm-checksum.php?api_key=HASH490J669

// Verify Signature
// https://www.dadio.in/apps/serverapi/server/paytm-verifysignature.php?api_key=HASH490J669

// Api for the OnlineUser
// https://www.dadio.in/apps/serverapi/server/show-onlineuser.php


// My Subscription history
// https://www.dadio.in/apps/serverapi/server/mychat-subscription.php
// api_key=HASH490J669
// user_id