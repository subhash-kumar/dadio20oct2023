import React from 'react'
import {View,Text,TouchableOpacity,Dimensions,Image} from 'react-native'
import Header from 'comp/Header'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialIcons';
import Utils from 'res/Utils'
import Toast from "react-native-simple-toast";

export default class PrivacyControls extends React.Component{
    constructor(){
        super()
        this.state=({
            call:false,
            chat:false
        })
    }
    goBack() {
        this.props.navigation.state.params.backFromBasicInfo();
        this.props.navigation.goBack();
    }
    componentDidMount(){
        this.setState({
            call:this.props.navigation.getParam('details').random_call=="10"?true:false,
            chat:this.props.navigation.getParam('details').random_chat=="10"?true:false,
        })
    }

    updatePrivacy(){
        Utils.ApiPost(`${R.constants.Api.updatePrivacy}${this.props.navigation.getParam('details').user_id}&random_call=${this.state.call?"10":"20"}&random_chat=${this.state.chat?"10":"20"}`,response=(data)=>{
            if(data.res==200){
                if(data.data.res_status=="success"){
                    Toast.show("Privacy updated sucessfully.",Toast.SHORT)
                    this.goBack()
                }
            }
            else{
                // this.setState({isLoading:false})
                Toast.show("please check your internet.",Toast.SHORT)
            }
            

        })
    }

    render(){
        return(
            <View>
                <Header backClick={()=>this.goBack()} title={"Privacy Controls"}/>
                <View style={{padding:20}}>
                    <Text style={{fontSize:18,fontWeight:'bold',padding:5,color:'#232323'}}>
                        Available for Random Call
                    </Text>
                    <View style={{flexDirection:'row',alignItems:'center',padding:5}}>
                        <TouchableOpacity onPress={()=>this.setState({call:!this.state.call})}>
                            <Icon name={this.state.call?"check-box":"check-box-outline-blank"} size={25} color="#232323"/>
                        </TouchableOpacity>
                        <Text style={{fontSize:16,paddingHorizontal:5,color:'#232323'}}>
                            Available
                        </Text>
                    </View>
                </View>
                <View style={{padding:20}}>
                    <Text style={{fontSize:18,fontWeight:'bold',padding:5,color:'#232323'}}>
                        Available for Chat with Unmatched Person
                    </Text>
                    <View style={{flexDirection:'row',alignItems:'center',padding:5}}>
                        <TouchableOpacity onPress={()=>this.setState({chat:!this.state.chat})}>
                            <Icon name={this.state.chat?"check-box":"check-box-outline-blank"} size={25} color="#232323"/>
                        </TouchableOpacity>
                        <Text style={{fontSize:16,paddingHorizontal:5,color:'#232323'}}>
                            Available
                        </Text>
                    </View>
                </View>
                <View style={{paddingHorizontal:20,paddingVertical:30}}>
                    <TouchableOpacity onPress={()=>this.updatePrivacy()} style={{height:50,borderRadius:10,alignItems:'center',justifyContent:'center',backgroundColor:'#232323'}}>
                        <Text style={{fontSize:16,paddingHorizontal:5,color:'#fff'}}>
                            UPDATE
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>
        )
    }
}