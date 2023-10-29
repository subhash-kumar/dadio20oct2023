import React from 'react'
import { View, Text, DeviceEventEmitter, TouchableOpacity, Alert, Linking, PermissionsAndroid, Dimensions, ActivityIndicator, Modal, FlatList, Image, StyleSheet, TextInput, BackHandler } from 'react-native'
import Header from 'comp/Header'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Utils from 'res/Utils'
import Loader from 'comp/Loader'
import moment from 'moment';
import Sound from 'react-native-sound';
import ImageCropPicker from "react-native-image-crop-picker";
import { each } from "underscore";
import DocumentPicker from "react-native-document-picker"
import AudioRecord from 'react-native-audio-record';
import Toast from "react-native-simple-toast";
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';

var profileAudio
const options = {
    sampleRate: 16000,  // default 44100
    channels: 1,        // 1 or 2, default 1
    bitsPerSample: 16,  // 8 or 16, default 16
    audioSource: 6,     // android only (see below)
    wavFile: 'test.wav' // default 'audio.wav'
};
let intervelId = 0
let intervelIdLastMessage = 0
let pImg = ""
export default class ChatScreen extends React.Component {
    constructor() {
        super()
        this.state = ({
            data: "",
            user_id: '',
            chatMessages: [],
            chatList: [],
            Alert_Visibility: false,
            chatMessage: '',
            isLoading: true,
            isPlaying: false,
            isRecording: false,
            audioIndex: "",
            permissionsError: true,
            image: '',
            voiceSeconds: 0,
            lastMessageId: "",
            timer: 0,
            last_readmsgid: "",
            sendingStatus: false,
            giftsLoading: true,
            nR: false,
            nRC: false,
            block: "10",
            profile_id: "",
            activeCall: "false",
            lastReadIndex: 0,
            remaining_recording_second: 0,
            timerValue: "",
            AccountInfo: {},
            chatStatus: 10,
            chatStatus1: 0,
            CustomerCareUser_Id: 150,

            entries: [
                {
                    "id": "0",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
                {
                    "id": "1",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
                {
                    "id": "2",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
                {
                    "id": "3",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
            ]
        })
        DeviceEventEmitter.addListener("callTimer", (res) => {
            console.log("callTimer======> event====>", res.data)
            this.setState({ timerValue: res.data })
        })
        DeviceEventEmitter.addListener("activecalldetails", (res) => {
            this.getCallingStatus()
        })

    }

    componentDidMount() {
        this.checkAndroidPermissions(3);
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            // this.CallingAction
            this.backAction,
            // this.onLineBackAction
        );
        //   this.backHandler = BackHandler.addEventListener(
        //     "hardwareBackPress",
        //     this.goBack
        //   );
        Utils.getData("userData", value = (data) => {
            var userData = JSON.parse(data.value)
            // alert(JSON.stringify(data));
            this.getCallingStatus()
            this.setState({ user_id: userData.user_id, AccountInfo: userData }, () => {
                const data = this.props.navigation.getParam("profileId")
                this.setState({
                    profile_id: data
                }, () => {
                    console.log("profile_id", this.state.profile_id)
                    // this.chatList()
                    this.getProfileDetails()
                    // this.chatStatus(); 
                    // this is navigating in to the customer

                })
            })
        })
        // this.chatStatus();
    }
    //   chat with Customer care   
    // chatwithCustomer=()=>{
    //     if(this.state.CustomerCareUser_Id===this.state.)
    // } 

    CallingAction = () => {
        console.log("I am in callingAction");
        if (this.backAction === this.onLineBackAction) {
            console.log("i am in onlineBackAction");
            this.backAction();

        } else {
            console.log("i am in back action");
            this.onLineBackAction();
        }
    }
    getCallingStatus() {
        Utils.getData("activeCall", value = (data) => {
            if (data.value == null) {
                // activeCall="false"
                this.setState({ activeCall: "false" })
            }
            else {
                // activeCall=data.value
                // alert(data.value);
                this.setState({ activeCall: data.value })
                // alert(data.value);

            }
            console.log("activeCall===>", this.state.activeCall, data)
        })
    }

    getProfileDetails() {
        Utils.ApiPost(`${R.constants.Api.profile}${this.state.user_id}&profile_id=${this.state.profile_id}`, response = (data) => {
            // console.log("profile====>",data.data.profile_images[0].profile_img)
            //  alert(JSON.stringify(data));
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    pImg = data.data.profile_images[0].profile_img
                    this.setState({ data: data.data }, () => { this.chatList() })
                    // alert(this.state.data.profile_id);
                }
            }
            // alert(this.state.data.profile_id);
            // this is for the free chat with Customer care
            chatwithCustomer = () => {
                if (this.state.CustomerCareUser_Id === this.state.data.profile_id) {
                    this.sendMessage();
                } else {
                    this.chatStatus();
                }
            }
        })

    }

    getRemainingSecond() {
        // getRemainigSecond

        Utils.ApiPost(`${R.constants.Api.getRemainigSecond}${this.state.user_id}&profile_id=${this.state.profile_id}&remaining_recording_second=${this.state.remaining_recording_second}`, response = (data) => {
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    this.setState({
                        remaining_recording_second: data.data.remaining_recording_second
                    })
                }
            }
        })
    }



    chatStatus() {
        // console.log(this.state.data.profile_id);
        if (this.state.CustomerCareUser_Id == this.state.data.profile_id) {
            console.log("============>this is working customer care")
            this.sendMessage();
        } else {
            // alert(`${R.constants.Api.basicInfo}${this.state.user_id}`)
            Utils.ApiPost(`${R.constants.Api.basicInfo}${this.state.user_id}`, response = (data) => {
                if (data.res == 200) {
                    if (data.data.res_status == "success") {
                        // alert(JSON.stringify(data.data.active_chatstatus));
                        this.setState({
                            chatStatus1: data.data.active_chatstatus,
                        })
                        // alert(JSON.stringify(this.state.chatStatus1.active_chatstatus));

                        console.log("chat Status===>", data.data.active_chatstatus)
                        console.log("chat Status===>", this.state.user_id);
                        if (this.state.chatStatus == data.data.active_chatstatus) {
                            this.sendMessage();
                            console.log("chat status working ");
                        }
                        else {
                            this.props.navigation.navigate('ChatPaid');
                        }
                    }
                }
            })
        }
    }

    chatList() {
        // this.getRemainingSecond();
        Utils.ApiPost(`${R.constants.Api.chatList}${this.state.user_id}&profile_id=${this.state.profile_id}&remaining_recording_second=${this.state.remaining_recording_second}`, response = (data) => {
            // console.log("chatList=======>",JSON.stringify(data))
            //  alert(JSON.stringify(data));
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    // if(this.state.sendingStatus){
                    //     this.setState({sendingStatus:false})
                    //     let list = this.state.chatList.splice(0, 0);
                    //     console.log(list)
                    // } 
                    // console.log("chatList=======myBlock===>",data)
                    this.setState({
                        nRC: false,
                        last_readmsgid: data.data.last_readmsgid,
                        block: data.data.block_chat,
                        chatMessages: data.data,
                        lastMessageId: data.data.chat_lastid,
                        isLoading: false,
                        remaining_recording_second: data.data.remaining_recording_second,
                        chatList: data.data.chatwindow_data,
                    }, () => {

                        if (intervelIdLastMessage == 0) {
                            // console.log("intervelIdLastMessage,,,,",intervelIdLastMessage)
                            intervelIdLastMessage = setInterval(() => {
                                this.getLastMesage()
                            }, 3000);
                        }

                    })
                }
                if (data.data.res_status == "no_data") {
                    this.setState({ nRC: true, last_readmsgid: data.data.last_readmsgid, isLoading: false, chatList: [], block: data.data.block_chat })
                }
                this.getlast_readmsgidIndex()
            }
        })
    }

    getLastMesage() {
        // console.log("lastMessageId====>",this.state.lastMessageId)
        Utils.ApiPost(`${R.constants.Api.chatRefresh}${this.state.user_id}&profile_id=${this.state.profile_id}&chat_lastid=${this.state.lastMessageId}`, response = (data) => {
            // console.log("chatRefresh=====>",JSON.stringify(data))
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    let list = [...data.data.chatwindow_data, ...this.state.chatList]
                    this.setState({ chatList: list, lastMessageId: data.data.chat_lastid, last_readmsgid: data.data.last_readmsgid })
                }
                else {
                    this.setState({ last_readmsgid: data.data.last_readmsgid })
                }
            }
            this.getlast_readmsgidIndex()
        })
    }

    getlast_readmsgidIndex() {
        if (this.state.last_readmsgid !== 0) {
            // console.log("last_readmsgid",this.state.last_readmsgid)
            this.state.chatList.map((item, index) => {
                // console.log(item,"=====>",index)
                if (item.chat_id == this.state.last_readmsgid) {
                    this.setState({ lastReadIndex: index }, () => console.log(this.state.lastReadIndex))
                }
            })
        }
    }


    componentWillUnmount() {
        clearInterval(intervelIdLastMessage)
        this.backHandler.remove();
        // console.log("this is call ");
        // BackHandler.removeEventListener('hardwareBackPress', this.goBack);
    }


    backAction = () => {
        console.log("backhandel++++++++", this.props.navigation.state.params)
        //   alert(JSON.parse(JSON.stringify(this.props.navigation.state.params)))
        try {
            this.props.navigation.state.params.backFromChatScreen("messageList", "");
        } catch (e) {
            console.log("error", e);
        }

    }
    //   This is for the OnlineBack
    onLineBackAction = () => {
        console.log("backhandel")
        this.props.navigation.state.params.backFromChatScreen("OnlineUser", "");
    }

    AlertBoxVisibility() {
        this.setState({ Alert_Visibility: !this.state.Alert_Visibility });
    }

    navigateGiftShop() {
        this.AlertBoxVisibility()
        // this.props.navigation.state.params.backFromChatScreen("navGift","");
        // this.props.navigation.goBack();
        this.backHandler.remove();
        // this.props.navigation.navigate('Chatpaid')
        this.props.navigation.navigate('GiftShop')
    }



    goBack = () => {
        // this.props.navigation.state.params.backFromChatScreen("messageList","");
        this.props.navigation.goBack();
    }

    backFromCall() {
        // this.chatList()
        // activeCall=false
        console.log("backFromCall")
        this.getCallingStatus()
    }

    callClickedChat() {
        this.backHandler.remove();

        console.log("callclicked active call====>", this.state.activeCall)
        if (this.state.activeCall == "false") {
            // activeCall=true
            clearInterval(intervelIdLastMessage)
            // this.props.navigation.state.params.backFromChatScreen("createCall",this.state.data);
            this.props.navigation.push('Call', { "type": "outgoing", "callDetails": this.state.data, "backFromCall": this.backFromCall.bind(this) })
        }
        else {
            console.warn("active call")
            this.props.navigation.push('Call', { "type": "outgoing", "callDetails": this.state.data, "backFromCall": this.backFromCall.bind(this) })
        }
    }

    recordMessage() {
        if (this.state.isRecording) {
            this.stopRecording()
        }
        else {
            this.startRecording()
            // alert("Recording Start");
        }
    }

    startRecording() {
        Utils.ApiPost(`${R.constants.Api.getRemainigSecond}${this.state.user_id}}`, response = (data) => {
            //  alert("Api call");
            // alert(JSON.stringify(data))
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    this.setState({ remaining_recording_second: data.data.remaining_recording_second })

                    this.checkAndroidPermissions(3).then(res => {
                        if (res) {
                            try {
                                if (this.state.remaining_recording_second > this.state.timer) {
                                    AudioRecord.init(options);
                                    AudioRecord.start();
                                    this.setState({ isRecording: true }, () => {
                                        intervelId = setInterval(async () => {
                                            if (this.state.remaining_recording_second > this.state.timer) {
                                                this.setState({ timer: this.state.timer + 1 })
                                            } else {
                                                clearInterval(intervelId);
                                                var audioFile = await AudioRecord.stop();
                                                this.showAlertWithSendRecording(audioFile);
                                            }
                                            this.setState({ timer: this.state.timer + 1 })
                                        }, 1000);
                                    })
                                } else {
                                    AudioRecord.stop();
                                    this.showAlert();
                                }
                            } catch (error) {
                                console.log("StartRecording");
                            }
                        }
                    }).catch(error => {
                        this.setState({ isRecording: false })
                        return;
                    })
                }
            }
        })
    }

    showAlertWithSendRecording(Audiofile) {
        Alert.alert(
            "Alert",
            "You don't have enough points, please buy points to continue  ",
            [{
                text: 'Buy Now', onPress: () => this.props.navigation.navigate('Points', {
                    details: this.state.AccountInfo,
                })
            }, { text: 'Send Audio', onPress: () => this.stopRecordingByPopup(Audiofile) }],
            { cancelable: false },
        );
    }


    showAlert() {
        Alert.alert(
            "Alert",
            "You don't have enough points, please buy points to continue ",
            [{
                text: 'Buy Now', onPress: () => this.props.navigation.navigate('Points', {
                    details: this.state.AccountInfo,
                })
            }, { text: 'Cancel', onPress: () => () => console.log('OK') }],
            { cancelable: false },
        );
    }

    stopRecordingByPopup = async (audioFile) => {
        try {
            var formData = new FormData();
            // var audioFile = await AudioRecord.stop();
            // console.log("audio file====>",audioFile)
            var Data = {
                uri:
                    Platform.OS === "android"
                        ? `file://${audioFile}`
                        : audioFile.replace("file://", ""),
                type: 'audio/x-wav',
                name: "test.wav"
            }
            formData.append("msg_type", "audio")
            formData.append("recroding_duration", this.state.timer)
            formData.append("file", Data)
            // console.log('formData===>',formData)
            //   this.saveRecording(formData)
            this.uploadService("audio", { "uri": audioFile, "formData": formData })
            this.setState({ isRecording: false, timer: 0 })
        } catch (error) {
            console.log("Stop Recoding");
        }

    }


    stopRecording = async () => {
        try {
            var formData = new FormData();
            var audioFile = await AudioRecord.stop();
            // console.log("audio file====>",audioFile)
            var Data = {
                uri:
                    Platform.OS === "android"
                        ? `file://${audioFile}`
                        : audioFile.replace("file://", ""),
                type: 'audio/x-wav',
                name: "test.wav"
            }
            formData.append("msg_type", "audio")
            formData.append("recroding_duration", this.state.timer)
            formData.append("file", Data)
            // console.log('formData===>',formData)
            //   this.saveRecording(formData)
            this.uploadService("audio", { "uri": audioFile, "formData": formData })
            this.setState({ isRecording: false, timer: 0 })
        } catch (error) {
            console.log("Stop Recoding");
        }

    }
    checkPermission(id) {
        try {
            if (Platform.OS === "android") {
                this.checkAndroidPermissions(id)
                    .then(() => {
                        this.setState({ permissionsError: false }, () => {
                            this.getId(id)
                        });
                    })
                    .catch(error => {
                        this.setState({ permissionsError: true });
                        // console.log("checkAndroidPermissions", error);
                        return;
                    });
            }
        } catch (error) {
            console.log("Permision false");
        }
    }

    checkAndroidPermissions = (id) =>
        new Promise((resolve, reject) => {
            PermissionsAndroid.requestMultiple(id == 1 ? [PermissionsAndroid.PERMISSIONS.CAMERA] : id == 2 ? [PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE] : id == 3 ? [PermissionsAndroid.PERMISSIONS.RECORD_AUDIO] : null)
                .then(result => {
                    //alert(JSON.stringify(result))
                    const permissionsError = {};
                    permissionsError.permissionsDenied = [];
                    each(result, (permissionValue, permissionType) => {
                        if (permissionValue === "denied" || permissionValue === "never_ask_again") {
                            // console.log("denied Permission");
                            permissionsError.permissionsDenied.push(permissionType);
                            permissionsError.type = "Permissions error";
                        }
                    })
                    if (permissionsError.permissionsDenied.length > 0) {
                        // console.log("denied Permission");
                        reject(permissionsError);
                    } else {
                        // console.log("granted Permission");
                        resolve(true);
                    }
                })
                .catch(error => {
                    reject(error);
                });
        });

    getId = async (index) => {
        if (index == 1) {
            // alert(this.chatStatus1.active_chatstatus);
            // alert(tis.state.profile_id);
            if (this.state.CustomerCareUser_Id == this.state.data.profile_id) {
                try {
                    await ImageCropPicker.openCamera({
                        includeExif: true,
                        cropping: false
                    }).then(image => {
                        this.uploadService("image", image)
                    });
                } catch (e) {
                    console.log("error");
                    Toast.show("  " + e)
                }

            } else {
                if (this.chatwithCustomer.profile_id === this.state.CustomerCareUser_Id) {
                    try {
                        await ImageCropPicker.openCamera({
                            includeExif: true,
                            cropping: false
                        }).then(image => {
                            this.uploadService("image", image)
                        });
                    } catch (e) {
                        console.log("error");
                        Toast.show("  " + e)
                    }
                } else {
                    if (this.state.chatStatus == this.state.chatStatus1) {
                        console.log("This is status", this.state.chatStatus1);
                        console.log("This is working for image");
                        try {
                            await ImageCropPicker.openCamera({
                                includeExif: true,
                                cropping: false
                            }).then(image => {
                                this.uploadService("image", image)
                            });
                        } catch (e) {
                            console.log("error");
                            Toast.show("  " + e)
                        }
                    } else {
                        Toast.show("Please Check Your plan ")
                        console.log("This is status", this.state.chatStatus1);
                        // console.log(this.state.chatStatus);
                    }
                }
            }


            // await ImageCropPicker.openCamera({
            //   includeExif: true,
            //   cropping: false
            // }).then(image => {
            //     this.uploadService("image",image)

            // });
        } else if (index == 2) {
            // alert(this.chatStatus1.active_chatstatus);
            if (this.state.CustomerCareUser_Id == this.state.data.profile_id) {
                try {
                    const data = await DocumentPicker.pick({
                        type: [DocumentPicker.types.images, DocumentPicker.types.pdf]
                    });
                    this.uploadService("attachment", data)
                } catch (e) {
                    console.log("error");
                    Toast.show("  " + e)
                }
            } else {
                if (this.chatwithCustomer.profile_id === this.state.CustomerCareUser_Id) {
                    try {
                        const data = await DocumentPicker.pick({
                            type: [DocumentPicker.types.images, DocumentPicker.types.pdf]
                        });
                        this.uploadService("attachment", data)
                    } catch (e) {
                        console.log("error");
                        Toast.show("  " + e)
                    }
                } else {
                    if (this.state.chatStatus == this.state.chatStatus1) {
                        console.log("this is working for file ");
                        try {
                            const data = await DocumentPicker.pick({
                                type: [DocumentPicker.types.images, DocumentPicker.types.pdf]
                            });
                            this.uploadService("attachment", data)
                        } catch (e) {
                            console.log("error");
                            Toast.show("  " + e)
                        }
                    } else {
                        Toast.show("Please Check Your plan ")
                        console.log("this is status", this.state.chatStatus1);
                    }
                    // const data = await DocumentPicker.pick({
                    //     type: [DocumentPicker.types.images,DocumentPicker.types.pdf]
                    //   });
                    // this.uploadService("attachment",data)
                }
            }
        }
    }

    getgiftList() {
        Utils.ApiPost(R.constants.Api.giftsForSend + this.state.user_id, response = (data) => {
            // console.log(data)
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    this.setState({ nR: false, entries: data.data.gift_list, giftsLoading: false })
                }
                if (data.data.res_status == "no_gift") {
                    this.setState({ nR: true, entries: [], giftsLoading: false })
                }
            }
        })
    }

    uploadService(type, data) {
        this.setState({ sendingStatus: true })
        // console.log(type,"=====>",data)
        var list = this.state.chatList
        list.unshift({
            "msg_from": this.state.user_id,
            "msg_text": type == "image" ? data.path : data.uri,
            "msg_time": moment().format('hh:mm a'),
            "msg_type": type,
            "read_status": "read"
        })
        var formData = new FormData();
        formData.append("msg_type", type)
        if (type == "image") {
            var Data = {
                uri:
                    Platform.OS === "android"
                        ? `${data.path}`
                        : data.path.replace("file://", ""),
                type: data.mime,
                name: "image.jpg"
            }
            formData.append("file", Data)
        }
        if (type == "attachment") {
            var Data = {
                uri: data.uri,
                type: data.type,
                name: data.name
            }
            formData.append("file", Data)
        }
        this.setState({ chatList: list }, () => {
            Utils.ApiPostwithBody(`${type == "audio" ? R.constants.Api.recordingSend : R.constants.Api.chatSend}${this.state.user_id}&profile_id=${this.state.profile_id}`, type == "audio" ? data.formData : formData, response = (data) => {
                // console.log("upload======>",data)
                this.setState({ sendingStatus: false })


            })
        })
    }

    sendMessage() {
        this.setState({ sendingStatus: true, nRC: false })
        var list = this.state.chatList
        list.unshift({
            "msg_from": this.state.user_id,
            "msg_text": this.state.chatMessage,
            "msg_time": moment().format('hh:mm a'),
            "msg_type": "text",
            "read_status": "unread"
        }
        )
        var formData = new FormData();
        formData.append("msg_type", "text")
        formData.append("message", this.state.chatMessage)
        this.setState({ chatList: list }, () => this.setState({ chatMessage: "" }, () => {
            Utils.ApiPostwithBody(`${R.constants.Api.chatSend}${this.state.user_id}&profile_id=${this.state.profile_id}`, formData, response = (data) => {
                // console.log("send Message====>",data)
                // console.log("this.state.chatList===>",this.state.chatList)
                this.chatList()
                this.setState({ sendingStatus: false })
            })
        }))

    }

    sendGift(gift_id, payment_id) {
        Utils.ApiPost(`${R.constants.Api.sendGift}${this.state.user_id}&profile_id=${this.state.profile_id}&gift_id=${gift_id}&payment_id=${payment_id}`, response = (data) => {
            // console.log("sendGift=====>",data)
            if (data.res == 200) {
                this.AlertBoxVisibility()
                if (data.data.res_status == "success") {
                    Toast.show("Gift sent sucessfully!")
                }
                if (data.data.res_status == "no_gift") {
                    Toast.show("Gift sent failed!")
                }
                this.chatList()
            }
        })
    }

    renderModel() {
        return (
            <Modal
                visible={this.state.Alert_Visibility}
                transparent={true}
                animationType={"fade"}
                onRequestClose={() => { this.AlertBoxVisibility() }} >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <View style={{ width: '95%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#232323', padding: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                Send Gift
                            </Text>
                            <TouchableOpacity onPress={() => this.AlertBoxVisibility()}>
                                <Icon name="close-thick" size={25} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {!this.state.giftsLoading && <View style={{ backgroundColor: '#fff' }}>
                            {!this.state.nR && <FlatList
                                data={this.state.entries}
                                numColumns={2}
                                style={{ height: 350 }}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    return (
                                        <View style={{ alignItems: 'center', justifyContent: 'center', width: (Dimensions.get("window").width - 60) / 2, margin: 10, backgroundColor: '#fff', }}>
                                            <View style={{ padding: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 5, borderColor: '#d3d3d3', marginVertical: 10 }}>
                                                <Image
                                                    style={{ height: 100, width: 100, borderRadius: 10, resizeMode: "contain" }}
                                                    source={{ uri: item.gift_image }}
                                                />
                                            </View>
                                            <View style={{ alignItems: 'center', justifyContent: 'center', height: 40, }}>
                                                <Text style={{ color: '#232323' }}>
                                                    {item.gift_name}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => this.sendGift(item.gift_id, item.payment_id)} style={{ paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: 40, backgroundColor: '#232323' }}>
                                                <Text style={{ color: '#fff', marginHorizontal: 10 }}>
                                                    Send
                                                </Text>
                                                <Icon name="send" size={25} color="#fff" />
                                            </TouchableOpacity>

                                        </View>
                                    )
                                }}
                            />}
                            {this.state.nR && <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', height: 250, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: "#fff" }}>
                                    No Gifts
                                </Text>
                            </View>
                            }
                        </View>}
                        {this.state.giftsLoading &&
                            <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', height: 250, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader />
                            </View>
                        }
                        <View style={{ height: 60, backgroundColor: '#fff', borderBottomStartRadius: 10, borderBottomEndRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => this.navigateGiftShop()}
                                style={{ flexDirection: 'row' }}>
                                <Icon name="gift" size={25} color="red" />
                                <Text style={{ color: R.colors.cyan, fontSize: 18, marginHorizontal: 10, fontWeight: 'bold' }}>
                                    Buy More Gifts
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        );
    }

    playAudio(index) {
        // console.log("playAudio")
        this.setState({ audioIndex: index })
        var audioUri = this.state.chatList[index].msg_text
        profileAudio = new Sound(audioUri, Sound.MAIN_BUNDLE,
            (error, sound) => {
                if (error) {
                    // alert('error' + error.message);
                    return;
                }
                profileAudio.play(() => {
                    profileAudio.release();
                    this.setState({ isPlaying: false })
                });
            });
    }

    stopAudio(index) {
        // console.log("stopAudio")
        this.setState({ audioIndex: index })
        if (!this.state.isPlaying) {
            profileAudio.stop(() => {
                // console.log('Stop');
                this.setState({ isPlaying: false })
            })
        }
    }
    renderChatMessages() {
        if (this.state.isLoading) {
            return (
                <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader />
                </View>
            )
        }
        if (!this.state.isLoading) {
            return (
                <View style={{ flex: 1 }}>
                    {!this.state.nRC && <FlatList
                        inverted
                        style={{}}
                        showsVerticalScrollIndicator={false}
                        data={this.state.chatList}
                        keyExtractor={(item, index) => item.chat_id}
                        renderItem={({ item, index }) => {
                            return (
                                <View>

                                    {item.chat_id == this.state.chatMessages.lastread_messageid && !this.state.nRC &&
                                        <View style={{ margin: 5, alignItems: 'center' }}>
                                            <Text style={{ padding: 10, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'center', backgroundColor: 'yellow' }}>
                                                {this.state.chatMessages.unread_message} New Messges
                                            </Text>
                                        </View>
                                    }

                                    {item.msg_type == "missed_call" &&
                                        <View style={{ margin: 5, padding: 10, borderWidth: StyleSheet.hairlineWidth, alignSelf: 'center', backgroundColor: 'yellow' }}>
                                            <Text>
                                                {item.msg_text}
                                            </Text>
                                        </View>
                                    }
                                    {item.msg_type == "text" &&
                                        <View style={{ margin: 5, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                {(this.state.sendingStatus && index == 0) && <ActivityIndicator style={{ marginHorizontal: 10 }} color={"red"} size={"small"} />}

                                                {this.state.user_id == item.msg_from && <Icon name={this.state.lastReadIndex <= index ? "check-all" : "check"} size={18} color={R.colors.cyan} />}
                                                <Text style={{ maxWidth: Dimensions.get('window').width / 1.2, borderRadius: 10, padding: 15, backgroundColor: this.state.user_id == item.msg_from ? "lightgreen" : "white" }}>
                                                    {item.msg_text}
                                                </Text>
                                            </View>
                                            <View style={{ margin: 2, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                                <Text style={{ padding: 2, fontSize: 10, color: 'grey' }}>
                                                    {item.msg_time}
                                                </Text>
                                            </View>
                                        </View>

                                    }
                                    {item.msg_type == "image" &&
                                        <View style={{ margin: 5, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                {(this.state.sendingStatus && index == 0) && <ActivityIndicator style={{ marginHorizontal: 10 }} color={"red"} size={"small"} />}
                                                {this.state.user_id == item.msg_from && <Icon name={this.state.lastReadIndex <= index ? "check-all" : "check"} size={18} color={R.colors.cyan} />}
                                                <View style={{ maxWidth: Dimensions.get('window').width / 1.2, borderRadius: 10, padding: 15, backgroundColor: this.state.user_id == item.msg_from ? "lightgreen" : "white" }}>
                                                    <Image
                                                        style={{ resizeMode: 'contain', width: 170, height: 200 }}
                                                        source={{ uri: item.msg_text }}
                                                    />
                                                </View>
                                            </View>
                                            <View style={{ margin: 2, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                                <Text style={{ padding: 2, fontSize: 10, color: 'grey' }}>
                                                    {item.msg_time}
                                                </Text>
                                            </View>
                                        </View>
                                    }
                                    {item.msg_type == "attachment" &&
                                        <View style={{ margin: 5, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                {(this.state.sendingStatus && index == 0) && <ActivityIndicator style={{ marginHorizontal: 10 }} color={"red"} size={"small"} />}
                                                {this.state.user_id == item.msg_from && <Icon name={this.state.lastReadIndex <= index ? "check-all" : "check"} size={18} color={R.colors.cyan} />}
                                                <View style={{ alignItems: "center", flexDirection: 'row', maxWidth: Dimensions.get('window').width / 1.2, borderRadius: 10, padding: 15, backgroundColor: this.state.user_id == item.msg_from ? "lightgreen" : "white" }}>
                                                    <Icon name="paperclip" size={15} color="blue" style={{ transform: [{ rotateZ: '-45deg' }] }} />
                                                    <Text style={{ color: 'blue', marginHorizontal: 10 }}
                                                        onPress={() => Linking.openURL(item.msg_text)}>
                                                        File
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ margin: 2, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                                <Text style={{ padding: 2, fontSize: 10, color: 'grey' }}>
                                                    {item.msg_time}
                                                </Text>
                                            </View>
                                        </View>
                                    }

                                    {item.msg_type == "gift" &&
                                        <View style={{ margin: 5, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                {(this.state.sendingStatus && index == 0) && <ActivityIndicator style={{ marginHorizontal: 10 }} color={"red"} size={"small"} />}
                                                {this.state.user_id == item.msg_from && <Icon name={this.state.lastReadIndex <= index ? "check-all" : "check"} size={18} color={R.colors.cyan} />}
                                                <View style={{ alignItems: 'center', maxWidth: Dimensions.get('window').width / 1.2, borderRadius: 10, padding: 15, backgroundColor: this.state.user_id == item.msg_from ? "lightgreen" : "white" }}>
                                                    <Image
                                                        style={{ resizeMode: 'contain', width: 120, height: 150 }}
                                                        source={{ uri: item.msg_text.img_src }}
                                                    />
                                                    <Text style={{ padding: 2 }}>
                                                        {item.msg_text.img_text}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={{ margin: 2, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                                <Text style={{ padding: 2, fontSize: 10, color: 'grey' }}>
                                                    {item.msg_time}
                                                </Text>
                                            </View>
                                        </View>
                                    }

                                    {item.msg_type == "audio" &&
                                        <View style={{ margin: 5, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                            <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                                                {(this.state.sendingStatus && index == 0) && <ActivityIndicator style={{ marginHorizontal: 10 }} color={"red"} size={"small"} />}
                                                {this.state.user_id == item.msg_from && <Icon name={this.state.lastReadIndex <= index ? "check-all" : "check"} size={18} color={R.colors.cyan} />}
                                                <View style={{ maxWidth: Dimensions.get('window').width / 1.2, borderRadius: 10, padding: 15, backgroundColor: this.state.user_id == item.msg_from ? "lightgreen" : "white" }}>
                                                    <TouchableOpacity onPress={() => this.setState({ isPlaying: !this.state.isPlaying }, () => this.state.isPlaying ? this.playAudio(index) : this.stopAudio(index))} style={{ borderRadius: 10, flexDirection: 'row', backgroundColor: "#232323", padding: 10, alignItems: 'center' }}>
                                                        <Icon name={this.state.audioIndex == index ? this.state.isPlaying ? "stop-circle-outline" : "play" : "play"} size={25} color="#fff" />
                                                        <Text style={{ color: '#fff', marginHorizontal: 5 }}>
                                                            {this.state.audioIndex == index ? this.state.isPlaying ? "Stop" : "Play" : "Play"}
                                                        </Text>
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                            <View style={{ margin: 2, marginHorizontal: 10, alignItems: this.state.user_id == item.msg_from ? "flex-end" : "flex-start" }}>
                                                <Text style={{ padding: 2, fontSize: 10, color: 'grey' }}>
                                                    {item.msg_time}
                                                </Text>
                                            </View>
                                        </View>
                                    }

                                </View>
                            )
                        }}
                    />}
                    {this.state.nRC && <View style={{ zindex: 1, flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={{ color: "#d3d3d3" }}>
                            No Messages
                        </Text>
                    </View>}
                </View>
            )
        }
    }

    _menu = null;
    setMenuRef = ref => {
        this._menu = ref;
    };
    showMenu = () => {
        // console.log("data=====>",this.state.chatMessages)
        this._menu.show();
    };
    hideMenu = () => {
        this._menu.hide();
    };
    option1Click = () => {
        this.backHandler.remove();
        this.props.navigation.navigate("ProfileDetails", { "profile_id": this.state.profile_id, "from": "Chat" })
        this._menu.hide();
    };
    option2Click = () => {
        this._updateUserLike()
        this._menu.hide();
    };
    option3Click = () => {
        this._clearChatHistory()
        this._menu.hide();
    };
    option4Click = () => {
        this.blockUnblock()
        this._menu.hide();
    };
    option5Click = () => {
        this._reportProfile()
        this._menu.hide();
    };

    _updateUserLike() {
        Alert.alert(
            "Remove Crush?",
            "Are you sure you want to remove your crush?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        this.setState({ isLoading: true })
                        Utils.ApiPost(`${R.constants.Api.likeUnlike}${this.state.profile_id}&like_by=${this.state.user_id}&action=0`, response = (data) => {
                            if (data.res == 200) {
                                if (data.data.res_status == "success") {
                                    // console.log("likeUnlike===>",data.data)
                                    this.chatList()
                                }
                            }
                            else {
                                // this.setState({isLoading:false})
                                // Toast.show("please check your internet.",Toast.SHORT)
                            }
                            this.setState({ isLoading: false })
                        })
                    }
                }
            ],
            { cancelable: true }
        );

    }

    _clearChatHistory() {
        Alert.alert(
            "Clear chat history?",
            "Are you sure you want to clear this chat?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        this.setState({ isLoading: true })
                        Utils.ApiPost(`${R.constants.Api.clearChatList}${this.state.user_id}&profile_id=${this.state.profile_id}`, response = (data) => {
                            // console.log("clearChatList===>",data.data)
                            if (data.res == 200) {
                                if (data.data.res_status == "success") {
                                    // console.log("clearChatList===>",data.data)
                                    this.setState({ chatList: [] })
                                    Toast.show("Chat Deleted successfully.", Toast.SHORT)
                                    this.chatList()
                                }
                            }
                            else {
                                // this.setState({isLoading:false})
                                // Toast.show("please check your internet.",Toast.SHORT)
                            }
                            this.setState({ isLoading: false })
                        })
                    }
                }
            ],
            { cancelable: true }
        );

    }

    blockUnblock() {
        Alert.alert(
            "Block?",
            "Are you sure you want to block this person?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        this.setState({ isLoading: true })
                        // console.log('blockUnblock webs',this.state.block)
                        // console.log(`${R.constants.Api.blockUnblock}${this.state.user_id}&profile_id=${this.state.profile_id}&action=${this.state.block=="10"?0:1}`)
                        Utils.ApiPost(`${R.constants.Api.blockUnblock}${this.state.user_id}&profile_id=${this.state.profile_id}&action=${this.state.block == "10" ? 0 : 1}`, response = (data) => {
                            // console.log("blockUnblock===>",data.data)
                            if (data.res == 200) {
                                if (data.data.res_status == "success") {

                                    this.chatList()
                                }
                            }
                            else {
                                // this.setState({isLoading:false})
                                // Toast.show("please check your internet.",Toast.SHORT)
                            }
                            // this.setState({isLoading:false})
                        })
                    }
                }
            ],
            { cancelable: true }
        );

    }

    _reportProfile() {
        Alert.alert(
            "Report?",
            "Are you sure you want to report this person?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        this.setState({ isLoading: true })
                        Utils.ApiPost(`${R.constants.Api.reportProfile}${this.state.user_id}&profile_id=${this.state.profile_id}`, response = (data) => {
                            // console.log("reportProfile===>",data.data)
                            if (data.res == 200) {
                                if (data.data.res_status == "success") {
                                    // console.log("reportProfile===>",data.data)
                                    this.chatList()
                                    Toast.show("Profile reported successfully.", Toast.SHORT)
                                }
                            }
                            else {
                                // this.setState({isLoading:false})
                                // Toast.show("please check your internet.",Toast.SHORT)
                            }
                            this.setState({ isLoading: false })
                        })
                    }
                }
            ],
            { cancelable: true }
        );

    }

    onProfileClick() {
        // console.log("profileCicked",this.state.profile_id)
        this.backHandler.remove();
        this.props.navigation.navigate("ProfileDetails", { "profile_id": this.state.profile_id, "from": "", "backFromProfile": this.backFromProfile.bind(this) })

    }

    backFromProfile(data) {
        // console.log("back form profile====>",data)
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.renderModel()}

                <View style={{ flexDirection: 'row', elevation: 5, backgroundColor: "#fff", }}>
                    <Header
                        style={{ flex: 1, elevation: 0 }}
                        chatScreen={true}
                        profileImage={pImg !== "" ? pImg : null}
                        backClick={() => this.goBack()}
                        title={this.state.data.display_name}
                        ProfileClick={() => this.onProfileClick()}
                        giftClicked={() => this.setState({ giftsLoading: true }, () => { this.AlertBoxVisibility(), this.getgiftList() })}
                        disableCall={this.state.chatMessages.block_call == "20"}
                        callClicked={() => this.callClickedChat()}
                    />

                    <Menu
                        ref={this.setMenuRef}
                        button={
                            <TouchableOpacity
                                style={{ backgroundColor: "#fff", height: 55, alignItems: 'center', justifyContent: 'center' }}
                                onPress={this.showMenu}>
                                <Icon name="dots-vertical" size={30} color="#232323" />
                            </TouchableOpacity>
                        }>
                        <MenuItem onPress={this.option1Click}>
                            View Profile
                        </MenuItem>
                        {this.state.chatMessages.mylike > 0 && <MenuItem onPress={this.option2Click}>
                            Cancel Crush?
                        </MenuItem>}
                        <MenuItem onPress={this.option3Click}>
                            Clear chat history
                        </MenuItem>
                        <MenuItem onPress={this.option4Click}>
                            {this.state.block == "20" ? "Unblock" : "Block"}
                        </MenuItem>
                        <MenuItem onPress={this.option5Click}>
                            Report
                        </MenuItem>
                    </Menu>
                </View>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        {this.renderChatMessages()}
                    </View>
                    {this.state.block == "10" &&
                        <View style={{ height: 60, alignItems: 'center', flexDirection: 'row', padding: 10, paddingTop: 0 }}>
                            <TouchableOpacity style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 0.2 }} onPress={() => this.setState({ giftsLoading: true }, () => { this.AlertBoxVisibility(), this.getgiftList() })}>
                                <View style={{ padding: 7, borderRadius: 50, backgroundColor: '#fff', }}>
                                    <Icon name="gift" size={25} color="red" />
                                </View>
                            </TouchableOpacity>
                            <View style={{ backgroundColor: '#fff', paddingHorizontal: 10, flexDirection: 'row', alignItems: 'center', flex: 1, borderRadius: 50, borderWidth: StyleSheet.hairlineWidth, margin: 5, borderColor: '#d3d3d3' }}>
                                <TextInput
                                    editable={!this.state.isRecording}
                                    style={{ flex: 1 }}
                                    placeholder={"Enter Message"}
                                    onChangeText={(text) => this.setState({ chatMessage: text })}
                                    value={this.state.chatMessage}
                                />
                                <TouchableOpacity onPress={() => this.checkPermission(2)} style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="paperclip" size={25} color="lightgrey" style={{ transform: [{ rotateZ: '-45deg' }] }} />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={() => this.checkPermission(1)} style={{ flex: 0.2, justifyContent: 'center', alignItems: 'center' }}>
                                    <Icon name="camera" size={25} color="lightgrey" />
                                </TouchableOpacity>
                            </View>
                            <TouchableOpacity onPress={() => this.state.chatMessage == "" ? this.recordMessage() : this.chatStatus()} style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flex: 0.2 }}>
                                <View style={{ padding: 7, borderRadius: 50, backgroundColor: '#232323', }}>
                                    {!this.state.isRecording && <Icon name={this.state.chatMessage == "" ? "microphone" : "send"} size={25} color="#fff" />}
                                    {this.state.isRecording && <Text style={{ paddingVertical: 5, color: '#fff' }}>Stop</Text>}
                                </View>
                            </TouchableOpacity>
                            
                        </View>
                    }
                </View>
                {this.state.activeCall == "true" &&
                    <TouchableOpacity onPress={() => this.callClickedChat()} style={{ zIndex: 100, position: "absolute", left: 0, right: 0, alignItems: "center", justifyContent: 'center', height: 30, top: 55, backgroundColor: '#05adf6' }}>
                        <Text style={{ color: '#fff' }} >
                            On Going call, Tap to expand
                        </Text>
                        <View style={{ position: 'absolute', right: 5, top: 0, bottom: 0, justifyContent: 'center' }}>
                            <Text style={{ color: '#fff' }} >
                                {this.state.timerValue}
                            </Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }
}