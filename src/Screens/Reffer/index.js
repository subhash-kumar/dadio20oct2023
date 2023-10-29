import React from 'react'
import {View,Text,Image,StyleSheet,Linking } from 'react-native'
import Header from 'comp/Header'
import R from 'res/R'
import Button from 'comp/Button'

export default class Reffer extends React.Component{
    constructor(){
        super()
        this.state=({
            userInfo:""
        })
    }
    componentDidMount(){
        this.setState({userInfo:this.props.navigation.getParam("details")},()=>console.log("========>",this.state.userInfo))
    }

    shareToWhatsApp = async() => {
        Linking.openURL(`whatsapp://send?text=Get a free diamonds for voice calling and buy gift on Dadio, India's no.1 dating app.  ${"\n"+this.state.userInfo.mycode+"\n"}https://dadio.in/apps/invite-referral.php?code=${this.state.userInfo.mycode}`);
    }
    goBack() {
        this.props.navigation.goBack(null);
    }
    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Header backClick={()=>this.goBack()} title={"Refer & Earn"}/>
                <View style={{flex:1,margin:20,alignItems:'center'}}>
                    <View style={{padding:5,borderWidth:StyleSheet.hairlineWidth,borderRadius:100,zIndex:5}}>
                        <Image
                            source={{uri:this.state.userInfo.profile_pic}}
                            style={{height:100,width:100,resizeMode:"cover",borderRadius:100}}
                        />
                    </View>
                    <View style={{width:"100%",borderWidth:StyleSheet.hairlineWidth,alignItems:"center",paddingTop:70,marginTop:-50}}>
                        <Text style={{color:R.colors.cyan,fontSize:16}}>
                            YOUR INVITE CODE
                        </Text>
                        <Text style={{fontSize:18,color:R.colors.red,margin: 10,}}>
                            {this.state.userInfo.mycode}
                        </Text>
                        <Text style={{margin: 10,}}>
                            Kick Of your friend's Dadio Journey
                        </Text>
                        <Text style={{margin: 10,textAlign:'center'}}>
                            Send this invite code to your friend & earn free Dadio points as referral benefits
                        </Text>
                    </View>
                </View>
                <View style={{height:80}}>
                    <Button btnPress={() => this.shareToWhatsApp()} iconName={"whatsapp"} btnStyle={{ backgroundColor: "#4AC959", flex: 1 }} btnText={"Share On WhatsApp"} />
                </View>
            </View>
        )
    }
}