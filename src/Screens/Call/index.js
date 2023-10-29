import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Alert,
  BackHandler,
  PermissionsAndroid,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import R from 'res/R';
import axios from 'react-native-axios';
import Utils from 'res/Utils';
import Loader from 'comp/Loader';
import {each} from 'underscore';
import {
  EnxRoom,
  EnxRtc,
  Enx,
  EnxStream,
  EnxPlayerView,
} from 'enx-rtc-react-native';
import Toast from 'react-native-simple-toast';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import InCallManager from 'react-native-incall-manager';
let callEnd = false;
let res_token = '';
let roomId;
let callId;
let user_id;
const Try = true;
const APP_ID = '5e946cfd90ef8005f94f0f35';
const APP_KEY = 'ny6u6a8aJa4eJeWeYeZaEe8uXa6aDaQeJeXe';
var intervelId = 0;
let timerIntervelId = 0;
let count = 0;
let tv = '00:00';
let timerStarted = false;
let callSec = 0;
let callMin = 0;
let callData = '';
let callType = '';
let callStatus = 'Connecting...';
let timer = false;
export default class Call extends React.Component {
  constructor() {
    super();
    this.state = {
      ringType: 0,
      code: '',
      callDetails: '',
      isLoading: true,

      mute: false,
      roomId: '',
      callID: '',
      timer: false,
      connect: false,
      localStreamId: '0',
      callStatus: 'Connecting...',
      activeTalkerStreams: [],
      permissionsError: true,
      speaker: false,
      localStreamInfo: {
        audio: true,
        video: true,
        data: false,
        maxVideoBW: "400",
        minVideoBW: "300",
        audioMuted: false,
        videoMuted: false,
        name: "React Native",
        minWidth: "720",
        minHeight: "480",
        maxWidth: "1280",
        maxHeight: "720",
        audio_only: true

      },
      timerValue: '00:00',
    };
    callEnd = true;
    Enx.initRoom();
    InCallManager.setForceSpeakerphoneOn(false);
    DeviceEventEmitter.addListener('receive_call', (res) => {
      console.log('receive_call======> event====>', res);
      InCallManager.stopRingback();
      callStatus = 'Connected';
      // timer=true
      // // this.setState({callStatus:'Connected',timer:true},()=>
      // this.startTimer()
      // )
    });
    DeviceEventEmitter.addListener('end_call', (res) => {
      console.log('end_call======> event====>', res.data);
      // Toast.show("Call ended",Toast.SHORT)
      // timerStarted=false
      // console.log(callStatus)
      // if(callEnd){
      //     console.log("ended")
      //     this.endCall()
      // }
      // else{
      //     console.log("notENDED")
      // }
    });
    DeviceEventEmitter.addListener('decline_call', (res) => {
      console.log('decline_call====callScreen======> event====>', res.data);
      // this.setState({Call_Alert_Visibility:false})
      // InCallManager.stopRingtone();
      InCallManager.stopRingback();
      InCallManager.stop({busytone: '_DTMF_'});
      // this.setState({callStatus:"Busy."})

      if (callEnd) {
        callStatus = 'Busy';
        timer = false;
        console.log('ended');
        this.endCall();
      } else {
        console.log('notENDED');
      }
    });
    DeviceEventEmitter.addListener('callTimer', (res) => {
      try {
        console.log('callTimer======> event====>', res.data);
        this.setState({timerValue: res.data});
      } catch (error) {
        console.log('callTimer======> event====>');
      }
    });
  }
  componentDidMount() {
    try {
      this.backHandler = BackHandler.addEventListener(
        'hardwareBackPresscall',
        this.backAction,
      );
      console.log();
      Utils.getData(
        'activeCall',
        (value = (data) => {
          callEnd = true;
          if (data.value == null || data.value == 'false') {
            callStatus = 'Connecting...';
            this.check();
          } else {
            console.log('callType====>', callType);
            console.log('callId====>', callId);
            console.log('callData====>', callData);
            clearInterval(timerIntervelId);
            timerIntervelId = 0;
            timerStarted = false;
            callStatus = 'Connected';
            // this.setState({callStatus:'Connected',timer:true},()=>
            this.callStatus();
            // )
          }
          console.log('calling active call', data);
        }),
      );
    } catch (error) {
      console.log('Component Did Mount');
    }
  }
  componentWillUnmount() {
    // callMin=0
    // callSec=0
    timer = false;
    this.backHandler.remove();
    // Enx.disconnect();
  }

  backAction = () => {
    this.props.navigation.state.params.backFromCall();
    console.log('call back press');
  };
  goBack() {
    // clearInterval(intervelId)

    // timerIntervelId=0
    count = 0;
    (res_token = ''), (callId = ''), (roomId = ''), (user_id = '');
    this.props.navigation.state.params.backFromCall();
    this.props.navigation.goBack();
  }

  endCall = async () => {
    clearInterval(timerIntervelId);
    clearInterval(intervelId);
    callStatus = 'Ended';

    if (callStatus !== 'Connected') {
      console.log('stopRingback');
      InCallManager.stopRingback();
    } else {
      InCallManager.stop();
    }
    // console.log(`${R.constants.Api.endCall},"callid=====>",${callId}`)
    callEnd = false;
    await Utils.ApiPost(
      `${R.constants.Api.endCall}${callId}&user_id=${user_id}`,
      (response = (data) => {
        console.log('endCall====>', data);

        // clearInterval(intervelId)
        Utils.storeData('activeCall', false, 'endcall');
        timerStarted = false;
        (callSec = 0), (callMin = 0);
        timerIntervelId = 0;
        intervelId = 0;

        Enx.disconnect();
        this.goBack();
        Toast.show('Call Ended', Toast.SHORT);
      }),
    );
    // clearInterval(intervelId)
  };

  getId = async () => {
    await Utils.getData(
      'userData',
      (value = (data) => {
        // user_id = JSON.parse(data.value.user_id)
        // this.setState({user_id:userData.user_id},()=>{
        // })
        user_id = JSON.parse(data.value).user_id;
        console.log('data.value.user_id====>', JSON.parse(data.value).user_id);
        this.callAction();
        // this.setState({isLoading:false})
      }),
    );
  };

  check = () => {
    console.log('check');
    // Utils.storeData("activeCall",true)
    if (Platform.OS === 'android') {
      this.checkAndroidPermissions()
        .then(() => {
          this.setState({permissionsError: false}, () => {
            this.getId();
          });
        })
        .catch((error) => {
          this.setState({permissionsError: true, isLoading: false});
          console.log('checkAndroidPermissions', error);
          Alert.alert(
            'Please allow the reqiured permissions',
            '',
            [{text: 'OK', onPress: () => this.goBack(), style: 'cancel'}],
            {
              cancelable: false,
            },
          );
          return;
        });
    }
  };

  checkAndroidPermissions = () =>
    new Promise((resolve, reject) => {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.CAMERA,
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

  callAction = async () => {
    callType = this.props.navigation.getParam('type');
    callData = this.props.navigation.getParam('callDetails');
    this.setState(
      {
        isLoading: false,
      },
      () => {
        // console.log("this.state.callDetails====>",this.props.navigation.getParam("callDetails"))
        console.log(this.props.navigation.getParam('type'));
        if (this.props.navigation.getParam('type') == 'incoming') {
          console.log(
            'this.state.callDetails.incomingtoken====>',
            this.props.navigation.getParam('callDetails').incomingtoken,
          );
          // this.setState({isLoading:false},()=>{
          res_token = this.props.navigation.getParam('callDetails')
            .incomingtoken;
          roomId = this.props.navigation.getParam('callDetails')
            .incomingroom_id;
          callId = this.props.navigation.getParam('callDetails')
            .incomingcall_id;
          this.setState({connect: true}, () =>
            Utils.storeData('activeCall', true, 'incoming'),
          );
          // this.callAcceptAction(this.props.navigation.getParam("callDetails").incomingcall_id)
          // })
          // this.setState({roomId:,connect:true})
        }
        if (this.props.navigation.getParam('type') == 'outgoing') {
          this.getRoomID();
          Utils.storeData('activeCall', true, 'outgoing');
        }
      },
    );
  };

  callAcceptAction() {
    try {
      Utils.ApiPost(
        `${R.constants.Api.answerCall}${callId}`,
        (response = (data) => {
          if (data.data.res_status == 'success') {
            console.log('answerCall=====>', data);
            this.callStatus();
            callStatus = 'Connected';
            timer = true;
            // this.setState({callStatus:'Connected',timer:true},()=>
            this.startTimer();
            // )
          }
        }),
      );
    } catch (error) {
      console.log('CallAcception');
    }
  }

  callStatus() {
    try {
      if (intervelId == 0) {
        intervelId = setInterval(() => {
          console.log('intervelId', intervelId);
          Utils.ApiPost(
            `${R.constants.Api.callStatus}${callId}`,
            (response = (data) => {
              console.log('callStatus====>', data);
              if (data.res == 200) {
                if (data.data.call_status == '10') {
                  Toast.show('Call ended', Toast.SHORT);
                  callStatus = 'Ended';
                  timer = false;
                  clearInterval(timerIntervelId);
                  this.endCall();
                }

                if (data.data.call_status == '20') {
                  // this.ringing(data.data.call_status)
                  callStatus = 'Connecting...';
                  count = count + 2;
                  console.log(count);
                  if (count > 58) {
                    this.endCall();
                  }
                }
                if (data.data.call_status == '30') {
                  console.log(
                    'callStatus 30',
                    this.state.callStatus,
                    '======',
                    this.state.timer,
                  );
                  // InCallManager.stopRingback();
                  callStatus = 'Connected';
                  timer = true;
                  // this.setState({callStatus:'Connected',timer:true},()=>
                  this.startTimer();
                  // )
                }
                if (data.data.call_status == '40') {
                  InCallManager.stopRingback();
                  InCallManager.stop({busytone: '_DTMF_'});
                  // this.setState({callStatus:"Busy."})
                  callStatus = 'Busy';

                  timer = false;
                  // setTimeout(()=>{
                  // InCallManager.stop();
                  //     this.goBack()
                  // },2000)
                }
              }
            }),
          );
        }, 2000);
      }
    } catch (error) {
      console.log('CallStaus');
    }
  }

  getRoomID = async () => {
    try {
      Utils.ApiPost(
        'https://dadio.in/apps/videotest/api/create-room/approomid.php?action=create_room',
        (response = (data) => {
          console.log('create room local server=========>', data.data.room_id);
          this.createCall(data.data.room_id);
        }),
      );
    } catch (error) {
      console.log('getRoom Id');
    }
  };

  startTimer() {
    try {
      console.log('timer start', timerStarted);
      if (!timerStarted) {
        timerStarted = true;
        if (timerIntervelId == 0) {
          timerIntervelId = setInterval(() => {
            callSec = callSec + 1;
            // this.setState({callSec:this.state.callSec+1},()=>{
            if (callSec >= 59) {
              // this.setState({
              (callMin = callMin + 1), (callSec = 0);
              // })
            }
            tv = `${callMin < 10 ? `0${callMin}` : callMin}:${
              callSec < 10 ? `0${callSec}` : callSec
            }`;
            // this.setState({timerValue:`${this.state.callMin<10?`0${this.state.callMin}`:this.state.callMin}:${this.state.callSec<10?`0${this.state.callSec}`:this.state.callSec}`},()=>{
            DeviceEventEmitter.emit('callTimer', {data: tv});
            this.setState({timerValue: tv});
            // })
            // })
          }, 1000);
        }
      }
    } catch (error) {
      console.log('startTimer');
    }
  }

  roomEventHandlers = {
    roomConnected: (event) => {
      console.log('roomConnected', event);
      
      Enx.getLocalStreamId((status) => {
        this.setState({
          localStreamId: status,
        });
      });
      if (this.props.navigation.getParam('type') == 'incoming') {
        // this.setState({callID:this.state.callDetails.call_id},()=>{
        this.callAcceptAction();
        // })
        console.log('callDetails======>', this.state.callDetails);
        
      }
      // if(this.props.navigation.getParam("type")=="outgoing"){
      //     console.log('callDetails======>',this.state.callDetails)
      //     this.ringing()
      // }
      Enx.publish();
      Alert.alert(
        'Please allow the reqiured room id',
        '' + event.id,
        
      );
      
    },
    notifyDeviceUpdate: (event) => {
      console.log('notifyDeviceUpdate', event);
      // InCallManager.stopRingback();
      // this.ringing()
    },
    roomError: (event) => {
      console.log('roomError', event);
      Toast.show('please check you internet connection', Toast.SHORT);
      this.endCall();
    },
    streamPublished: (event) => {
      if (this.props.navigation.getParam('type') == 'outgoing') {
        console.log('streamPublished', event);
        console.log(this.props.navigation.getParam('type'));
      }
    },
    eventError: (event) => {
      console.log('eventErrorrr', event);
    },
    streamAdded: (event) => {
      console.log('streamAdded1', event);
      Enx.subscribe(event.streamId, (error) => {
        console.log('streamAdded', error);
      });
    },
    activeTalkerList: (event) => {
      console.log('activeTalkerList: ', event);
      var tempArray = [];
      tempArray = event;
      console.log('activeTalkerListtempArray: ', tempArray);
      try {
        if (tempArray.length == 0) {
          this.setState({
            activeTalkerStreams: tempArray,
          });
          console.log('tempArray', tempArray);
        }
      } catch (e) {
        console.log('tempArray', e);
      }
      try {
        if (tempArray.length > 0) {
          this.setState(
            {
              activeTalkerStreams: tempArray,
            },
            () => {
              // if(callType=="outgoing"){
              //     console.log("1234567890")
              //     InCallManager.stopRingback();
              //     callStatus="Connected"
              //     timer=true
              //     // this.setState({callStatus:'Connected',timer:true},()=>
              //     this.startTimer()
              // }
            },
          );
          console.log('tempArray', tempArray);
        }
      } catch (e) {
        console.log('tempArray', tempArray);
        console.log('tempArray', e);
      }
    },
    streamSubscribed: (event) => {
      console.log('streamSubscribed', event);
      if (callType == 'incoming') {
        console.log('1234567890');
        callStatus = 'Connected';
        timer = true;
        // this.setState({callStatus:'Connected',timer:true},()=>
        this.startTimer();
      }
    },
    roomDisconnected: (event) => {
      console.log('disconnecteddddd', event);
      // this.props.navigation.goBack(null)
      // this.endCall()
    },
    userConnected: (event) => {
      console.log('userJoined', event);
      if (callType == 'outgoing') {
        console.log('1234567890');
        InCallManager.stopRingback();
        callStatus = 'Connected';
        timer = true;
        // this.setState({callStatus:'Connected',timer:true},()=>
        this.startTimer();
      }
    },
    userDisconnected: (event) => {
      console.log('userDisconnected', event);
      timerStarted = false;
      console.log(callStatus);
      if (callEnd) {
        console.log('ended');
        this.endCall();
      } else {
        console.log('notENDED');
      }
    },
  };
  streamEventHandlers = {
    audioEvent: (event) => {
      try {
        console.log('audioEvent', event);
        if (event.result == '0') {
          if (this.state.audioMuteUnmuteCheck) {
            this.setState({audioMuteUnmuteCheck: false});
            this.setState({
              audioMuteUnmuteImage: R.images.call_mute,
            });
          } else {
            this.setState({audioMuteUnmuteCheck: true});
            this.setState({
              audioMuteUnmuteImage: R.images.call_unmute,
            });
          }
          console.log('NoError Audioo');
        } else {
          console.log('Error Audioo');
        }
      } catch (error) {
        console.log('audioEvent');
      }
    },
  };

  createActiveTalkerPlayers() {
    console.log(
      'this.state.activeTalkerStreams: ',
      this.state.activeTalkerStreams.length,
    );
    return (
      <View>
        {this.state.activeTalkerStreams.map(function (element, index) {
          try {
            if (index == 0) {
              const {height, width} = Dimensions.get('window');
              return (
                <EnxPlayerView
                  key={String(element.streamId)}
                  streamId={String(element.streamId)}
                  style={{width: 0, height: 0}}
                />
              );
            }
          } catch (error) {
            console.log('CreateActiveTalkerPlayers');
          }
        })}
      </View>
    );
  }

  createCall = async (roomId) => {
    console.log(
      `${R.constants.Api.createCall}${user_id}&room_id=${roomId}&profile_id=${
        this.props.navigation.getParam('callDetails').profile_id
      }`,
    );
    await Utils.ApiPost(
      `${R.constants.Api.createCall}${user_id}&room_id=${roomId}&profile_id=${
        this.props.navigation.getParam('callDetails').profile_id
      }`,
      (response = (data) => {
        console.log('createCall====>', data);
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            // this.setState({callID:data.data.call_id},()=>{
            console.log('joining======>');
            res_token = data.data.token;
            callId = data.data.call_id;

            // })
          }
          if (data.data.res_status == 'low_points') {
            Toast.show(
              'Your points are low for voice calling, Please add points from my account page.',
              Toast.SHORT,
            );
            Utils.storeData('activeCall', false, 'lowPoints');
            InCallManager.stopRingback();
            this.goBack();
          }
          if (data.data.res_status == 'busy') {
            Toast.show('User Busy', Toast.SHORT);
            Utils.storeData('activeCall', false, 'busy');
            InCallManager.stopRingback();
            this.goBack();
          }
        }
        console.log('resTOken====>', res_token);
        if (res_token !== null && res_token !== '') {
          console.log('res_token=====>', res_token);
          this.setState({connect: true}, () => {
            this.ringing();
            callEnd = true;
            Utils.storeData('activeCall', true, 'resToken');
            this.callStatus();
          });
        }
      }),
    );
  };

  ringing = async () => {
    console.log('ringing');
    InCallManager.stopRingback();
    if (this.state.ringType == 'SPEAKER_PHONE') {
      console.log('if');
      InCallManager.setForceSpeakerphoneOn(true);
      InCallManager.startRingback({media: 'audio', ringback: '_DTMF_'});
    } else {
      console.log('else');
      InCallManager.setForceSpeakerphoneOn(false);
      InCallManager.startRingback({media: 'audio', ringback: '_DTMF_'});
    }
  };

  muteAudio() {
    Enx.muteSelfAudio(this.state.localStreamId, this.state.mute);
  }

  switchSpeaker() {
    Enx.getDevices((status) => {
      if (!this.state.speaker) {
        console.log(status);
        this.setState({ringType: ''}, () => {
          let filteredData = status.filter((x) =>
            String(x).includes('WIRED_HEADSET'),
          );
          if (filteredData.length > 0) {
            Enx.switchMediaDevice('WIRED_HEADSET');
          } else {
            Enx.switchMediaDevice('EARPIECE');
          }
        });
      } else {
        this.setState({ringType: 'SPEAKER_PHONE'}, () => {
          Enx.switchMediaDevice('SPEAKER_PHONE');
        });
      }
    });
  }
  render() {
    return (
      <View style={{flex: 1}}>
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
        {
          <View style={{flex: 1}}>
            {this.state.connect && (
              <EnxRoom
                token={res_token}
                eventHandlers={this.roomEventHandlers}
                localInfo={this.state.localStreamInfo}>
                <EnxStream
                  style={{
                    position: 'absolute',
                  }}
                  eventHandlers={this.streamEventHandlers}></EnxStream>
              </EnxRoom>
            )}
            <View>{this.createActiveTalkerPlayers()}</View>
            <View
              style={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
                justifyContent: 'space-between',
              }}>
              <View
                style={{
                  height: 140,
                  backgroundColor: '#05adf6',
                  alignItems: 'center',
                  justifyContent: 'flex-end',
                  padding: 20,
                }}>
                <Text style={{color: '#fff', fontSize: 14}}>
                  Dadio Voice Call
                </Text>
                <Text
                  style={{
                    color: '#fff',
                    fontSize: 16,
                    marginVertical: 5,
                    fontWeight: 'bold',
                  }}>
                  {callType == 'incoming'
                    ? callData.incomingdisplay_name
                    : callData.display_name}
                </Text>
                <Text style={{color: '#fff', fontSize: 14}}>{callStatus}</Text>
                {timer && (
                  <Text style={{color: '#fff', fontSize: 14}}>
                    {this.state.timerValue}
                  </Text>
                )}
              </View>
              <Image
                style={{flex: 1}}
                source={{
                  uri:
                    callType == 'incoming'
                      ? callData.incomingprofile_img
                      : callData.profile_images == undefined
                      ? callData.profile_pic
                      : callData.profile_images[0].profile_img,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 105,
                  left: 0,
                  right: 0,
                  alignItems: 'center',
                }}>
                <TouchableOpacity
                  onPress={() => this.endCall()}
                  style={{
                    backgroundColor: 'red',
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  <Icon name={'phone-hangup'} size={35} color="#fff" />
                </TouchableOpacity>
              </View>
              <View
                style={{
                  flexDirection: 'row',
                  height: 90,
                  backgroundColor: '#05adf6',
                  alignItems: 'flex-start',
                  justifyContent: 'space-evenly',
                  padding: 20,
                  paddingHorizontal: 40,
                }}>
                <TouchableOpacity
                  onPress={() =>
                    this.setState({mute: !this.state.mute}, () =>
                      this.muteAudio(),
                    )
                  }
                  style={{
                    backgroundColor: this.state.mute
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.5)',
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  <Icon
                    name={this.state.mute ? 'microphone-off' : 'microphone'}
                    size={25}
                    color="#05adf6"
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() =>
                    this.setState({speaker: !this.state.speaker}, () =>
                      this.switchSpeaker(),
                    )
                  }
                  style={{
                    backgroundColor: this.state.speaker
                      ? 'rgba(255,255,255,1)'
                      : 'rgba(255,255,255,0.5)',
                    padding: 10,
                    borderRadius: 50,
                  }}>
                  <Icon
                    name={this.state.speaker ? 'volume-high' : 'volume-off'}
                    size={25}
                    color="#05adf6"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        }
        <TouchableOpacity
          onPress={() => {
            this.props.navigation.state.params.backFromCall();
            this.props.navigation.goBack();
          }}
          style={{position: 'absolute', top: 10, left: 10, height: 30}}>
          <Icon
            name="apple-keyboard-control"
            size={20}
            color="#fff"
            style={{transform: [{rotateZ: '-180deg'}]}}
          />
        </TouchableOpacity>
      </View>
    );
  }
}
