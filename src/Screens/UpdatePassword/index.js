import React from 'react'
import {View,Text,TouchableOpacity} from 'react-native'
import Toast from "react-native-simple-toast";
import Loader from 'comp/Loader'
import Utils from 'res/Utils'
import Header from 'comp/Header'
import TextInputView from 'comp/TextInputView'
import R from 'res/R'

export default class UpdatePassword extends React.Component{
    constructor(){
        super()
        this.state=({
            user_id:'',
            isLoading:false,
            newPassword:'',
            confirmPassword:''
        })
    }

    componentDidMount(){
        this._retriveData()
    }

    _retriveData(){
        Utils.getData("userData",value=(data)=>{
            var userData = JSON.parse(data.value)
            this.setState({user_id:userData.user_id})
        })
        
    }


    validateData(){
        if(this.state.newPassword.trim()==""){
            Toast.show("Please enter new password.",Toast.SHORT)
        }
        else if(this.state.confirmPassword.trim()==""){
            Toast.show("Please confirm your password.",Toast.SHORT)
        }
        else if(this.state.newPassword.trim()!==this.state.confirmPassword.trim()){
            Toast.show("Password do not match.",Toast.SHORT)
        }
        else{
            let obj ={}
            obj.new_password=this.state.newPassword
            this.PostFormData(`${R.constants.Api.savePassword}${this.state.user_id}`, obj)
        }
    }

    PostFormData(url, param) {
        this.setState({ isLoading: true })
        let formBody = [];
        for (let property in param) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue = encodeURIComponent(param[property]);
            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        console.log("form body===>", formBody)
        fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'

            },
            body: formBody
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.res_status === "success") {
                    this.setState({isLoading:false},()=>{
                        Toast.show("Password updated sucessfully",Toast.SHORT)
                        this.props.navigation.goBack(null)
                    }) 
                } else {
                    this.setState({ isLoading: false },()=>
                        Toast.show("Password not saved",Toast.SHORT)
                    )
                }
                console.log("responseJson====>", responseJson)
            })
            .catch((error) => {
                console.log(error);
            });

    }


    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                {this.state.isLoading&&<View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                    <Loader/>
                </View>}
                {!this.state.isLoading&&
                    <View style={{flex:1}}>
                        <Header backClick={()=>this.props.navigation.goBack(null)} title={"Update Password"}/>
                        <View style={{paddingVertical:20,flex:1}}>
                            <TextInputView
                                title={"New Password"}
                                placeholder={"Enter New Password"}
                                textValue={this.state.newPassword}
                                onChangeValue={(text)=>this.setState({newPassword:text})}
                                keyboardType={"default"}
                                passwordField={true}
                            />
                            <TextInputView
                                title={"Confirm Password"}
                                placeholder={"Enter Confirm Password"}
                                textValue={this.state.confirmPassword}
                                onChangeValue={(text)=>this.setState({confirmPassword:text})}
                                keyboardType={"default"}
                                passwordField={true}
                            />
                            <View style={{position: 'absolute',bottom:0,left:0,right:0,padding:20,marginBottom:20}}>
                                <TouchableOpacity onPress={()=>this.validateData()} style={{height:50,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#232323'}}>
                                    <Text style={{fontSize:16,paddingHorizontal:5,color:'#fff'}}>
                                        UPDATE
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                }
            </View>
        )
    }
}