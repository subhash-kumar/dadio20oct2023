import React from 'react';
import {View, Text, Picker, BackHandler, Dimensions} from 'react-native';
import Header from 'comp/Header';
import Icon from 'react-native-vector-icons/FontAwesome';
import R from 'res/R';
import Button from 'comp/Button';
import Utils from 'res/Utils';
import TextInputView from 'comp/TextInputView';
import Toast from 'react-native-simple-toast';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scrollview';

export default class Payout extends React.Component {
  constructor() {
    super();
    this.state = {
      user_id: '',
      pointsValue: '',
      payoutValue: '',
      payoutMode: '',
      payTmNumber: '',
      bankName: '',
      ifsc: '',
      holderName: '',
      accountNumber: '',
    };

    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
  }

  handleBackButtonClick() {
    this.goBack();
    return true;
  }

  componentDidMount() {
    BackHandler.addEventListener(
      'hardwareBackPress',
      this.handleBackButtonClick,
    );
    this.getUserId();
  }

  getUserId() {
    Utils.getData(
      'userData',
      (value = (data) => {
        var userData = JSON.parse(data.value);
        this.setState({user_id: userData.user_id}, () => {
          this.getProfileDetails();
        });
      }),
    );
  }

  getProfileDetails() {
    this.setState({isLoading: true});
    Utils.ApiPost(
      `${R.constants.Api.basicInfo}${this.state.user_id}`,
      (response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // console.log("basicInfo service===>",data.data)
            this.setState({pointsValue: data.data}, () => {
              this.clearform('all');
            });
          }
        }
      }),
    );
  }

  goBack() {
    this.props.navigation.state.params.backFromPayout();
    this.props.navigation.goBack();
  }

  renderPaytm() {
    return (
      <View>
        <TextInputView
          title={'Paytm Mobile Number'}
          placeholder={'Enter Paytm Mobile Number'}
          textValue={this.state.payTmNumber}
          onChangeValue={(text) =>
            this.setState({payTmNumber: text.replace(/[^0-9]/g, '')})
          }
          keyboardType={'decimal-pad'}
          length={10}
        />
      </View>
    );
  }
  renderBank() {
    return (
      <View>
        <TextInputView
          title={'Bank Name'}
          placeholder={'Enter Bank Name'}
          textValue={this.state.bankName}
          onChangeValue={(text) => this.setState({bankName: text})}
          keyboardType={'default'}
        />
        <TextInputView
          title={'IFSC Code'}
          placeholder={'Enter IFSC Code'}
          textValue={this.state.ifsc}
          onChangeValue={(text) => this.setState({ifsc: text})}
          keyboardType={'default'}
          length={10}
        />
        <TextInputView
          title={'Account Holder Name'}
          placeholder={'Enter Account Holder Name'}
          textValue={this.state.holderName}
          onChangeValue={(text) => this.setState({holderName: text})}
          keyboardType={'default'}
        />
        <TextInputView
          title={'Account Number'}
          placeholder={'Enter Account Number'}
          textValue={this.state.accountNumber}
          onChangeValue={(text) =>
            this.setState({accountNumber: text.replace(/[^0-9]/g, '')})
          }
          keyboardType={'decimal-pad'}
          length={16}
        />
      </View>
    );
  }

  _ValidateInput() {
    let error = true;
    if (parseInt(this.state.payoutValue) < 100) {
      Toast.show('minimum payout value is 100', Toast.SHORT);
    } else if (this.state.payoutValue.trim() == '') {
      Toast.show('Please enter Amount', Toast.SHORT);
    } else {
      if (this.state.payoutMode == 'paytm') {
        if (this.state.payTmNumber.trim() == '') {
          Toast.show('please Enter Number', Toast.SHORT);
        } else if (this.state.payTmNumber.length !== 10) {
          Toast.show('Phone number should be 10 digits', Toast.SHORT);
        } else {
          error = false;
        }
      }
      if (this.state.payoutMode == 'bank') {
        if (this.state.bankName.trim() == '') {
          Toast.show('please Enter Bank Name', Toast.SHORT);
        } else if (this.state.ifsc.trim() == '') {
          Toast.show('please Enter ifsc code', Toast.SHORT);
        } else if (this.state.holderName.trim() == '') {
          Toast.show('please Enter Account holder name', Toast.SHORT);
        } else if (this.state.accountNumber.trim() == '') {
          Toast.show('please Enter Account Number', Toast.SHORT);
        } else {
          error = false;
        }
      }
      if (!error) {
        this.ApplyPayout();
      }
    }
  }

  ApplyPayout() {
    console.log(
      `${R.constants.Api.applyPayout}${
        this.state.pointsValue.user_id
      }&payout_mode=${this.state.payoutMode == 'paytm' ? '10' : '20'}${
        this.state.payoutMode == 'paytm'
          ? `&paytm_number=${this.state.payTmNumber}`
          : `&bank_name=${this.state.bankName}&ifsc_code=${this.state.ifsc}&account_holdername=${this.state.holderName}&account_number=${this.state.accountNumber}`
      }`,
    );
    Utils.ApiPost(
      `${R.constants.Api.applyPayout}${
        this.state.pointsValue.user_id
      }&enter_points=${this.state.payoutValue}&payout_mode=${
        this.state.payoutMode == 'paytm' ? '10' : '20'
      }${
        this.state.payoutMode == 'paytm'
          ? `&paytm_number=${this.state.payTmNumber}`
          : `&bank_name=${this.state.bankName}&ifsc_code=${this.state.ifsc}&account_holdername=${this.state.holderName}&account_number=${this.state.accountNumber}`
      }`,
      (response = (data) => {
        console.log('payout response===', this.state.payoutMode, '===>', data);
        this.getProfileDetails();
        Toast.show('Payout Applied Sucessfully.');
      }),
    );
  }

  clearform(type) {
    if (type == 'all') {
      this.setState({payoutValue: ''});
    }
    this.setState({
      payTmNumber: '',
      bankName: '',
      ifsc: '',
      holderName: '',
      accountNumber: '',
    });
  }

  render() {
    return (
      <View
        style={{
          height: Dimensions.get('screen').height - 50,
          backgroundColor: '#fff',
        }}>
        <Header backClick={() => this.goBack()} title={'Payout'} />
        <KeyboardAwareScrollView
          style={{height: Dimensions.get('screen').height - 100}}>
          <View
            style={{
              flexDirection: 'row',
              margin: 20,
              height: 50,
              borderRadius: 10,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: R.colors.cyan,
            }}>
            <Icon name="diamond" size={20} color="#232323" />
            <Text style={{fontSize: 16, paddingHorizontal: 5}}>
              My Points: {this.state.pointsValue.my_points}
            </Text>
          </View>
          <TextInputView
            title={'Enter Points To Redeem'}
            placeholder={'Enter Points'}
            textValue={this.state.payoutValue}
            onChangeValue={(text) =>
              this.setState({payoutValue: text.replace(/[^0-9]/g, '')})
            }
            keyboardType={'decimal-pad'}
            length={6}
          />
          <View style={{marginVertical: 10, paddingHorizontal: 20}}>
            <Text
              style={{paddingHorizontal: 4, fontSize: 16, fontWeight: 'bold'}}>
              Your Preferred Payout Mode
            </Text>
            <Picker
              selectedValue={this.state.payoutMode}
              style={{
                borderBottomWidth: 1,
                borderBottomColor: R.colors.placeHolderColor,
              }}
              onValueChange={(itemValue, itemIndex) =>
                this.setState({payoutMode: itemValue}, () => this.clearform(''))
              }>
              <Picker.Item label="Select Mode" value="" />
              <Picker.Item label="PayTm" value="paytm" />
              <Picker.Item label="Bank Account" value="bank" />
            </Picker>
          </View>
          {this.state.payoutMode == 'paytm' && this.renderPaytm()}
          {this.state.payoutMode == 'bank' && this.renderBank()}
        </KeyboardAwareScrollView>
        {this.state.payoutMode !== '' && (
          <View style={{position: 'absolute', bottom: 20, width: '100%'}}>
            <Button
              btnPress={() => this._ValidateInput()}
              btnStyle={{backgroundColor: R.colors.submit, flex: 1}}
              btnText={'PAYOUT'}
            />
          </View>
        )}
      </View>
    );
  }
}
