import React from 'react'
import {View,Text,TouchableOpacity,BackHandler,StyleSheet,PermissionsAndroid,Picker,Modal} from 'react-native'
import Header from 'comp/Header'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { each } from "underscore";
import TextInputView from 'comp/TextInputView'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Utils from 'res/Utils'
import Sound from 'react-native-sound';
import Toast from "react-native-simple-toast";
// import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import Loader from 'comp/Loader'
import AudioRecord from 'react-native-audio-record';
import DateTimePicker from '@react-native-community/datetimepicker';

let showPicker=false
var profileAudio
var intervalId=0

const options = {
    sampleRate: 16000,  // default 44100
    channels: 1,        // 1 or 2, default 1
    bitsPerSample: 16,  // 8 or 16, default 16
    audioSource: 6,     // android only (see below)
    wavFile: 'test.wav' // default 'audio.wav'
};
export default class BasicInfo extends React.Component{
    constructor(props){
        super(props)
        this.state=({
            isLoading:false,
            showPicker:false,
            user_id:"",
            isRecording:false,
            isPlaying:false,
            permissionsError:false,
            audioUri:"",
            gender:0,
            Name:"",
            age:"",
            displayName:'',
            height:"",
            weight:"",
            profession:"",
            selectedState:"",
            selectedCity:"",
            handed:0,
            basicInfo:"",
            stateList:"",
            cityList:"",
            maxDate:moment(new Date()).subtract(18, 'year').calendar(),
            minDate:moment(new Date()).subtract(70, 'year').calendar(),
            timer:'',
            Alert_Visibility: false,
        })
        AudioRecord.init(options);

    }

    AlertBoxVisibility() {
        this.setState({ Alert_Visibility: !this.state.Alert_Visibility });
    }

    componentDidMount(){
        this.setState({
            basicInfo:this.props.navigation.getParam("details")
        },()=>{
            this.setState({
                user_id:this.state.basicInfo.user_id.trim(),
                audioUri:this.state.basicInfo.audio_file.trim(),
                Name:this.state.basicInfo.name.trim(),
                displayName:this.state.basicInfo.display_name.trim(),
                // age:moment(this.state.basicInfo.age,"dd/mm/yyyy").format(),
                age:this.state.basicInfo.age.trim(),
                gender:this.state.basicInfo.gender.trim()=="Male"?1:2,
                height:this.state.basicInfo.height.trim(),
                weight:this.state.basicInfo.weight.trim(),
                profession:this.state.basicInfo.profession.trim(),
                selectedState:this.state.basicInfo.state.trim(),
                selectedCity:this.state.basicInfo.city.trim(),
                handed:this.state.basicInfo.use_hand.trim()=="10"?0:1
            },()=>{
                console.log(this.state.basicInfo)
                console.log(this.state.selectedState)
                console.log(this.state.selectedCity)
                // console.log("age------>",moment(this.state.age,"dd/mm/yyyy").format())
                this._getState()
                this._getCity()
            })
        })
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
          );
    }
    componentWillUnmount() {
        this.backHandler.remove();
      }

      backAction=()=>{
        this.stopAudio()
        this.props.navigation.state.params.backFromBasicInfo();
      }

      goBack() {
        this.props.navigation.state.params.backFromBasicInfo();
        this.props.navigation.goBack();
    }

    _getState(){
        try{
        Utils.ApiPost(`${R.constants.Api.getState}`,response =(data)=>{
            if(data.res==200){
                console.log("getState service===>",data.data)
                this.setState({stateList:data.data.state_list})
                // alert(data);
            }
        })
        } catch(error){
            console.log("_getstate");
        }
    }

    _getCity(){
        try{
        Utils.ApiPost(`${R.constants.Api.getCity}${this.state.selectedState}`,response =(data)=>{
            if(data.res==200){
                // console.log("getcity service===>",data.data)
                this.setState({cityList:data.data.city_list})
            }
        })
        } catch(error){
            console.log("_getcity");
        }
    }

    _retreiveData= async()=>{
        try{
		if (Platform.OS === "android") {
		    this.checkAndroidPermissions()
			.then(() => {
                this.setState({ permissionsError: false },()=>{
                    this.startRecording()
                });
            })
            .catch(error => {
                this.setState({ permissionsError: true });
                console.log("checkAndroidPermissions", error);
                return;
            });
		} 
        } catch(error){
            console.log("_retreiveData");
        }

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
			});
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
        console.log(this.state.audioUri)
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

    stopAudio(){
        if(this.state.isPlaying){
            profileAudio.stop(() => {
                console.log('Stop');
                this.setState({isPlaying:false})
            })
        }
    }

    validateData(){
        
        if(this.state.Name.trim()==""){
            Toast.show("Please enter Name",Toast.SHORT)
        }
        else if(this.state.displayName.trim()==""){
            Toast.show("Please enter Display Name",Toast.SHORT)
        }
        else if(this.state.age==""){
            Toast.show("Please enter age",Toast.SHORT)
        }
        else if(this.state.gender==0){
            Toast.show("Please select gender",Toast.SHORT)
        }
        else{
            this.setState({isLoading:true},()=>
                this.updateBasicInfo()
            )
            
        }
    }

    updateBasicInfo(){
        try{

        Utils.ApiPost(`${R.constants.Api.updateBasicInfo}${this.state.user_id}${this.state.gender!==0?`&gender=${this.state.gender==1?"Male":this.state.gender==2?"Female":null}`:""}&name=${this.state.Name.trim()}&display_name=${this.state.displayName.trim()}&age=${this.state.age}${this.state.weight!==""?`&weight=${this.state.weight}`:""}${this.state.height!==""?`&height=${this.state.height}`:""}${this.state.profession!==""?`&profession=${this.state.profession.trim()}`:""}${this.state.selectedState!=="0"?`&state=${this.state.selectedState}`:""}${this.state.selectedCity!=="0"?`&city=${this.state.selectedCity}`:""}&use_hand=${this.state.handed==0?"10":"20"}`,response =(data)=>{
            if(data.res==200){
                console.log("updateBasicInfo service===>",data.data)
                if(data.data.res_status=="success"){
                    Toast.show("Info updated successfull",Toast.SHORT)
                    this.setState({isLoading:false},()=>this.goBack()) 
                }
                else{
                    this.setState({isLoading:false})
                }
            }
        })
      } catch(error){
          console.log("updateBasicInformationAPI");
      }
    }

    renderModel(){
        return (
            <Modal
                visible={this.state.Alert_Visibility}
                transparent={true}
                animationType={"fade"}
                onRequestClose={() => { this.AlertBoxVisibility() }} >
                    {
                        this.recordVoiceContent()
                    }
            </Modal>
      
          );
    }

    recordVoiceContent(){
        return(
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center',backgroundColor:'rgba(0,0,0,0.8)'}}>
                <View style={{width:'85%',backgroundColor:'#232323',borderRadius:10}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',padding: 20,}}>
                        <Text style={{color:'#fff',fontSize:16,fontWeight:'bold'}}>
                            Record Your Voice
                        </Text>
                        <TouchableOpacity onPress={()=>{
                                if(this.state.isPlaying){
                                    this.setState({isPlaying:false},()=>{
                                        this.stopAudio()
                                    })
                                }
                                if(this.state.isRecording){
                                    this.setState({isRecording:false,timer:20},()=>{
                                        clearInterval(intervalId)
                                        AudioRecord.stop();
                                    })
                                }
                                this.AlertBoxVisibility()
                                
                            }}>
                            <Icon name="close-thick" size={25} color="#fff"/>
                        </TouchableOpacity>
                    </View>
                    <View style={{flexDirection:'row',padding:10,backgroundColor:'#fff',borderBottomStartRadius:10,borderBottomEndRadius:10}}>
                        <TouchableOpacity disabled={this.state.isRecording} 
                        onPress={()=>this.setState({isRecording:true},()=>this._retreiveData())} 
                        style={{borderRadius:10,margin:10,flex:2,flexDirection:'row',backgroundColor:"#232323",padding:10,alignItems:'center'}}>
                            {!this.state.isRecording&&
                                <View style={{flexDirection:'row',alignItems:'center'}}>
                                    <Icon name="microphone" size={25} color="#fff"/>
                                    <Text style={{color:'#fff',marginHorizontal:5}}>
                                        Edit Recoding
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
                        {!this.state.isRecording&&<TouchableOpacity onPress={()=>this.setState({isPlaying:!this.state.isPlaying},()=>this.state.isPlaying?this.playAudio():this.stopAudio())} style={{borderRadius:10,margin:10,flex:1,flexDirection:'row',backgroundColor:"#232323",padding:10,alignItems:'center'}}>
                            <Icon name={this.state.isPlaying?"stop-circle-outline":"play"} size={25} color="#fff"/>
                            <Text style={{color:'#fff',marginHorizontal:5}}>
                                {this.state.isPlaying?"Stop":"Play"}
                            </Text>
                        </TouchableOpacity>}
                    </View>
                </View>
            </View>
        )
    }

    startRecording(){
        AudioRecord.start();
        var counter=20
        intervalId = setInterval(()=>{this.setState({timer:counter},()=>counter=counter-1)},1000)
        setTimeout(async()=>{
            var formData = new FormData();
            var audioFile = await AudioRecord.stop();
            console.log("audio file====>",audioFile)
            var Data={
                uri:
                  Platform.OS === "android"
                    ? `file://${audioFile}`
                    : audioFile.replace("file://", ""),
                type: 'audio/x-wav',
                name: "test.wav"
              }
              formData.append("file",Data)
              console.log('formData===>',formData)
              this.saveRecording(formData)
              clearInterval(intervalId)
        },21000)
    }

    saveRecording = async(body)=>{
        console.log('formData===>',JSON.stringify(body))
        await Utils.ApiPostwithBody(`${R.constants.Api.saveAudio}${this.state.user_id}`,body,response=(data)=>{
            console.log("saveRecording service===>",data)
            this.getProfileDetails()
        })
    }

    getProfileDetails(){
        this.setState({isLoading:true})
        Utils.ApiPost(`${R.constants.Api.basicInfo}${this.state.user_id}`,response =(data)=>{
            if(data.res==200){
                // alert(data);
                if(data.data.res_status=="success"){
                    console.log("basicInfo service===>",data.data)
                    this.setState({audioUri:data.data.audio_file,isLoading:false},()=>this.setState({isRecording:false},()=>{
                        Toast.show("Recording saved",Toast.SHORT)
                    })
                )                   
                }
            }
        })
    }

    render(){
        return(
            <View style={{flex:1}}>
                
                <Header backClick={()=>this.goBack()} title={"Basic Info"}/>
                <KeyboardAwareScrollView style={{flex:1,backgroundColor: "#fff",}}>
                    <View style={{flexDirection:'row'}}>
                        <TouchableOpacity
                            style={{ flexDirection:'row',margin:20,padding:10,backgroundColor: "#232323",borderRadius:10,}}
                            onPress={()=>this.AlertBoxVisibility()}>
                            <Icon name="microphone" size={20} color="#fff"/>
                            <Text style={{color:"#fff",marginHorizontal:5}}>
                                {this.state.isRecording?"Stop Recording":"Recording/Play Audio"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <TextInputView
                        title={"Name"}
                        placeholder={"Enter Name"}
                        textValue={this.state.Name}
                        onChangeValue={(text)=>this.setState({Name:text})}
                        keyboardType={"default"}
                    />
                    <TextInputView
                        title={"Display Name"}
                        placeholder={"Enter Display Name"}
                        textValue={this.state.displayName}
                        onChangeValue={(text)=>this.setState({displayName:text})}
                        keyboardType={"default"}
                    />
                    <View style={{padding:20,}}>
                        <Text style={{paddingBottom:10,paddingStart:4,fontWeight:'bold',fontSize:16}}>
                            Gender
                        </Text>
                        <View style={{flexDirection:'row',}}>
                            <TouchableOpacity   onPress={()=>this.setState({gender:1})}  style={{paddingHorizontal:10,flexDirection:'row',borderTopStartRadius:10,borderBottomStartRadius:10,height:40,flex:1,alignItems:'center',justifyContent:'flex-start',backgroundColor:this.state.gender==1?R.colors.cyan:"lightgrey"}}>
                                <Icon name="gender-male" size={20} color="#000"/>
                                <Text style={{marginHorizontal:5}}>
                                    Male
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.setState({gender:2})} style={{paddingHorizontal:10,flexDirection:'row',borderTopEndRadius:10,borderBottomEndRadius:10,height:40,flex:1,alignItems:'center',justifyContent:'flex-start',backgroundColor:this.state.gender==2?"pink":"lightgrey"}}>
                                <Icon name="gender-female" size={20} color="#000"/>
                                <Text style={{marginHorizontal:5}}>
                                    Female
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{flex:1 , padding:20}}>
                        <Text style={{fontWeight:'bold',fontSize:16}}>
                            Age
                        </Text>
                        <TouchableOpacity 
                        style={{height:40}}
                            onPress={()=>{this.setState({showPicker:true})}}
                            >
                            <Text style={{marginVertical:10,width:"100%",borderBottomColor:'black',borderBottomWidth:StyleSheet.hairlineWidth,height:40}}>
                                {/* {moment(this.state.age,"").format("DD/MM/YYYY")} */}
                                {this.state.age}
                            </Text>
                        </TouchableOpacity>
                        {this.state.showPicker&&<DateTimePicker
                            maximumDate={new Date(this.state.maxDate)}
                            minimumDate={new Date(this.state.minDate)}
                            testID="datePicker"
                            value={new Date(moment(this.state.age,"DD/MM/YYYY").format())}
                            mode={'date'}
                            is24Hour={true}
                            display="default"
                            onChange={(event, selectedDate) => {
                                this.setState({age:moment(selectedDate,"").format("DD/MM/YYYY"),showPicker:false}
                                    ,()=>{
                                        console.log(moment(selectedDate,"").format("DD/MM/YYYY"),"=========>",event)
                                })
                              }}
                            />}
                        </View>
                    
                    <View style={{flexDirection:'row'}}>
                        <View style={{flex:1}}>
                            <TextInputView
                                title={"Height"}
                                placeholder={"Enter Height"}
                                textValue={this.state.height}
                                length={3}
                                onChangeValue={(text)=>this.setState({height:text})}
                                keyboardType={"decimal-pad"}
                            />
                            <Text style={{position: "absolute",right:20,bottom:25}}> Cm </Text>
                        </View>
                        <View style={{flex:1}}>
                            <TextInputView
                                title={"Weight"}
                                length={3}
                                placeholder={"Enter Weight"}
                                textValue={this.state.weight}
                                onChangeValue={(text)=>this.setState({weight:text})}
                                keyboardType={"decimal-pad"}
                            />
                            <Text style={{position: "absolute",right:20,bottom:25}}> Kg </Text>
                        </View>
                    </View>
                    <TextInputView
                        title={"Profession"}
                        placeholder={"Enter Your Profession"}
                        textValue={this.state.profession}
                        onChangeValue={(text)=>this.setState({profession:text})}
                        keyboardType={"default"}
                    />
                    <View style={{marginHorizontal:20,paddingVertical:10,borderBottomWidth:StyleSheet.hairlineWidth}}>
                        <Text style={{paddingStart:4,fontWeight:'bold',fontSize:16}}>
                            State
                        </Text>
                        <Picker
                            selectedValue={this.state.selectedState}
                            style={{ height: 40,color:this.state.selectedState=='0'?"lightgrey":"#000"}}
                            onValueChange={(itemValue, itemIndex) => this.setState({selectedState:itemValue,selectedCity:0},()=>{this._getCity()})}
                            >
                            <Picker.Item label='Choose your State' color={"#d3d3d3"} value='0' />
                            {this.state.stateList!==""&&this.state.stateList.map((item)=>{
                                return(
                                    <Picker.Item label={item.state_name} value={item.state_id} />
                                )
                            })}
                        </Picker>
                    </View>
                    <View style={{marginHorizontal:20,paddingVertical:10,borderBottomWidth:StyleSheet.hairlineWidth}}>
                        <Text style={{paddingStart:4,fontWeight:'bold',fontSize:16}}>
                            City
                        </Text>
                        <Picker
                            enabled={this.state.selectedState!=="0"}
                            selectedValue={this.state.selectedCity}
                            style={{ height: 40,color:this.state.selectedCity==0?"lightgrey":"#000"}}
                            onValueChange={(itemValue, itemIndex) => this.setState({selectedCity:itemValue})}
                        >
                            <Picker.Item label='Choose your city' color={"#d3d3d3"} value='0' />
                            {this.state.cityList!==""&&this.state.cityList.map((item)=>{
                                return(
                                    <Picker.Item label={item.city_name} value={item.city_id} />
                                )
                            })}
                        </Picker>
                    </View>
                    <View style={{padding:20,}}>
                        <Text style={{paddingBottom:10,paddingStart:4,fontWeight:'bold',fontSize:16}}>
                            I am
                        </Text>
                        <View style={{flexDirection:'row',}}>
                            <TouchableOpacity   onPress={()=>this.setState({handed:0})}  style={{flexDirection:'row',height:40,flex:1,alignItems:'center',justifyContent:'flex-start'}}>
                                <Icon name={this.state.handed==0?"radiobox-marked":"radiobox-blank"} size={20} color="#000"/>
                                <Text style={{marginHorizontal:5}}>
                                    Left Handed
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={()=>this.setState({handed:1})} style={{flexDirection:'row',height:40,flex:1,alignItems:'center',justifyContent:'flex-start'}}>
                                <Icon name={this.state.handed==1?"radiobox-marked":"radiobox-blank"} size={20} color="#000"/>
                                <Text style={{marginHorizontal:5}}>
                                    Right Handed
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{paddingHorizontal:20,marginBottom:20}}>
                        <TouchableOpacity onPress={()=>this.validateData()} style={{height:50,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#232323'}}>
                            <Text style={{fontSize:16,paddingHorizontal:5,color:'#fff'}}>
                                SAVE DETAILS
                            </Text>
                        </TouchableOpacity>
                    </View>
                   
                </KeyboardAwareScrollView>
                {this.renderModel()}
                {this.state.isLoading&&
                    <View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                        <Loader/>
                    </View>
                }
            </View>
        )
    }
}