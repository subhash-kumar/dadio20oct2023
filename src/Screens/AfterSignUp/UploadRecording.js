import React from 'react'
import {View,Text,Image,TouchableOpacity,PermissionsAndroid,ScrollView} from 'react-native'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from 'comp/Button';
import Toast from "react-native-simple-toast";
import AudioRecord from 'react-native-audio-record';
import { each } from "underscore";
import Loader from 'comp/Loader'
import Utils from 'res/Utils'
import Sound from 'react-native-sound';

let profileAudio
let intervalId
const options = {
    sampleRate: 16000,  // default 44100
    channels: 1,        // 1 or 2, default 1
    bitsPerSample: 16,  // 8 or 16, default 16
    audioSource: 6,     // android only (see below)
    wavFile: 'test.wav' // default 'audio.wav'
};
export default class UploadRecording extends React.Component{

    constructor(){
        super()
        this.state=({
            isRecording:false,
            isPlaying:false,
            timer:"",
            audioUri:""
        })
    }

    checkPermission(){
        if (Platform.OS === "android") {
            this.checkAndroidPermissions()
            .then(() => {
                this.setState({ permissionsError: false },()=>{
                    this.startRecording()
                });
            })
            .catch(error => {
                this.setState({ permissionsError: true,isLoading:false });
                console.log("checkAndroidPermissions", error);
                return;
            });
            
        }
    }

    startRecording(){
        AudioRecord.init(options);
        AudioRecord.start();
        var counter=20
        intervalId = setInterval(()=>{this.setState({timer:counter},()=>counter=counter-1)},1000)
        setTimeout(async()=>{
            var formData = new FormData();
            var Audio = await AudioRecord.stop();

            console.log("audio file====>",Audio)
            var Data={
                uri:
                  Platform.OS === "android"
                    ? `file://${Audio}`
                    : Audio.replace("file://", ""),
                type: 'audio/x-wav',
                name: "test.wav"
              }
              formData.append("file",Data)
              console.log('formData===>',formData)
              this.saveRecording(formData)
            this.setState({isRecording:false},()=>clearInterval(intervalId))
        },20000)
    }

    saveRecording = async(body)=>{
        this.setState({isLoading:true})
        // console.log('formData===>',JSON.stringify(body))
        await Utils.ApiPostwithBody(`${R.constants.Api.saveAudio}${this.props.userId}`,body,response=(data)=>{
            console.log("saveRecording service===>",data)
            // if(data.res==200){
            //     if(data.data.res_status=="success"){
                    this.getProfileDetails()

                    console.log("saved")
                    Toast.show("Recording saved",Toast.SHORT)
            //     }
            // }
        })
    }

    getProfileDetails(){

        Utils.ApiPost(`${R.constants.Api.basicInfo}${this.props.userId}`,response =(data)=>{
            if(data.res==200){
                if(data.data.res_status=="success"){
                    console.log("basicInfo service===>",data.data)
                    this.setState({audioUri:data.data.audio_file,isLoading:false})                    
                }
            }
        })
    }
    

    checkAndroidPermissions = () =>
        new Promise((resolve, reject) => {
            PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                PermissionsAndroid.PERMISSIONS.RECORD_AUDIO
		])
		.then(result => {
			const permissionsError = {};
			permissionsError.permissionsDenied = [];
			each(result, (permissionValue, permissionType) => {
                if (permissionValue === "denied") {
                    console.log("denied Permission");
                    permissionsError.permissionsDenied.push(permissionType);
                    permissionsError.type = "Permissions error";
                }
			})
			if (permissionsError.permissionsDenied.length > 0) {
                console.log("denied Permission");
                reject(permissionsError);
			} else {
                console.log("granted Permission");
                resolve();
			}
		})
		.catch(error => {
			reject(error);
		});
    });
    
    playAudio(){
        // console.log(this.state.audioUri)
        if(this.state.audioUri==""){
            Toast.show("Please Record first!",Toast.SHORT)
            this.setState({isPlaying:false})
        }else{
            profileAudio = new Sound(this.state.audioUri, Sound.MAIN_BUNDLE,
                (error, sound) => {
                  if (error) {
                    // alert('error' + error.message);
                    return;
                  }
                  profileAudio.play(() => {
                    profileAudio.release();
                  });
                });
        }      
    }

    stopAudio(){
        // console.log("qwertyuiopstop")
        if(!this.state.isPlaying){
            profileAudio.stop(() => {
                console.log('Stop');
                this.setState({isPlaying:false})
            })
        }
    }

    render(){
       return(
        <View style={{flex:1}}>
            <Image
                source={R.images.t1}
                style={{position:'absolute',top:0,left:0 ,height:120,width:180}}
            />
            <Image
                source={R.images.t2}
                style={{position:'absolute',bottom:0,right:0 ,height:120,width:180}}
            />
            <ScrollView>
            <View style={{flex:1,alignItems:'center',justifyContent:'center',margin:40}}>
                <Image
                    source={R.images.logo}
                    style={{height:120,width:190,marginVertical:10}}
                />
                
                    
                    <View style={{flexDirection:'row',padding:10,width:"100%",borderBottomStartRadius:10,borderBottomEndRadius:10}}>
                        <TouchableOpacity disabled={this.state.isRecording} 
                        onPress={()=>this.setState({isRecording:true},()=>this.checkPermission())} 
                        style={{borderRadius:10,flex:2,flexDirection:'row',justifyContent:'center',backgroundColor:"#232323",padding:10,alignItems:'center'}}>
                            {!this.state.isRecording&&
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Icon name="microphone" size={25} color="#fff"/>
                                    <Text style={{color:'#fff',marginHorizontal:5}}>
                                        {this.state.audioUri!==""?"Edit":"Start"} Recoding
                                    </Text>
                                </View>
                            }
                            {this.state.isRecording&&
                                <View style={{flex:1,alignItems:'center',padding:5}}>
                                    <Text style={{color:'#fff'}}>
                                        {this.state.timer==''?"please wait...":this.state.timer}
                                    </Text>
                                </View>
                            }
                        </TouchableOpacity>
                        {!this.state.isRecording&&this.state.audioUri!==""&&<TouchableOpacity onPress={()=>this.setState({isPlaying:!this.state.isPlaying},()=>this.state.isPlaying?this.playAudio():this.stopAudio())} style={{borderRadius:10,marginHorizontal:10,flex:1,flexDirection:'row',backgroundColor:"#232323",padding:10,alignItems:'center'}}>
                            <Icon name={this.state.isPlaying?"stop-circle-outline":"play"} size={25} color="#fff"/>
                            <Text style={{color:'#fff',marginHorizontal:5}}>
                                {this.state.isPlaying?"Stop":"Play"}
                            </Text>
                        </TouchableOpacity>}
                    </View>
                <Button btnPress={()=>this.state.audioUri==""?Toast.show("Please record audio first"):this.props.UploadClick(3)} btnStyle={{backgroundColor:"#232323",paddingHorizontal:15,}} btnText={"Next: Select Gender"}/>
            </View>
            </ScrollView>
            
            {this.state.isLoading&&
                <View style={{zindex:5,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                    <Loader/>
                </View>
            }
        </View>
        )
    }
}