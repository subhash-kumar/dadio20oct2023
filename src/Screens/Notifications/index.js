import React from 'react'
import {View,Text,FlatList,Image,TouchableOpacity} from 'react-native'
import Utils from 'res/Utils'
import R from 'res/R'
import Header from 'comp/Header'

export default class Notifications extends React.Component{
    constructor(){
        super()
        this.state=({
            notification_list:""
        })
    }

    componentDidMount(){
        this._retriveData()
    }

    _retriveData = async() =>{
        await Utils.getData("userData",value=(data)=>{
            var userData = JSON.parse(data.value)
            this._getNotificationList(userData.user_id)
        })
    }

    _getNotificationList(user_id){
        Utils.ApiPost(`${R.constants.Api.notificationList}${user_id}`,response=(data)=>{
            // console.log("notificationList===>",data.data.notification_list)
            this.setState({notification_list:data.data.notification_list})
        })
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor: '#fff',}}>
                <Header backClick={()=>this.props.onGoBack()} title={"Notification"}/>
                <FlatList
                    data={this.state.notification_list}
                    keyExtractor={(item,index) => String(index) }
                    renderItem={({item})=>{
                        return(
                            <View style={{width:'100%',flexDirection:'row',alignItems:'center',margin: 10,}}>
                                <TouchableOpacity onPress={()=>this.props.onProfileClick(item.profile_id)} style={{flex:1}}>
                                    <Image
                                        source={{uri:item.profile_pic}}
                                        style={{height:50,width:50,borderRadius:50}}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this.props.onProfileClick(item.profile_id)} style={{flex:3,flexDirection:'row',padding:10}} >
                                    <Text numberOfLines={2} style={{color:'#232323'}}>
                                        {item.notification_msg}
                                    </Text>
                                   
                                </TouchableOpacity>
                                <View style={{flex:2}}>
                                    <Text style={{color:'grey'}}>
                                        {item.notification_date}
                                    </Text>
                                </View>
                            </View>
                        )
                    }}
                />
            </View>
        )
    }
}