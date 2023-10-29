import React from 'react'
import {View,Text} from 'react-native'
import UploadImage from './UploadImage'
import SelectGender from './SelectGender'
import SelectAge from './SelectAge'
import UploadRecording from './UploadRecording'

import R from 'res/R'

import Utils from 'res/Utils'
import Toast from "react-native-simple-toast";
import Loader from 'comp/Loader'

export default class AfterSignUp extends React.Component{

    constructor(){
        super()
        this.state=({
            screen:1,
            age:"",
            isLoading:false
        })
    }

    componentDidMount(){
        this.SwitchScreen(this.props.navigation.getParam("screen"))
    }

    SwitchScreen(id){
        this.setState({screen:id})
    }

    getValue(type,data){
        console.log(type+"=====>"+data)
        if(type=="gender"){
            this.setState({gender:data,screen:4})
        }
        if(type=="age"){
            this.setState({age:data},()=>{this.updateGenderAndAge()})
        }
    }

    updateGenderAndAge(){
        this.setState({isLoading:true})
        console.log(`${R.constants.Api.updateGenAndAge}${this.props.navigation.getParam("data").user_id}&gender=${this.state.gender}&age=${this.state.age}`)
        Utils.ApiPost(`${R.constants.Api.updateGenAndAge}${this.props.navigation.getParam("data").user_id}&gender=${this.state.gender}&age=${this.state.age}`,response =(data)=>{
            if(data.res==200){
                if(data.data.res_status=="success"){
                    console.log("updateGenAndAge service===>",data.data)
                    this.getProfileDetails()
                }
            }
        })
    }

    getProfileDetails(){
        Utils.ApiPost(`${R.constants.Api.basicInfo}${this.props.navigation.getParam("data").user_id}`,response =(data)=>{
            if(data.res==200){
                if(data.data.res_status=="success"){
                    console.log("basicInfo service===>",data.data)
                    Utils.storeData("userData",JSON.stringify(data.data))
                    Toast.show("SignUp Successful!",Toast.SHORT)
                    this.props.navigation.state.params.comeBack("signUp",this.props.navigation.getParam("from"));
                    this.props.navigation.goBack(null)
                }
            }
        })
    }
    

    render(){
        return(
            <View style={{flex:1}}>
                <View style={{padding:20,backgroundColor:'#fff',elevation:5}}>
                    <Text style={{fontSize:16}}>
                        {this.state.screen==1?"Upload Profile Image":"Select Gender"}
                    </Text>
                </View>
                {this.state.screen==1&&<UploadImage userId={this.props.navigation.getParam("data").user_id} UploadClick={this.SwitchScreen.bind(this)}/>}
                {this.state.screen==2&&<UploadRecording userId={this.props.navigation.getParam("data").user_id} UploadClick={this.SwitchScreen.bind(this)}/>}
                {this.state.screen==3&&<SelectGender userId={this.props.navigation.getParam("data").user_id} UploadClick={this.getValue.bind(this)}/>}
                {this.state.screen==4&&<SelectAge userId={this.props.navigation.getParam("data").user_id} UploadClick={this.getValue.bind(this)} />}
                {this.state.isLoading&&
                    <View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                        <Loader/>
                    </View>
                }
            </View>
        )
    }
}