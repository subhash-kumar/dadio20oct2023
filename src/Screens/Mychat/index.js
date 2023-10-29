import React from 'react'
import {View,Text,FlatList,Dimensions,Image} from 'react-native'
import Header from 'comp/Header'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import moment from 'moment';
import { TouchableOpacity } from 'react-native-gesture-handler';

import Loader from 'comp/Loader'
import Utils from 'res/Utils'

export default class MyChat extends React.Component{
    constructor(){
        super()
        this.state=({
            entries:"",
            isLoading:true,
            nR:false
        })
    }

    goBack() {
        this.props.navigation.state.params.backFromBasicInfo();
        this.props.navigation.goBack();
    }

    componentDidMount(){
        Utils.getData("userData",value=(data)=>{
            var userData = JSON.parse(data.value)

            this.getProfileDetails(userData.user_id)
        })
        
    }

    getProfileDetails(user_id){
        console.log(user_id)
        Utils.ApiPost(`${R.constants.Api.myGifts}${user_id}`,response =(data)=>{
            console.log("my Gifts====>",data)
            if(data.res==200){
                if(data.data.res_status=="success"){
                    console.log("myGifts service===>",data.data)
                    this.setState({nR:false,entries:data.data.mygift_list,isLoading:false})                    
                }
                if(data.data.res_status=="no_gift"){
                    console.log("myGifts service===>",data.data)
                    this.setState({nR:true,entries:[],isLoading:false})                    
                }
            }
        })
    }

    FlatListItemSeparator = () => {
        return (
          <View
            style={{
              height: 1,
              marginHorizontal:20,
              backgroundColor: "lightgrey",
            }}
          />
        );
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <View style={{flex:1}}>
                    <Header backClick={()=>this.props.navigation.goBack(null)} title={"My Gift"}/>
                    {!this.state.nR&&<FlatList
                        style={{marginBottom:50}}
                        ItemSeparatorComponent = { this.FlatListItemSeparator }
                        data={this.state.entries}
                        keyExtractor={(item) => item.id}
                        renderItem={({item})=>{
                            return(
                                <TouchableOpacity onPress={()=>this.props.navigation.navigate("")} style={{flexDirection:'row',margin:10,paddingHorizontal:10}}>
                                    <View style={{flex:1,alignItems:'center',padding:10,margin:5,justifyContent:'center',backgroundColor: '#fff',elevation:5,borderRadius:10,}}>
                                        <Image
                                            style={{height:90,width:90,resizeMode:"contain"}}
                                            source={{uri:item.gift_image}}
                                        />
                                    </View>
                                    <View style={{flex:1.5,justifyContent:'space-evenly',marginHorizontal:10}}>
                                        <Text style={{fontWeight:'bold',color:"#232323",fontSize:16}}>
                                            {item.gift_name}
                                        </Text>
                                        <View flexDirection='row'>
                                            <Text style={{fontWeight:'bold',color:"#232323"}}>Gift Price: </Text>
                                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                                <Icon name="currency-inr" size={15} color="#232323"/>
                                                <Text style={{color:"#232323"}}>
                                                    {item.gift_price}
                                                </Text>
                                            </View>
                                        </View>
                                        <View flexDirection='row'>
                                            <Text style={{fontWeight:'bold',color:"#232323"}}>Gift Value: </Text>
                                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                                <Icon name="currency-inr" size={15} color="#232323"/>
                                                <Text style={{color:"#232323"}}>
                                                    {item.gift_value}
                                                </Text>
                                            </View>
                                        </View>
                                        <View flexDirection='row'>
                                            <Text style={{fontWeight:'bold',color:"#232323"}}>Buy Date: </Text>
                                            <View style={{flexDirection:'row',alignItems:'center'}}>
                                                <Text style={{color:"#232323"}}>
                                                    {moment(item.buy_date,'DD-MMM-YYYY').format('DD-MM-YY')}
                                                </Text>
                                            </View>
                                        </View>
                                        
                                    </View>
                                </TouchableOpacity>
                            )
                        }}
                    />}
                    {this.state.nR&&<View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
                            <Text style={{color:"#d3d3d3"}}>
                                No Records
                            </Text>
                        </View>
                    }
                </View>
                
                {this.state.isLoading&&<View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                    <Loader/>
                </View>}
            </View>
        )
    }
}