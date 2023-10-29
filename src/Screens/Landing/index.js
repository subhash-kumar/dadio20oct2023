import React from 'react'
import {View,Text,Image,TouchableOpacity,BackHandler,Alert,Modal} from 'react-native'
import Button from 'comp/Button'
import TextView from 'comp/TextView'
import R from 'res/R'
import Icon from 'react-native-vector-icons/FontAwesome';
import {
    GoogleSignin,
    GoogleSigninButton,
    statusCodes
} from "react-native-google-signin";
import Toast from "react-native-simple-toast";

import {
    GraphRequest,
    GraphRequestManager,
    AccessToken,
    LoginButton,
    LoginManager
} from "react-native-fbsdk";
import Loader from 'comp/Loader'
import Utils from 'res/Utils'

const WEB_CLIENT_ID = '265491959516-tc06pvs6cg0ci36hsm2l2fehtujg3p1u.apps.googleusercontent.com'
const facebook_app_id = "317828375938376"
const fb_login_protocol_scheme = "fb317828375938376"
export default class Landing extends React.Component{

    constructor(){
        super()
        this.state=({
            userIcon:"",
            gettingLoginStatus:false,
            userInfo:"",
            isLoading:false,
        })
    }

    _navEmailLogin(){
        this.props.navigation.replace("Login")
    }

    

    componentDidMount() {
        
        GoogleSignin.configure({
            webClientId: WEB_CLIENT_ID,
            offlineAccess: true,
            hostedDomain: "",
            loginHint: "",
            forceConsentPrompt: true
        });
        // this._isSignedIn();
        GoogleSignin.configure();
        if(this.props.navigation.getParam('from')=="logOut"){
            if(this.props.navigation.getParam("type")=="google"){
                console.log("comBack===>",this.props.navigation.getParam("type"))
                this.signOut()
            }
            if(this.props.navigation.getParam("type")=="facebook"){
                console.log("comBack===>",this.props.navigation.getParam("type"))
                LoginManager.logOut()
            }
        }
    }
    
    _isSignedIn = async () => {
        const isSignedIn = await GoogleSignin.isSignedIn();
        if (isSignedIn) {
            this._getCurrentUserInfo();
        } else {
            console.log("Please Login");
        }
        this.setState({ gettingLoginStatus: false });
    };

    _getCurrentUserInfo = async () => {
        try {
            const userInfo = await GoogleSignin.signInSilently();
            console.log("User Info --> ", userInfo);
            this.SocialSignUp("google",userInfo)
            // socialData = userInfo;
            // this.signOut();
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_REQUIRED) {
                // alert("User has not signed in yet");
                console.log("User has not signed in yet");
            } else {
                // alert("Something went wrong. Unable to get user's info");
                console.log("Something went wrong. Unable to get user's info");
            }
            this.setState({isLoading:false})
        }
    };

    comeBack(data,type){
        this.setState({isLoading:true})
        console.log("comBack",data,"===>",type)
        if(data=="signUp"){
            if(type=="google"){
                console.log("comBack",data,"===>",type)
                this._signIn()
            }
            if(type=="facebook"){
                console.log("comBack",data,"===>",type)
                this._fbAuth()
            }
        }
    }

    signOut = async () => {
        try {
          await GoogleSignin.revokeAccess();
          await GoogleSignin.signOut();
        } catch (error) {
          console.error(error);
        }
    };

    _signIn = async () => {
        try {
            await GoogleSignin.hasPlayServices({
                showPlayServicesUpdateDialog: true
            });
            const userInfo = await GoogleSignin.signIn();
            console.log("User Info  --> ", JSON.stringify(userInfo));
            this.SocialSignUp("google",userInfo)
        } catch (error) {
            console.log("Message", error.message);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log("User Cancelled the Login Flow");
            } else if (error.code === statusCodes.IN_PROGRESS) {
                console.log("Signing In");
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                console.log("Play Services Not Available or Outdated");
            } else {
                console.log("Some Other Error Happened");
            }
        }
    };

    _fbAuth() {
        console.log("fbAuth+++++++>")
        if(LoginManager!==null){
            LoginManager.logOut()
        }
        LoginManager.logInWithPermissions(["email", "public_profile"]).then(
            (result) => {
                console.warn("result==", result)
                if (result.isCancelled) {
                    console.log("loging cancelled");
                } else {
                    AccessToken.getCurrentAccessToken().then(data => {
                        let accessToken = data.accessToken;
                        const responseInfoCallback = (error, result) => {
                            console.log("fbAuth++++++++++++>>>>>>"+JSON.stringify(result))
                            
                            if (error) {
                                console.log(error);
                                alert(
                                    "Error fetching data: " + error.toString()
                                );
                            } else {
                                console.log("123456jhbacj" + JSON.stringify(result));
                                this.SocialSignUp("facebook",result)
                            }
                        };
                        const infoRequest = new GraphRequest(
                            "/me", {
                                accessToken: data.accessToken,
                                parameters: {
                                    fields: {
                                        string: "email,name,first_name,middle_name,last_name"
                                    }
                                }
                            },
                            responseInfoCallback
                        );
                        new GraphRequestManager()
                            .addRequest(infoRequest)
                            .start();
                    });
                }
            },
            function(error) {
                console.log("An error occured: " + error);
            }
        );

    };

    SocialSignUp(type,userInfo){
        this.setState({isLoading:true},()=>{
            Utils.ApiPost(`${R.constants.Api.SocialSignup}${type}&name=${type=='google'?userInfo.user.givenName+userInfo.user.familyName:userInfo.first_name+userInfo.last_name}&email=${type=='google'?userInfo.user.email:userInfo.email}`,response=(data)=>{
                console.log('SocialSignup data=== '+type+'===>',JSON.stringify(data))
                if(data.res==200){
                    if(data.data.res_status=="success"){
                        this.getProfileDetails(type,data.data.user_id)
                    }
                    else if(data.data.res_status=="inactive"){
                        this.setState({isLoading:false})
                        this.signOut()
                        Toast.show("Your account is inactive, please contact customer care by visiting dadio.in",Toast.SHORT)
                    }
                }
            })
        })
    }

    getProfileDetails(type,id){

        Utils.ApiPost(`${R.constants.Api.basicInfo}${id}`,response =(data)=>{
            console.log("basicInfo service landing===>",data.data)

            if(data.res==200){
                if(data.data.res_status=="success"){
                    console.log("basicInfo service===>",data.data.profile_pic)
                    this.setState({isLoading:false},()=>{
                        if(data.data.profile_pic==""){
                            this.props.navigation.navigate("AfterSignUp",{"from":type,"data":data.data,"screen":1,"comeBack":this.comeBack.bind(this)})
                        }
                        else if(data.data.audio_file=="https://dadio.in/apps/uploads/"){
                            this.props.navigation.navigate("AfterSignUp",{"from":type,"data":data.data,"screen":2,"comeBack":this.comeBack.bind(this)})
                        }
                        else if(data.data.gender==""||data.data.age=="01/01/1995"){
                            this.props.navigation.navigate("AfterSignUp",{"from":type,"data":data.data,"screen":3,"comeBack":this.comeBack.bind(this)})
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

    
    
    render(){

        return(
            <View style={{flex:1}}>
                <View style={{flex:1,backgroundColor:'#fff'}}>
                        <Image
                            source={R.images.t1}
                            style={{position:'absolute',top:0,left:0 ,height:120,width:180,zIndex:5}}
                        />
                        <Image
                            source={R.images.t2}
                            style={{position:'absolute',bottom:0,right:0 ,height:120,width:180}}
                        />
                        <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                        <Image
                            source={R.images.logo}
                            style={{height:120,width:190}}
                        />
                        </View>
                        <View style={{flex:2,padding:20}}>
                            <Button btnPress={()=>this._navEmailLogin()} iconName={"user"} btnStyle={{backgroundColor:R.colors.lightBlue}} btnText={"User Login"}/>
                            <Button btnPress={()=>this._signIn()} iconName={"google"} btnStyle={{backgroundColor:R.colors.red}} btnText={"Login with Google"}/>
                            <Button btnPress={()=>this._fbAuth()} iconName={"facebook"} btnStyle={{backgroundColor:R.colors.blue}} btnText={"Login with Facebook"}/>
                            <View style={{justifyContent:'center',alignItems:'center'}}>
                                <TextView textStyle={{fontSize:12}} textValue={"Register or Login means you agree with the following"}/>
                                <TouchableOpacity>
                                    <TextView textStyle={{fontSize:12,color:R.colors.cyan}} textValue={"Terms & Conditions"}/>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                {this.state.isLoading&&
                    <View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                        <Loader/>
                    </View>
                }
            </View>
        )
    }
}