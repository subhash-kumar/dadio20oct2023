import React from 'react'
import {View,Text,TouchableOpacity} from 'react-native'
import Calls from './Calls'
import Messages from './Messages'
import R from 'res/R'

import Icon from 'react-native-vector-icons/MaterialIcons';

import Utils from 'res/Utils'
import Loader from 'comp/Loader'
import ScrollableTabView, { ScrollableTabBar } from 'react-native-scrollable-tab-view';

export default class Logs extends React.Component{
    constructor(props){
        super(props)
        this.state=({
            selTab: 1,
            isLoading:true,
            user_id:'',
            callLogData:[]
        })
        // alert(JSON.stringify(this.props.logTab))
    }

    messageClickChild(data){
        this.props.onMessageClick(data)
    }
    

    callClickChild(data){
        this.props.onCallClick(data)
        // this.props.navigation.push('Call',{"type":"outgoing","callDetails":data,"backFromCall":this.backFromCall.bind(this) })

    }
    
    componentDidMount(){
        // this.props.onLoad()
        Utils.getData("userData",value=(data)=>{
            var userData = JSON.parse(data.value)
        })
        if(this.props.selectTab == 2)
{
      setTimeout(() => {
        this.tabView.goToPage(this.props.selectTab - 1)
        this.props.logTab(this.props.selectTab)
      }, 300);
    }
    }
    paginateLog(data){
        console.log("pageNum===log===>",data)
        this.props.paginateParent(data)
    }
        ///Rohit uncomment///
    // renderTab(){
    //     if(this.state.selTab==1){
    //         return(
    //             <View style={{flex:1}}>
    //                 <Messages 
    //                     nRChild={this.props.noResult}
    //                     data={this.props.logMessageData} 
    //                     messageClickHere={(data)=>this.messageClickChild(data)} 
    //                     paginate={(data)=>this.paginateLog(data)}
    //                     profileNavigate={(data)=>this.props.onProfileClick(data)}
    //                 />
    //             </View>
    //         )
    //     }
    //     if(this.state.selTab==2){
    //         return(
    //             <View style={{flex:1}}>
    //                 <Calls 
    //                     data={this.props.logData} 
    //                     callClickHere={(data)=>this.callClickChild(data)}
    //                     profileNavigate={(data)=>this.props.onProfileClick(data)}                        
    //                     />
    //             </View>
    //         )
    //     }
    // }

    ////Rohit un comment

    tabchange(){
        // console.log("tabChange=====>",data)
        // this.setState({selTab:data},()=>{
            this.tabView.goToPage(this.state.selTab-1)
            this.props.logTab(this.state.selTab)
        // })

    }

    tabSwipe(event){
        this.setState({selTab:event.i+1},()=>{
            // this.tabView.goToPage(event.i+1)
            this.props.logTab(event.i+1)
        })
        console.log("current page",event.i)
    }

    render(){
        return(
            <View style={{flex:1}}>
                
                {/* {this.renderTab()} */}
                <ScrollableTabView
                    // prerenderingSiblingsNumber={Infinity}
                    
                    onChangeTab={(event)=>this.setState({selTab:event.i+1},()=>this.props.logTab(event.i+1))}
                    ref={(tabView) => { this.tabView = tabView; }}
                    renderTabBar={() => {
                        return(
                            <View style={{height:50,backgroundColor:'lightgrey',flexDirection:'row',marginVertical:10,marginHorizontal:15,borderRadius:20}}>
                                <TouchableOpacity onPress={()=>this.setState({selTab:1},()=>this.tabchange())} style={{alignItems:'center',justifyContent:'space-between',flexDirection:'row',paddingHorizontal:15,zIndex:this.state.selTab==1?5:0,marginRight:-5,flex:1,borderRadius:20,backgroundColor:this.state.selTab==1?"#232323":"lightgrey"}}>
                                    <Text style={{color:'#fff',fontSize:16,marginStart:10,fontWeight:'bold'}}>
                                        Chats
                                    </Text>
                                    <Icon name="message" size={20} color="#fff" />
                                </TouchableOpacity>
                                <TouchableOpacity onPress={()=>this.setState({selTab:2},()=>this.tabchange())} style={{alignItems:'center',justifyContent:'space-between',flexDirection:'row',paddingHorizontal:15,zIndex:this.state.selTab==2?5:0,marginLeft:-5,flex:1,borderRadius:20,backgroundColor:this.state.selTab==2?"#232323":"lightgrey"}}>
                                    <Text style={{color:'#fff',fontSize:16,marginStart:10,fontWeight:'bold'}}>
                                        Calls
                                    </Text>
                                    <Icon name="call" size={20} color="#fff" />
                                </TouchableOpacity>
                            </View>
                        )  
                    }                 
                    }>
                    <Messages 
                        nRChild={this.props.noResult}
                        data={this.props.logMessage} 
                        messageClickHere={(data)=>this.messageClickChild(data)} 
                        paginate={(data)=>this.paginateLog(data)}
                        profileNavigate={(data)=>this.props.onProfileClick(data)}
                    />
                    <Calls 
                        data={this.props.logCall} 
                        callClickHere={(data)=>this.callClickChild(data)}
                        profileNavigate={(data)=>this.props.onProfileClick(data)}                        
                    />
                </ScrollableTabView>
            </View>
        )
    }
}

const TopBar =({
    btnPress,
    selTabC
})=>{
    return(
        <View style={{height:50,backgroundColor:'lightgrey',flexDirection:'row',marginVertical:10,marginHorizontal:15,borderRadius:20}}>
            <TouchableOpacity onPress={()=>btnPress(1)} style={{alignItems:'center',justifyContent:'space-between',flexDirection:'row',paddingHorizontal:15,zIndex:selTabC==1?5:0,marginRight:-5,flex:1,borderRadius:20,backgroundColor:selTabC==1?"#232323":"lightgrey"}}>
                <Text style={{color:'#fff',fontSize:16,marginStart:10,fontWeight:'bold'}}>
                    Chats
                </Text>
                <Icon name="message" size={20} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>btnPress(2)} style={{alignItems:'center',justifyContent:'space-between',flexDirection:'row',paddingHorizontal:15,zIndex:selTabC==2?5:0,marginLeft:-5,flex:1,borderRadius:20,backgroundColor:selTabC==2?"#232323":"lightgrey"}}>
                <Text style={{color:'#fff',fontSize:16,marginStart:10,fontWeight:'bold'}}>
                    Calls
                </Text>
                <Icon name="call" size={20} color="#fff" />
            </TouchableOpacity>
        </View>
    )
}