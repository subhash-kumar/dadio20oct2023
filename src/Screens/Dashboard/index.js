import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  BackHandler,
  Alert,
  PermissionsAndroid,
  Modal,
  TextInput,
  FlatList,
  StyleSheet,
  DeviceEventEmitter,
  AppState,
} from 'react-native';
import R from 'res/R';
import AsyncStorage from '@react-native-community/async-storage';
import Toast from 'react-native-simple-toast';
import Loader from 'comp/Loader';
import InCallManager from 'react-native-incall-manager';

import styles from './Styles';

import Account from 'src/Screens/Account';
import Logs from 'src/Screens/Logs';
import DashboardScreen from './DashboardScreen';
import Notifications from 'src/Screens/Notifications';
import { each } from 'underscore';

import Utils from 'res/Utils';

import Sound from 'react-native-sound';
import AudioRecord from 'react-native-audio-record';
import { Buffer } from 'buffer';

import IncomingCall from '../../native_modules/IncomingCall';

//import RNDisableBatteryOptimizationsAndroid from 'react-native-disable-battery-optimizations-android';

var profileAudio;
var intervalId = 0;
var intervalId2 = 0;
let exit = false;
let incomingCallData = '';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
const options = {
  sampleRate: 16000, // default 44100
  channels: 1, // 1 or 2, default 1
  bitsPerSample: 16, // 8 or 16, default 16
  audioSource: 6, // android only (see below)
  wavFile: 'test.wav', // default 'audio.wav'
};
const helpOptions = [
  {
    id: '0',
    name: 'Quick Start Guide',
  },
  {
    id: '1',
    name: 'FAQ',
  },
  {
    id: '2',
    name: 'Privacy Policy',
  },
  {
    id: '3',
    name: 'Contact Us',
  },
];
let callIdTemp;
export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      calledUser: '',
      selTab: 1,
      Alert_Visibility: false,
      Call_Alert_Visibility: false,
      modalContentValue: 0,
      isLoading: false,
      about: '',
      userProfileId: '',
      user_id: '',
      isPlaying: false,
      audioUri: '',
      isRecording: false,
      timer: '',
      SearchUserError: '',
      permissionsError: true,
      recordUri: '',
      callData: '',
      logMessageData: [],
      logCallData: [],
      selectTab: 1,
      logTab: 1,
      nR: false,
      msgCount: 0,
      notifCount: 0,
      activeCall: 'false',
      timerValue: '',
    };
    AudioRecord.init(options);
    DeviceEventEmitter.addListener('incoming_call', (res) => {
      // let response=res.data.replace(/\"/g, "")
      console.log('incoming_call======> event====>', res.data);
      if (res.data.incomingcall_byid !== undefined) {
        incomingCallData = res.data;
        if (this.state.activeCall == 'false') {
          this.callStatus(res);
        } else {
          this.DeclineCall();
        }
      }
    });
    DeviceEventEmitter.addListener('decline_call', (res) => {
      console.log('decline_call======> event====>', res.data);
      this.setState({ Call_Alert_Visibility: false });
      this.DeclineCall();
      InCallManager.stopRingtone();
    });
    DeviceEventEmitter.addListener('end_call', (res) => {
      // if(this.state.Call_Alert_Visibility){
      console.log('end_call======> event====>', res.data);
      this.setState({ Call_Alert_Visibility: false });
      InCallManager.stopRingtone();
      // }
    });
    DeviceEventEmitter.addListener('update_footer', (res) => {
      console.log('update_footer======> event====>', res.data);
      // this.setState({Call_Alert_Visibility:false})
      // InCallManager.stopRingtone();
      this.updateFooterCount();
      this.setState({ selTab: res.nav ? res.nav : this.state.selTab });
    });
    DeviceEventEmitter.addListener('callTimer', (res) => {
      console.log('callTimer======> event====>', res.data);
      this.setState({ timerValue: res.data });
    });
    // Registering a listener to recieve call when app i closed/background
    DeviceEventEmitter.addListener('recieve', (res) => {
      this.setState({ callData: res.data }, () => {
        this.AcceptCall();
      });
    });
  }

  updateFooterCount() {
    Utils.ApiPost(
      `${R.constants.Api.updateFooter}${this.state.user_id}`,
      (response = (data) => {
        console.log('updateFooter', data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.setState(
              {
                msgCount: data.data.footer_msgcount,
                notifCount: data.data.footer_nfncount,
              },
              () => {
                this.getMessageList(0);
              },
            );
          }
        }
      }),
    );
  }
  backAction = () => {
    console.log('dashbord index back press');
    if (!exit) {
      exit = true;
      Toast.show('Press back again to exit', Toast.SHORT);
      setTimeout(() => {
        exit = false;
      }, 2000);
      return true;
    } else {
      BackHandler.exitApp();
      return true;
    }
  };
  callStatus(res) {
    Utils.ApiPost(
      `${R.constants.Api.callStatus}${res.data.incomingcall_id}`,
      (response = (data) => {
        console.log('callStatus====>', data);
        if (data.res == 200) {
          if (data.data.call_status == '20') {
            this.setState({ callData: res.data }, () => {
              InCallManager.startRingtone('_BUNDLE_');
              this.setState({ Call_Alert_Visibility: true });
            });
          }
        }
      }),
    );
  }

  componentDidMount() {
    this.getCallingStatus();
    this.backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      this.backAction,
    );
    this._retriveData();
    this.sendDeviceAndUserDetails();
    DeviceEventEmitter.emit('dashboardMounted');
  }
    componentWillUnmount() {
    this.backHandler.remove();
    DeviceEventEmitter.emit('dashboardUnmounted');
  }

  getMessageListPaginate(data) {
    console.log('pageNum===dashboard===>', data);
    this.getMessageList(data);
  }

  getCallingStatus() {
    Utils.getData(
      'activeCall',
      (value = (data) => {
        if (data.value == null) {
          // activeCall="false"
          this.setState({ activeCall: 'false' });
        } else {
          // activeCall=data.value
          // alert(data.value);
          this.setState({ activeCall: data.value });
          // alert(data.value);
        }
        console.log('activeCall===>', this.state.activeCall, data);
      }),
    );
  }

  getMessageList(pageNum) {
    // this.setState({isLoading:false})
    // this.setState({isLoading:true})
    Utils.ApiPost(
      `${R.constants.Api.messageList}${this.state.user_id}&pageid=${pageNum}`,
      (response = (data) => {
        // console.log("getMessageList=====>",JSON.stringify(data))
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            if (pageNum == 0) {
              this.setState({
                logMessageData: data.data.message_list,
                isLoading: false,
                nR: false,
              });
            } else {
              this.setState({
                logMessageData: this.state.logMessageData.concat(
                  data.data.message_list,
                ),
                isLoading: false,
              });
            }
          }
          if (data.data.res_status == 'no_data') {
            this.setState({
              nR: true,
              isLoading: false,
            });
          }
        }
      }),
    );
  }

  getCallList() {
    // this.setState({isLoading:true})
    Utils.ApiPost(
      R.constants.Api.callList + this.state.user_id,
      (response = (data) => {
        // console.log('call List data======>',JSON.stringify(data))
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.setState({
              logCallData: data.data.calllog_list,
              isLoading: false,
            });
          }
        }
      }),
    );
  }

  _retriveData() {
    this.setState({ isLoading: true });
    Utils.getData(
      'userData',
      (value = (data) => {
        var userData = JSON.parse(data.value);
        this.setState({ user_id: userData.user_id }, () => {
          // intervalId2=setInterval(()=>{
          //     this.checkIncomingCalls()
          // },900)
          this.getProfileDetails();
          this.getMessageList(0);
          this.getCallList();
          this.updateFooterCount();
        });
      }),
    );
  }

  sendDeviceAndUserDetails() {
    Utils.getData(
      'fcmToken',
      (value = (data) => {
        //console.log("FCM: ",data.value)
        Utils.ApiPost(
          `${R.constants.Api.sendDeviceId}${this.state.user_id}&device_token=${data.value}`,
          (response = (data) => {
            if (data.res == 200) {
              if (data.data.res_status == 'success') {
                console.log('save-deviceId', data);
              }
            }
          }),
        );
      }),
    );
  }

  checkPermission() {
    if (Platform.OS === 'android') {
      this.checkAndroidPermissions()
        .then(() => {
          this.setState({ permissionsError: false }, () => {
            this.startRecording();
          });
        })
        .catch((error) => {
          this.setState({ permissionsError: true, isLoading: false });
          console.log('checkAndroidPermissions', error);
          return;
        });
    }
  }

  checkAndroidPermissions = () =>
    new Promise((resolve, reject) => {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      ])
        .then((result) => {
          const permissionsError = {};
          permissionsError.permissionsDenied = [];
          each(result, (permissionValue, permissionType) => {
            if (permissionValue === 'denied') {
              console.log('denied Permission');
              permissionsError.permissionsDenied.push(permissionType);
              permissionsError.type = 'Permissions error';
            }
          });
          if (permissionsError.permissionsDenied.length > 0) {
            console.log('denied Permission');
            reject(permissionsError);
          } else {
            console.log('granted Permission');
            resolve();
          }
        })
        .catch((error) => {
          reject(error);
        });
    });

  getProfileDetails() {
    this.setState({ isLoading: true });
    Utils.ApiPost(
      `${R.constants.Api.basicInfo}${this.state.user_id}`,
      (response = (data) => {
        console.log("this is basic information" + data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            console.log('basicInfo service===>', data.data);
            this.setState({
              AccountInfo: data.data,
              isLoading: false,
              audioUri: data.data.audio_file,
            });
          }
        }
      }),
    );
  }

  _updateAboutMe() {
    Utils.ApiPost(
      `${R.constants.Api.updateAboutMe}${this.state.user_id}&aboutus_field=${this.state.about}`,
      (response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // console.log("updateDetails===>",data.data)
            Toast.show('About updated successfull', Toast.SHORT);
            this.getProfileDetails(this.state.user_id);
            this.AlertBoxVisibility();
          }
        } else {
          // this.setState({isLoading:false})
          Toast.show('please check your internet.', Toast.SHORT);
        }
      }),
    );
  }
  searchUser() {
    Utils.ApiPost(
      `${R.constants.Api.searchUser}${this.state.user_id}&user_searchid=${this.state.userProfileId}`,
      (response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            console.log('SearchDetails===>', data.data);

            this.AlertBoxVisibility();
            this.setState({ userProfileId: '' });
            this.profileClicked(data.data.profile_id);
          }
          if (data.data.res_status == 'invalid_id') {
            this.setState(
              {
                SearchUserError: `No user found with ID : ${this.state.userProfileId}`,
              },
              () => {
                setTimeout(() => {
                  this.setState({ SearchUserError: '' });
                }, 5000);
              },
            );
          }
        } else {
          // this.setState({isLoading:false})
          Toast.show('please check your internet.', Toast.SHORT);
        }
      }),
    );
  }

  goBack() {
    console.log('click');
    this.setState({ selTab: 1 });
  }

  AlertBoxVisibility() {
    this.setState({ Alert_Visibility: !this.state.Alert_Visibility });
  }

  openHelpOption(item) {
    console.log(item);
    this.backHandler.remove();
    this.props.navigation.navigate('Static', {
      userId: this.state.user_id,
      data: item,
    });
    this.AlertBoxVisibility();
  }

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          backgroundColor: 'lightgrey',
        }}
      />
    );
  };

  renderModel() {
    return (
      <Modal
        visible={this.state.Alert_Visibility}
        transparent={true}
        animationType={'fade'}
        onRequestClose={() => {
          this.AlertBoxVisibility();
        }}>
        {this.state.modalContentValue == 0
          ? this.deleteModalContent()
          : this.state.modalContentValue == 1
            ? this.helpModalContent()
            : this.state.modalContentValue == 2
              ? this.recordVoiceContent()
              : this.state.modalContentValue == 3
                ? this.editAboutContent()
                : this.state.modalContentValue == 4
                  ? this.searchUserContent()
                  : null}
      </Modal>


    );
  }

  startRecording() {
    AudioRecord.init(options);
    AudioRecord.start();
    var counter = 20;
    intervalId = setInterval(() => {
      this.setState({ timer: counter }, () => (counter = counter - 1));
    }, 1000);
    setTimeout(async () => {
      var formData = new FormData();
      var audioFile = await AudioRecord.stop();
      console.log('audio file====>', audioFile);
      var Data = {
        uri:
          Platform.OS === 'android'
            ? `file://${audioFile}`
            : audioFile.replace('file://', ''),
        type: 'audio/x-wav',
        name: 'test.wav',
      };
      formData.append('file', Data);
      console.log('formData===>', formData);
      this.saveRecording(formData);
      this.setState({ isRecording: false }, () => clearInterval(intervalId));
    }, 20000);
  }

  saveRecording = async (body) => {
    // console.log('formData===>',JSON.stringify(body))
    await Utils.ApiPostwithBody(
      `${R.constants.Api.saveAudio}${this.state.user_id}`,
      body,
      (response = (data) => {
        // console.log("saveRecording service===>",data)
        // if(data.res==200){
        //     if(data.data.res_status=="success"){
        this.getProfileDetails();
        console.log('saved');
        Toast.show('Recording saved', Toast.SHORT);
        //     }
        // }
      }),
    );
  };

  recordVoiceContent() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}>
        <View
          style={{ width: '85%', backgroundColor: '#232323', borderRadius: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Record Your Voice
            </Text>
            <TouchableOpacity
              onPress={() => {
                if (this.state.isPlaying) {
                  this.setState({ isPlaying: false }, () => {
                    this.stopAudio();
                  });
                }
                if (this.state.isRecording) {
                  this.setState({ isRecording: false, timer: 20 }, () => {
                    clearInterval(intervalId);
                    AudioRecord.stop();
                  });
                }
                this.AlertBoxVisibility();
              }}>
              <Icon name="close-thick" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              flexDirection: 'row',
              padding: 10,
              backgroundColor: '#fff',
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
            }}>
            <TouchableOpacity
              disabled={this.state.isRecording}
              onPress={() =>
                this.setState({ isRecording: true }, () => this.checkPermission())
              }
              style={{
                borderRadius: 10,
                margin: 10,
                flex: 2,
                flexDirection: 'row',
                backgroundColor: '#232323',
                padding: 10,
                alignItems: 'center',
              }}>
              {!this.state.isRecording && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Icon name="microphone" size={25} color="#fff" />
                  <Text style={{ color: '#fff', marginHorizontal: 5 }}>
                    Edit Recoding
                  </Text>
                </View>
              )}
              {this.state.isRecording && (
                <View style={{ flex: 1, alignItems: 'center', padding: 5 }}>
                  <Text style={{ color: '#fff' }}>
                    {this.state.timer == ''
                      ? 'please wait...'
                      : this.state.timer}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
            {!this.state.isRecording && (
              <TouchableOpacity
                onPress={() =>
                  this.setState({ isPlaying: !this.state.isPlaying }, () =>
                    this.state.isPlaying ? this.playAudio() : this.stopAudio(),
                  )
                }
                style={{
                  borderRadius: 10,
                  margin: 10,
                  flex: 1,
                  flexDirection: 'row',
                  backgroundColor: '#232323',
                  padding: 10,
                  alignItems: 'center',
                }}>
                <Icon
                  name={this.state.isPlaying ? 'stop-circle-outline' : 'play'}
                  size={25}
                  color="#fff"
                />
                <Text style={{ color: '#fff', marginHorizontal: 5 }}>
                  {this.state.isPlaying ? 'Stop' : 'Play'}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  }

  editAboutContent() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}>
        <View
          style={{ width: '90%', backgroundColor: '#232323', borderRadius: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              About Me
            </Text>
            <TouchableOpacity onPress={() => this.AlertBoxVisibility()}>
              <Icon name="close-thick" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              paddingHorizontal: 25,
              paddingVertical: 10,
              backgroundColor: 'white',
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
              alignItems: 'center',
            }}>
            <TextInput
              onChangeText={(text) => this.setState({ about: text })}
              style={{
                borderWidth: StyleSheet.hairlineWidth,
                width: '100%',
                borderRadius: 5,
              }}
              value={this.state.about}
            />
            <TouchableOpacity
              onPress={() => this._updateAboutMe()}
              style={{
                height: 40,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#232323',
                paddingHorizontal: 10,
                margin: 10,
              }}>
              <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#fff' }}>
                UPDATE
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  searchUserContent() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}>
        <View
          style={{ width: '90%', backgroundColor: '#232323', borderRadius: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Search User
            </Text>
            <TouchableOpacity onPress={() => this.AlertBoxVisibility()}>
              <Icon name="close-thick" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              paddingHorizontal: 25,
              paddingVertical: 10,
              backgroundColor: 'white',
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
              alignItems: 'center',
            }}>
            {this.state.SearchUserError !== '' && (
              <Text
                style={{
                  color: 'red',
                  fontSize: 18,
                  margin: 5,
                  fontWeight: 'bold',
                }}>
                {this.state.SearchUserError}
              </Text>
            )}
            <TextInput
              placeholder={'Profile Id'}
              onChangeText={(text) => this.setState({ userProfileId: text })}
              style={{
                borderWidth: StyleSheet.hairlineWidth,
                width: '100%',
                borderRadius: 5,
              }}
              value={this.state.userProfileId}
            />
            <TouchableOpacity
              onPress={() => this.searchUser()}
              style={{
                height: 40,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#232323',
                paddingHorizontal: 10,
                margin: 10,
              }}>
              <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#fff' }}>
                SEARCH
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  deleteModalContent() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}>
        <View
          style={{ width: '85%', backgroundColor: '#232323', borderRadius: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Delete Account
            </Text>
            <TouchableOpacity onPress={() => this.AlertBoxVisibility()}>
              <Icon name="close-thick" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              paddingHorizontal: 25,
              paddingVertical: 10,
              backgroundColor: 'white',
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
              alignItems: 'center',
            }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', width: '100%' }}>
              Account Deletion - This action cannot be reverted
            </Text>
            <TouchableOpacity
              onPress={() => this.deleteAccount()}
              style={{
                height: 40,
                borderRadius: 10,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#232323',
                paddingHorizontal: 10,
                margin: 10,
              }}>
              <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#fff' }}>
                Yes Delete Account
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  helpModalContent() {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.8)',
        }}>
        <View
          style={{ width: '85%', backgroundColor: '#232323', borderRadius: 10 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              padding: 20,
            }}>
            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
              Need Help ?
            </Text>
            <TouchableOpacity onPress={() => this.AlertBoxVisibility()}>
              <Icon name="close-thick" size={25} color="#fff" />
            </TouchableOpacity>
          </View>
          <View
            style={{
              paddingHorizontal: 25,
              paddingVertical: 10,
              backgroundColor: 'white',
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
            }}>
            <FlatList
              data={helpOptions}
              ItemSeparatorComponent={this.FlatListItemSeparator}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                return (
                  <TouchableOpacity
                    style={{ paddingVertical: 10 }}
                    onPress={() => this.openHelpOption(item)}>
                    <Text
                      style={{ fontSize: 16, fontWeight: 'bold', width: '100%' }}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                );
              }}
            />
          </View>
        </View>
      </View>
    );
  }

  backFromChatScreen(data, value) {
    console.log('backFromChatScreen===>', data, '===>', value);
    this.getCallingStatus();
    this.updateFooterCount();
    if (data == 'navGift') {
      this.backHandler.remove();
      this.props.navigation.navigate('GiftShop');
    }
    if (data == 'messageList') {
      console.log(data);
      this.getMessageList(0);
    }
    if (data == 'createCall') {
      this.createCall(value, 'outgoing');
    }
    // this is adding for the Online user
    if (data == 'OnlineUser') {
      this.backHandler.remove();
      this.props.navigation.navigate('OnlineUser');
    }
    if (data == 'MostActiveUser') {
      this.backHandler.remove();
      this.props.navigation.navigate('MostActiveUser');
    }

  }

  backFromCall() {
    this.getCallingStatus();
    // activeCall=false
    if (this.state.selTab == 4) {
      console.log('this.state.logTab====>', this.state.logTab);
      this.getMessageList(0);
      this.getCallList();
    }
    DeviceEventEmitter.emit('activecalldetails', { data: '' });
    // intervalId2=setInterval(()=>{
    //     this.checkIncomingCalls()
    // },900)
  }

  backFromBasicInfo(data) {
    console.log('databack', data);
    this.getProfileDetails();

    // this._retriveData()
    if (data == 'home') {
      this.setState({ selTab: 1 });
    }
  }

  messageClick(data) {
    console.log('messageClick==>' + data.profile_id);
    // this.props.navigation.navigate("ChatScreen",{"data":data})
    this.backHandler.remove();
    this.props.navigation.navigate('ChatScreen', {
      profileId: data.profile_id,
      backFromChatScreen: this.backFromChatScreen.bind(this),
    });
  }

  callClick(data) {
    console.log('callClick=====>', data);
    this.setState({ calledUser: data });
    this.createCall(data, 'outgoing');
  }

  makeRandomCall() {
    Utils.ApiPost(
      `${R.constants.Api.randomCall}${this.state.user_id}`,
      (response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            console.log(
              'randomCall=====>',
              'profile_id===>' + data.data.profile_id,
            );
            this.createCall(
              {
                profile_id: data.data.profile_id,
                display_name: data.data.profile_name,
                profile_pic: data.data.profile_pic,
              },
              'outgoing',
            );
          } else if (
            data.data.res_status != '400' &&
            data.data.res_status != '500'
          ) {
            Toast.show(data.data.res_status, Toast.LONG);
          }
        }
      }),
    );
  }

  createCall(data, value) {
    this.backHandler.remove();

    // console.log("Create call to :===>",data,"====>",value)
    // clearInterval(intervalId2)
    // console.log(this.state.activeCall == 'true', data);
    if (this.state.activeCall == 'false') {
      // console.log(this.state.activeCall == 'true', data);
            // activeCall=true
      this.props.navigation.push('Call', {
        type: value,
        callDetails: data,
        backFromCall: this.backFromCall.bind(this),
      });
    } else {
      console.warn('alreadyActive');
      this.props.navigation.push('Call', {
        type: value,
        callDetails: data,
        backFromCall: this.backFromCall.bind(this),
      });
    }
  }

  checkIncomingCalls = async () => {
    // console.log(intervalId2)
    await Utils.ApiPost(
      `${R.constants.Api.incomingCalls}${this.state.user_id}`,
      (response = (data) => {
        // console.log("incomingCalls==>",data)
        if (data.data.res_status == 'success') {
          this.setState({ callData: data.data }, () => {
            this.setState({ Call_Alert_Visibility: true });
          });
        } else {
          this.setState({ callData: '' }, () => {
            this.setState({ Call_Alert_Visibility: false });
          });
        }
      }),
    );

    // RNDisableBatteryOptimizationsAndroid.isBatteryOptimizationEnabled().then((isEnabled)=>{
    //     // console.log("isEnable==>",isEnabled)
    //     if(isEnabled){
    //         RNDisableBatteryOptimizationsAndroid.openBatteryModal();
    //     }
    // });

    // if(this.state.Call_Alert_Visibility&&this.state.callData!==""&&this.state.callData.call_id!==callIdTemp){
    //     InCallManager.startRingtone('_BUNDLE_')
    // }
    // else{
    //     InCallManager.stopRingtone();
    //     InCallManager.stop();
    // }
  };
  callAlertBoxVisibility() {
    this.setState({ Call_Alert_Visibility: !this.state.Call_Alert_Visibility });
  }

  AcceptCall() {
    console.log('Accept');
    this.callAction('answer');
    InCallManager.stopRingtone();
    // InCallManager.start();
  }

  callAction(type) {
    // Utils.ApiPost(`${type=="answer"?R.constants.Api.answerCall:R.constants.Api.declineCall}${this.state.callData.call_id}`,response=(data)=>{
    // if(data.data.res_status=="success"){
    console.log('this.state.logTab=====>', this.state.logTab);
    // clearInterval(intervalId2)
    console.log('Data Wanted == >', this.state.callData);
    type == 'answer'
      ? this.createCall(this.state.callData, 'incoming')
      : this.declineCallWebService();
    // }
    // })
  }

  declineCallWebService() {
    Utils.ApiPost(
      `${R.constants.Api.declineCall}${this.state.callData.incomingcall_id}`,
      (response = (data) => {
        if (data.data.res_status == 'success') {
          // console.log("this.state.logTab=====>",this.state.logTab)
          this.getMessageList(0);
          this.getCallList();
          // intervalId2=setInterval(()=>{
          //     this.checkIncomingCalls()
          // },900)
        }
      }),
    );
  }

  DeclineCall() {
    this.callAction('decline');
    console.log('Decline');
    InCallManager.stopRingtone();
    // InCallManager.stop();
  }

  renderCallModel() {
    return (
      <Modal
        visible={this.state.Call_Alert_Visibility}
        transparent={true}
        animationType={'slide'}
        onRequestClose={() => {
          this.AlertBoxVisibility();
        }}>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'flex-start',
            backgroundColor: 'rgba(0,0,0,0.7)',
          }}>
          <View
            style={{
              width: '100%',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              borderBottomStartRadius: 10,
              borderBottomEndRadius: 10,
            }}>
            <Text style={{ fontSize: 16, marginVertical: 15, color: '#05adf6' }}>
              Dadio Incoming Call
            </Text>
            <Text style={{ fontSize: 18, marginVertical: 15, color: '#05adf6' }}>
              {this.state.callData.incomingdisplay_name}
            </Text>
            <View style={{ width: '100%', flexDirection: 'row' }}>
              <TouchableOpacity
                onPress={() => {
                  // clearInterval(intervalId2)
                  // callIdTemp=this.state.callData.call_id
                  this.callAlertBoxVisibility();
                  this.DeclineCall();
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 5,
                  margin: 20,
                  padding: 15,
                  backgroundColor: R.colors.submit,
                  elevation: 10,
                }}>
                <Text style={{ color: '#fff' }}>Decline</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  // clearInterval(intervalId2)
                  // callIdTemp=this.state.callData.call_id
                  this.callAlertBoxVisibility();
                  this.AcceptCall();
                }}
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 5,
                  margin: 20,
                  padding: 15,
                  backgroundColor: 'green',
                  elevation: 10,
                }}>
                <Text style={{ color: '#fff' }}>Receive</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  }

  AccountMenu(data, value) {
    console.log(data);
    this.backHandler.remove();
    switch (data) {
      case 'profileImage': {
        this.props.navigation.navigate('EditProfile', {
          details: this.state.AccountInfo,
          backFromBasicInfo: this.backFromBasicInfo.bind(this),
        });
        break;
      }
      case 'recordVoice': {
        console.log('audioUri=====>', value);
        this.setState({ modalContentValue: 2, audioUri: value }, () =>
          this.AlertBoxVisibility(),
        );
        break;
      }
      case 'about': {
        console.log('about=====>', value);
        this.setState({ modalContentValue: 3, about: value }, () =>
          this.AlertBoxVisibility(),
        );
        break;
      }
      case 'search': {
        console.log('search=====>', value);
        this.setState({ modalContentValue: 4 }, () => this.AlertBoxVisibility());
        break;
      }
      case 'OnlineUser': {
        console.log('OnlineUser=====>');
        this.props.navigation.navigate('OnlineUser');
        // this.props.navigation.navigate('OnlineUser', {
        //   details: this.state.AccountInfo,
        //   backFromBasicInfo: this.backFromBasicInfo.bind(this),
        // });
        break;
      }
      case 'MostActiveUser': {
        console.log('MostActiveUser=====>');
        this.props.navigation.navigate('MostActiveUser');
        break;
      }
      case 'info': {
        this.props.navigation.navigate('BasicInfo', {
          details: this.state.AccountInfo,
          backFromBasicInfo: this.backFromBasicInfo.bind(this),
        });
        break;
      }
      case 'giftShop': {
        this.props.navigation.navigate('GiftShop');
        break;
      }
      case 'chatpaid': {
        this.props.navigation.navigate('ChatPaid');
        break;
      }
      case 'buyChat': {
        this.props.navigation.navigate('ChatPaid');
        break;
      }
      // this is plan Validity
      case 'PlanValidity': {
        this.props.navigation.navigate('PlanValidity');
        break;
      }
      case 'Chating valid': {
        this.props.navigation.navigate('ChatingValid');
        this.
          break;
      }
      case 'myGift': {
        this.props.navigation.navigate('MyGift');
        break;
      }
      case 'reffer': {
        this.props.navigation.navigate('Reffer', {
          details: this.state.AccountInfo,
        });
        break;
      }
      case 'password': {
        this.props.navigation.navigate('UpdatePassword');
        break;
      }
      case 'preferences': {
        this.props.navigation.navigate('MyPreference', {
          details: this.state.AccountInfo,
          backFromBasicInfo: this.backFromBasicInfo.bind(this),
        });
        break;
      }
      case 'callLog': {

        // this.props.navigation.navigate('call', {
        //   details: this.state.AccountInfo,
        // });
        this.setState({ selTab: 4, logTab: 2, selectTab: 2 })
        break;
      }
      case 'privacy': {
        this.props.navigation.navigate('PrivacyControls', {
          details: this.state.AccountInfo,
          backFromBasicInfo: this.backFromBasicInfo.bind(this),
        });
        break;
      }
      case 'delete': {
        this.setState({ modalContentValue: 0 }, () => this.AlertBoxVisibility());
        break;
      }
      case 'points': {
        this.props.navigation.navigate('Points', {
          details: this.state.AccountInfo,
        });
        break;
      }
      case 'help': {
        this.setState({ modalContentValue: 1 }, () => this.AlertBoxVisibility());
        break;
      }
      case 'logout': {
        this.removeItemValue();
        break;
      }

    }
  }

  bottomTab() {
    return (
      <View
        style={{
          flex: 1,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-evenly',
          backgroundColor: '#fff',
          paddingHorizontal: 10,
        }}>
        <View style={{ flex: 1, margin: 5 }}>
          <TouchableOpacity
            style={{ alignItems: 'center', justifyContent: 'center' }}
            onPress={() =>
              this.setState({ selTab: 1 }, () => this.updateFooterCount())
            }>
            <Image
              style={{ resizeMode: 'contain', height: 45, width: 45 }}
              source={R.images.home}
            />
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            margin: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#232323',
              padding: 10,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: '#fff',
            }}
            onPress={() =>
              this.setState({ selTab: 2 }, () => this.updateFooterCount())
            }>
            <Image
              style={{ height: 22, width: 20, marginHorizontal: 1 }}
              source={
                this.state.selTab == 2 ? R.images.bell_red : R.images.bell_white
              }
            />
            {this.state.notifCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 4,
                }}>
                <Text>{this.state.notifCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 3,
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#05adf6',
              padding: 10,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: '#fff',
            }}
            onPress={() => this.makeRandomCall()}>
            <Image
              style={{ height: 20, width: 20 }}
              source={
                this.state.selTab == 3
                  ? R.images.call_gray
                  : R.images.call_white
              }
            />
          </TouchableOpacity>
          <Text>Random</Text>
        </View>
        <View
          style={{
            flex: 1,
            margin: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#232323',
              padding: 10,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: '#fff',
            }}
            onPress={() => {
              // this.state.selTab!==4?this.getMessageList(0):null,
              this.setState({ selTab: 4 }, () => this.updateFooterCount());
            }}>
            <Image
              style={{ height: 20, width: 20 }}
              source={
                this.state.selTab == 4 ? R.images.chat_red : R.images.chat_white
              }
            />
            {this.state.msgCount > 0 && (
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: '#fff',
                  borderWidth: 1,
                  borderRadius: 10,
                  paddingHorizontal: 4,
                }}>
                <Text>{this.state.msgCount}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        <View
          style={{
            flex: 1,
            margin: 5,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#232323',
              padding: 10,
              borderRadius: 50,
              borderWidth: 3,
              borderColor: '#fff',
            }}
            onPress={() =>
              this.setState({ selTab: 5 }, () => this.updateFooterCount())
            }>
            <Image
              style={{ height: 20, width: 20 }}
              source={
                this.state.selTab == 5 ? R.images.user_red : R.images.user_white
              }
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  logTabSwitch(data) {
    console.log('logTab===props===>', data);
    this.setState({ logTab: data });
    if (data == 1) {
      this.getMessageList(0);
    }
    if (data == 2) {
      this.getCallList();
    }
  }

  onLoadLoags() {
    if (this.state.logTab == 1) {
      this.getMessageList(0);
    } else {
      this.getCallList()
    }
  }

  sendHi(data) {
    console.log('sendHi====>', data);
    this.backFromProfile(data);
  }

  activeUser() {
    console.log("this is activated =========================================")
    this.backHandler.remove();
    this.props.navigation.navigate('MostActiveUser')
  }
  giftNav() {
    console.log("Navigating into the giftshop =========================================")
    this.backHandler.remove();
    this.props.navigation.navigate('GiftShop')
  }

  renderScreen() {
    if (this.state.selTab == 1) {
      return (
        <DashboardScreen
          onCall={this.createCall.bind(this)}
          onProfileClick={this.profileClicked.bind(this)}
          hiClicked={this.sendHi.bind(this)}
          mostActiveUser={this.activeUser.bind(this)}
          giftNavigation={this.giftNav.bind(this)}

        />
      );
    }
    if (this.state.selTab == 2) {
      return (
        <Notifications
          onGoBack={this.goBack.bind(this)}
          onProfileClick={this.profileClicked.bind(this)}
        />
      );
    }
    if (this.state.selTab == 4) {
      return (
        <Logs
          noResult={this.state.nR}
          logTab={this.logTabSwitch.bind(this)}
          logMessage={this.state.logMessageData}
          logCall={this.state.logCallData}
          onLoad={this.onLoadLoags.bind(this)}
          onMessageClick={this.messageClick.bind(this)}
          onCallClick={this.callClick.bind(this)}
          selectTab={this.state.selectTab}
          paginateParent={this.getMessageListPaginate.bind(this)}
          onProfileClick={this.profileClicked.bind(this)}
        />
      );
    }
    if (this.state.selTab == 5) {
      return (
        <Account
          details={this.state.AccountInfo}
          menuClick={this.AccountMenu.bind(this)}
          onGoBack={this.goBack.bind(this)}
        />
      );
    }
  }

  backFromProfile(data) {
    console.log('back form profile====>', data);
    // this.messageClick(data)
    this.backHandler.remove();
    this.props.navigation.navigate('ChatScreen', {
      profileId: data,
      backFromChatScreen: this.backFromChatScreen.bind(this),
    });
  }

  profileClicked(data) {
    this.backHandler.remove();
    this.props.navigation.navigate('ProfileDetails', {
      profile_id: data,
      from: '',
      backFromProfile: this.backFromProfile.bind(this),
    });
  }

  async deleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account?',
      [
        {
          text: 'Cancel',
          onPress: () => console.log('Cancel Pressed'),
          style: 'cancel',
        },
        {
          text: 'OK',
          onPress: () => {
            Utils.ApiPost(
              R.constants.Api.deleteAccount + this.state.user_id,
              (response = (data) => {
                console.log('deleteAccount===>', data);
                if (data.res == 200) {
                  if (data.data.res_status == 'success') {
                    Toast.show('Account Disabled', Toast.SHORT);
                    this.AlertBoxVisibility();
                    this.removeItemValue();
                  }
                }
              }),
            );
          },
        },
      ],
      { cancelable: true },
    );
  }

  async removeItemValue() {
    Utils.getData(
      'fcmToken',
      (value = (data) => {
        console.log(data);
        // this.setState({fcmToken:data.value})
        Utils.ApiPost(
          `${R.constants.Api.logOut}${this.state.user_id}&device_token=${data.value}`,
          (response = (data) => {
            if (data.res == 200) {
              try {
                AsyncStorage.getAllKeys()
                  .then((keys) => {
                    var keyToRemove = keys.filter(
                      (name) => name !== 'fcmToken',
                    );
                    AsyncStorage.multiRemove(keyToRemove);
                  })
                  .then(() => {
                    Toast.show('Logout Successfully', Toast.SHORT);
                    // this.props.navigation.state.params.comeBack();
                    this.backHandler.remove();
                    this.props.navigation.replace('Landing', {
                      from: 'logOut',
                      type: this.props.navigation.getParam('from'),
                    });
                  });
              } catch (exception) {
                console.warn('error ' + exception);
              }
            }
          }),
        );
      }),
    );
  }

  playAudio() {
    // console.log(this.state.audioUri)
    profileAudio = new Sound(
      this.state.audioUri,
      Sound.MAIN_BUNDLE,
      (error, sound) => {
        if (error) {
          // alert('error' + error.message);
          return;
        }
        profileAudio.play(() => {
          profileAudio.release();
        });
      },
    );
  }

  stopAudio() {
    // console.log("qwertyuiopstop")
    if (!this.state.isPlaying) {
      profileAudio.stop(() => {
        console.log('Stop');
        this.setState({ isPlaying: false });
      });
    }
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        {this.renderScreen()}
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
        {this.state.activeCall == 'true' && (
          <TouchableOpacity
            onPress={() => {
              this.createCall(incomingCallData, 'outgoing');
              console.log('incoming data call====>', incomingCallData);
            }}
            style={{
              zIndex: 100,
              position: 'absolute',
              left: 0,
              right: 0,
              alignItems: 'center',
              justifyContent: 'center',
              height: 30,
              bottom: 55,
              backgroundColor: '#05adf6',
            }}>
            <Text style={{ color: '#fff' }}>On Going call, Tap to expand</Text>
            <View
              style={{
                position: 'absolute',
                right: 5,
                top: 0,
                bottom: 0,
                justifyContent: 'center',
              }}>
              <Text style={{ color: '#fff' }}>{this.state.timerValue}</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ height: 60 }}>{this.bottomTab()}</View>
        {this.renderModel()}
        {this.renderCallModel()}
      </View>
    );
  }
}
