import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Dimensions,
} from 'react-native';
import Header from 'comp/Header';
import R from 'res/R';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TextInputView from 'comp/TextInputView';
import Loader from 'comp/Loader';
import Utils from 'res/Utils';
import Toast from 'react-native-simple-toast';
import RazorpayCheckout from 'react-native-razorpay';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';
import PayTm from '../Payment/PaymentViaPayTM';
import { AppInstalledChecker, CheckPackageInstallation } from 'react-native-check-app-install';


const windowWidth = Dimensions.get('window').width;
export default class BuyChat extends React.Component {
  constructor() {
    super();
    this.state = {
      points: 10,
      isLoading: true,
      points: 0,
      RedeemedPoints: 0,
      paymentMode: 0,
      body: '',
      userData:"",
      data:"",
      entries:'',
      // orderId:'',
    };
  }
  goBack() {
    this.props.navigation.goBack(null);
  }
  
  componentDidMount() {
   this.getDetails();
  }

  getDetails()
  {
        Utils.ApiPost(`${R.constants.Api.basicInfo}${this.props.navigation.getParam('userId')}`,response =(data)=>{
          if(data.res==200){
              if(data.data.res_status=="success"){
                  console.log("basicInfo In BuyChat===>",data.data)
                  this.setState({
                    entries: data.data,
                  });
                  this.setState({isLoading: false})
                }
          }
      })
  }
 
  applyPoints() {
    if (this.state.points == '') {
      Toast.show('Please enter Points!', Toast.SHORT);
    } else {
      if (parseInt(this.state.points) > parseInt(this.state.userData.my_points)) {
        Toast.show('Not Enough Points!', Toast.SHORT);
      } else if (
        parseInt(this.state.points) > parseInt(this.props.navigation.getParam('packagePrice'))
      ) {
        Toast.show('Cannot redeem points more than the price!', Toast.SHORT);
      } else {
        this.setState({RedeemedPoints: this.state.points});
      }
    }
  }
    clickPay() {
    if (this.state.paymentMode == 0) {
      if (
        parseInt(this.props.navigation.getParam('packagePrice')) - parseInt(this.state.RedeemedPoints) == 0
      ) {
        console.log("This is the clickPAy First !!!!1")
        this.chatPayment();
        
      } else {
        console.log("This is the clickPAy second!!!!2")
        Toast.show('Please select a payment mode!', Toast.SHORT);
      }
    } else {
      
      if(this.state.paymentMode == 1){
        try{
          AppInstalledChecker
          // .checkURLScheme('net.one97.paytm') 
          .isAppInstalled('paytm') 
          .then((isInstalled) => {
            if(isInstalled){
              console.log("App Installed");
              this.chatPayment();
            }else{
              console.log("App not Installed");
              Toast.show('Please Install Paytm App to make payment by Paytm ', Toast.SHORT);
            }
          });
        }catch (e) {
          console.log('Error')
        }
      }else{
        this.chatPayment();
      }
      }
}

  chatPayment() {
    this.setState({isLoading: true});
    console.log(`${R.constants.Api.chatPayment}${this.props.navigation.getParam('userId')}&package_id=${this.props.navigation.getParam('packageid')}&apply_points=${this.state.RedeemedPoints}`)
    Utils.ApiPost(`${R.constants.Api.chatPayment}${this.props.navigation.getParam('userId')}&package_id=${this.props.navigation.getParam('packageid')}&apply_points=${this.state.RedeemedPoints}`,
      (response = (data) => {
        console.log('current data========>',JSON.stringify(data))
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // order_id : data.data.order_id;
            // this.setState({
            //   orderId:data.data.order_id
            // })
            console.log("this is the oder id",data.data.order_id);
            this.paymentGateway(data.data.order_id);
            // this.paymentGateway(this.state.orderId);
            
          }
        }
      })
    );
  }

  paymentGateway(orderId) {
    if (
      parseInt(this.state.RedeemedPoints) ==
      parseInt(this.props.navigation.getParam('packagePrice'))
      
    ) {
      console.log("this is the payment sucessfull by Points");
      Toast.show('Payment Successful', Toast.SHORT);
      this.setState({isLoading: false}, () => this.props.navigation.goBack());
    } else {
      if (this.state.paymentMode == 1) {
        
        // Payment Via PayTM
        amount = parseFloat(this.props.navigation.getParam('packagePrice')) - parseFloat(this.state.RedeemedPoints);
        console.log('amount :', amount);
        userId = (this.props.navigation.getParam('userId'));
        // alert(userId);
        console.log('userId: ', userId);


        PayTm.startPayment(
          orderId,
          amount,
          userId,
          'chat',
          (paymentComplete) => {
            if (paymentComplete) {
              console.log("Payment sucess is loading .....")
              this.setState({isLoading: false}, () =>
                this.props.navigation.goBack(),
              );
            } else {
              this.setState({isLoading: false});
            }
          },
        );
      } else if (this.state.paymentMode == 2) {
        // Payment Via RazorPay
        // this.setState({isLoading:false});
        Utils.getData(
          'userData',
          (value = (data) => {
            var userData = JSON.parse(data.value);
            console.log(userData);
            var options = {
              description: 'Credits',
              currency: 'INR',
              key: 'rzp_live_TOJcBVkVESeFKa',
              amount:
              // parseFloat(this.props.navigation.getParam('packagePrice'))
                ((parseFloat(this.props.navigation.getParam('packagePrice')) - parseFloat(this.state.RedeemedPoints))) * 100, name: 'Dadio',
              // order_id: orderId,//Replace this with an order_id created using Orders API. Learn more at https://razorpay.com/docs/api/orders.
              prefill: {
                email: userData.email_id,
                contact: '',
                name: userData.display_name,
              },
            };
            RazorpayCheckout.open(options)
              .then((item) => {
                // handle success
                Toast.show('Payment Successful', Toast.SHORT);
                console.log('data.data.order_id===>', item);
                this.UpdatePayment(
                  'success',
                  item.razorpay_payment_id,
                  orderId,
                );
              })
              .catch((error) => {
                // handle failure
                let json = error.description;
                this.UpdatePayment('failure', '', orderId);
                console.log(error);
                Toast.show('Payment Failed', Toast.SHORT);
              });
            this.setState({isLoading: false});
          }),
        );
      }
    }
  }

  UpdatePayment(status, paymentId, orderId) {
    console.log(`${R.constants.Api.chatPaymentUpdate}${this.props.navigation.getParam('userId')}&action=${status}&order_id=${orderId}`)
    Utils.ApiPost(
      `${R.constants.Api.chatPaymentUpdate}${this.props.navigation.getParam('userId')}&action=${status}&order_id=${orderId}`,
      (response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // this.paymentGateway(data.data.order_id)
            this.setState({isLoading: false}, () =>
              this.props.navigation.goBack(),
            );
          }
        }
      }),
    );
  }
  render() {
    // const data = this.props.navigation.getParam('data')
    const { navigation } = this.props;
// console.log('========================='+data);
    return (
      <View style={{flex: 1}}>
        <Header
          backClick={() => this.props.navigation.goBack()}
          title={'Chat Subscription'}
        />
        <KeyboardAwareScrollView style={{padding: 20}}>
          <View style={{flexDirection: 'row', marginVertical: 10}}>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#fff',
                borderRadius: 5,
                paddingVertical: 10,
                flexDirection:'row',
                justifyContent:'space-between',
              }}>
                <View
              style={{
                flex: 1.5,
                justifyContent: 'flex-end',
                marginHorizontal: 10,
              }}>
                <Text style={{fontWeight:'700',color: '#232323', fontSize: 16}}> Package Name</Text>
                <Text style={{fontWeight:'700',color: '#232323', fontSize: 16}}> Plan Name</Text>
                <Text style={{fontWeight:'700',color: '#232323', fontSize: 16}}> Package Validity</Text>
                <Text style={{fontWeight:'700',color: '#232323', fontSize: 16}}> Price</Text>
                
              </View>
            <View
              style={{
                flex: 1.5,
                justifyContent: 'flex-start',
                marginHorizontal: 10,
              }}>
              <Text
                style={{ fontWeight: 'bold', color: '#232323', fontSize: 16}}>:  {navigation.getParam('packageid').toUpperCase()}
              </Text>
              <Text style={{fontWeight:'700',color: '#232323', fontSize: 16}}>:  {navigation.getParam('packageName')}
              </Text>
              <Text style={{fontWeight:'700',color: '#232323', fontSize: 16}}>:  {navigation.getParam('packageValidity')}
              </Text>
              <View style={{flexDirection:'row'}}>
              <Text style={{fontWeight:'700',color: '#232323', fontSize: 16}}>:  {parseInt(navigation.getParam('packagePrice'))}
              </Text>
              <Icon name="currency-inr" size={15} color="#232323" style={{padding:4}} />
              </View>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: '#fff',
              borderRadius: 5,
              paddingHorizontal: 10,
              marginVertical: 10,
            }}>
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}>
              <Text>Package Price </Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="currency-inr" size={15} color="#232323" />
                <Text>
                {parseInt(navigation.getParam('packagePrice'))}
                </Text>
              </View>
            </View>
            {this.state.RedeemedPoints > 0 && (
              <View
                style={{width: '100%', height: 1, backgroundColor: '#d3d3d3'}}
              />
            )}
            {this.state.RedeemedPoints > 0 && (
              <View
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 10,
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingVertical: 10,
                }}>
                <Text style={{fontWeight: 'bold', color: 'lightgreen'}}>
                  Points Redeemed
                </Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon name="currency-inr" size={15} color="#232323" />
                  <Text style={{fontWeight: 'bold'}}>
                    {this.state.RedeemedPoints}
                  </Text>
                </View>
              </View>
            )}
            <View
              style={{width: '100%', height: 1, backgroundColor: '#d3d3d3'}}
            />
            <View
              style={{
                paddingHorizontal: 10,
                paddingVertical: 10,
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 10,
              }}>
              <Text style={{fontWeight: 'bold'}}>Payable Amount</Text>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Icon name="currency-inr" size={15} color="#232323" />
                <Text style={{fontWeight: 'bold'}}>
                {parseInt(navigation.getParam('packagePrice')) - this.state.RedeemedPoints}
                </Text>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: 'lightblue',
              borderRadius: 5,
              marginVertical: 10,
            }}>
            <Text
              style={{
                paddingHorizontal: 20,
                paddingVertical: 10,
                fontWeight: 'bold',
              }}>
              Apply Points
            </Text>
            <View
              style={{
                backgroundColor: '#fff',
                padding: 20,
                alignItems: 'center',
                borderBottomStartRadius: 5,
                borderBottomEndRadius: 5,
              }}>
              <Text style={{fontWeight: 'bold', marginBottom: 10}}>
               {/* {navigation.getParam('packageid').toUpperCase()} */}
               My Point : {this.state.entries.my_points}
              </Text>
              <View style={{flexDirection: 'row'}}>
                <View style={{flex: 3, marginEnd: 10}}>
                  <TextInput
                    style={{
                      borderBottomWidth: StyleSheet.hairlineWidth,
                      borderBottomColor: '#d3d3d3',
                      height: 40,
                    }}
                    onChangeText={(text) => this.setState({points: text.replace(/[^0-9]/g, '')})}
                    placeholder={'Redeem your points here'}
                    value={'' + this.state.points}
                    keyboardType={'decimal-pad'}

                    // onChangeValue={(text) =>
                    //   this.setState({value: text.replace(/[^0-9]/g, '')})
                    // }

                  />
                </View>
                <TouchableOpacity
                  onPress={() => this.applyPoints()}
                  style={{
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: R.colors.cyan,
                    marginStart: 10,
                    borderRadius: 5,
                  }}>
                  <Text style={{color: '#fff'}}>Apply</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          {parseInt(navigation.getParam('packagePrice')) -
            parseInt(this.state.RedeemedPoints) !==
            0 && (
            <View>
              <View style={{height: 45, padding: 10}}>
                <TouchableOpacity
                  onPress={() => this.setState({paymentMode: 1})}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon
                    name={
                      this.state.paymentMode == 1
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                    size={20}
                    color="#000"
                  />
                  <Text style={{marginHorizontal: 10}}>Paytm</Text>
                </TouchableOpacity>
              </View>
              <View style={{height: 45, padding: 10}}>
                <TouchableOpacity
                  onPress={() => this.setState({paymentMode: 2})}
                  style={{flexDirection: 'row', alignItems: 'center'}}>
                  <Icon
                    name={
                      this.state.paymentMode == 2
                        ? 'radiobox-marked'
                        : 'radiobox-blank'
                    }
                    size={20}
                    color="#000"
                  />
                  <Text style={{marginHorizontal: 10}}>Other Options</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          <View style={{marginVertical: 30}}>
            <TouchableOpacity
              onPress={() => this.clickPay()}
              style={{
                height: 50,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#232323',
              }}>
              <Text style={{fontSize: 16, paddingHorizontal: 5, color: '#fff'}}>
                {parseInt(navigation.getParam('packagePrice')) -
                  parseInt(this.state.RedeemedPoints) ==
                0
                  ? 'BUY'
                  : 'PAY'}
              </Text>
            </TouchableOpacity>
          </View>
        </KeyboardAwareScrollView>
        {this.state.isLoading && (
          <View
            style={{
              zindex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              position: 'absolute',
              height: '100%',
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Loader />
          </View>
        )}
      </View>
    );
  }
}
