import React from 'react'
import { View, Text, Image, TextInput, TouchableOpacity,BackHandler,Modal,StyleSheet,Dimensions} from 'react-native'
import Button from 'comp/Button'
import TextView from 'comp/TextView'
import TextInputView from 'comp/TextInputView'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import R from 'res/R'
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from "react-native-simple-toast";
import Utils from 'res/Utils'
import Loader from 'comp/Loader'

const axios = require('axios').default;

export default class Login extends React.Component {
    constructor() {
        super()
        this.state = ({
            eMail: "",
            Password: "",
            isLoading:false,
            fcmToken:"",
            Alert_Visibility:false,
            forgetPassword:""
        })
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
        );
    }

    componentDidMount() {
        Utils.getData("fcmToken",value=(data)=>{
            console.log(data)
            this.setState({fcmToken:data.value})
        })
    }

    componentWillUnmount() {
        this.backHandler.remove();
    }

    backAction= ()=>{
        console.warn("back")
        this.props.navigation.replace("Landing")
        return true
    }

    _ValidateInput() {
        this.setState({isLoading:true})
        if (this.state.eMail.trim() == "") {
            Toast.show("Please enter email", Toast.SHORT)
            this.setState({isLoading:false})
        }
        else if (this.state.eMail.trim() == "") {
            Toast.show("Please enter password", Toast.SHORT)
            this.setState({isLoading:false})
        }
        else {
            this._login_Web_Service()
        }
    }

    response = (data) => {
        console.log("data=====>",data)
        if(data.res=="network error"){
            Toast.show("Please check your internet.",Toast.SHORT)
            this.setState({isLoading:false})
        }
        else if(data.res==200){
            if(data.data.res_status=="success"){
                this.getProfileDetails("login",data.data.user_id)
            }
            else if(data.data.res_status=="inactive"){
                Toast.show("Your account is inactive, please contact customer care by visiting dadio.in",Toast.SHORT)
            }
            else{
                Toast.show("Invalid Credentials",Toast.SHORT)
            }
            this.setState({isLoading:false})
        }

    }

    _login_Web_Service = async () => {
        Utils.ApiPost(`${R.constants.Api.login}${this.state.eMail}&password=${this.state.Password}&device_token=${this.state.fcmToken}`, this.response)
    }

    getProfileDetails(type,id){
        Utils.ApiPost(`${R.constants.Api.basicInfo}${id}`,response =(data)=>{
            if(data.res==200){
                if(data.data.res_status=="success"){
                    console.log("basicInfo service===>",data.data.profile_pic)
                    this.setState({isLoading:false},()=>{
                        if(data.data.profile_pic==""){
                            this.props.navigation.navigate("AfterSignUp",{"from":type,"data":data.data,"screen":1})
                        }
                        else if(data.data.audio_file=="https://dadio.in/apps/uploads/"){
                            this.props.navigation.navigate("AfterSignUp",{"from":type,"data":data.data,"screen":2})
                        }
                        else if(data.data.gender==""||data.data.age=="01/01/1995"){
                            this.props.navigation.navigate("AfterSignUp",{"from":type,"data":data.data,"screen":3})
                        }
                        else{
                            Utils.storeData("userData",JSON.stringify(data.data))
                            Toast.show("Login Sucessful!",Toast.SHORT)
                            this.props.navigation.replace("Dashboard",{"from":type})
                        }
                    })                    
                }
            }
        })
    }

    AlertBoxVisibility() {
        this.setState({ Alert_Visibility: !this.state.Alert_Visibility });
    }

    renderModel(){
        return (
            <Modal
                visible={this.state.Alert_Visibility}
                transparent={true}
                animationType={"fade"}
                onRequestClose={() => { this.AlertBoxVisibility() }} >
                    {this.showContent()}
            </Modal>
      
          );
    }

    _updatePassword(){
        // console.log(R.constants.Api.forgetPassword+this.state.forgetPassword)
        Utils.ApiPost(R.constants.Api.forgetPassword+this.state.forgetPassword,response=(data)=>{
            console.log("forgetPassword=====>",data)
            if(data.res==200){
                if(data.data.res_status=="success"){
                    this.AlertBoxVisibility()
                    this.setState({forgetPassword:""})
                    Toast.show("Your password has been sent to your registered email",Toast.SHORT)
                }
                else{
                    Toast.show("Something went wrong",Toast.SHORT)
                }
            }
        })
    }

    showContent(){
        return(
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center',backgroundColor:'rgba(0,0,0,0.8)'}}>
                <View style={{width:'90%',backgroundColor:'#232323',borderRadius:10}}>
                    <View style={{flexDirection:'row',justifyContent:'space-between',padding: 20,}}>
                        <Text style={{color:'#fff',fontSize:16,fontWeight:'bold'}}>
                            Forgot Your Password?
                        </Text>
                        <TouchableOpacity onPress={()=>this.AlertBoxVisibility()}>
                            <Icon name="remove" size={25} color="#fff"/>
                        </TouchableOpacity>
                    </View>
                    <View style={{paddingHorizontal: 25,paddingVertical:10,backgroundColor:"white",borderBottomStartRadius:10,borderBottomEndRadius:10,alignItems:'center'}}>
                        <TextInput
                            onChangeText={(text)=>this.setState({forgetPassword:text})}
                            style={{borderWidth:StyleSheet.hairlineWidth,width:'100%',borderRadius:5}}
                            placeholder={"Enter your registered email"}
                            value={this.state.forgetPassword}
                        />
                        <TouchableOpacity onPress={()=>this._updatePassword()} style={{height:40,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#232323',paddingHorizontal:10,margin: 10,}}>
                            <Text style={{fontSize:16,paddingHorizontal:5,color:'#fff'}}>
                                Submit
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        )
    }
    
    render() {
        return (
            <KeyboardAwareScrollView>
                <View style={{height:Dimensions.get("screen").height}}>
                    <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    
                    <Image
                        source={R.images.t1}
                        style={{ position: 'absolute', top: 0, left: 0, height: 120, width: 180, zIndex: 5 }}
                    />

                    <Image
                        source={R.images.t2}
                        style={{ position: 'absolute', bottom: 0, right: 0, height: 120, width: 180 }}
                    />
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Image
                            source={R.images.logo}
                            style={{ height: 120, width: 190 }}
                        />
                    </View>
                    <KeyboardAwareScrollView >
                        <TextInputView
                            title={"Email Id"}
                            placeholder={"Enter Email Id"}
                            textValue={this.state.eMail}
                            onChangeValue={(text) => this.setState({ eMail: text })}
                            keyboardType={"email-address"}
                        />
                        <TextInputView
                            title={"Password"}
                            placeholder={"Enter Password"}
                            textValue={this.state.Password}
                            onChangeValue={(text) => this.setState({ Password: text })}
                            keyboardType={"default"}
                            passwordField={true}
                        />
                        <Button btnPress={() => this._ValidateInput()} btnStyle={{ backgroundColor: R.colors.submit, flex: 1 }} btnText={"Submit"} />
                        <View style={{ alignItems: 'center' }}>
                            <TouchableOpacity onPress={()=>this.AlertBoxVisibility()}>
                                <TextView textStyle={{ color: R.colors.cyan }} textValue={"Forgot Password?"} />
                            </TouchableOpacity>
                        </View>
                    </KeyboardAwareScrollView>
                    {this.state.isLoading&&<View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                        <Loader/>
                    </View>}
                    {this.renderModel()}
                </View>
                </View>
            </KeyboardAwareScrollView>
        )
    }
}