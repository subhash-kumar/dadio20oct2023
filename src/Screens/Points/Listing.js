import React from 'react'
import {View,FlatList,Text} from 'react-native'
import Utils from 'res/Utils'
import R from 'res/R'
import Header from 'comp/Header'
import Loader from 'comp/Loader'

export default class Listing extends React.Component{
    constructor(){
        super()
        this.state=({
            isLoading:true,
            user_id:"",
            type:'',
            headerName:"",
            api:"",
            ListingData:{},
            nR:false
        })
    }
    componentDidMount(){
        Utils.getData("userData",value=(data)=>{
            var userData = JSON.parse(data.value)
            this.setState({user_id:userData.user_id,type:this.props.navigation.getParam('type')},()=>{
                if(this.state.type=="earned"){
                    this.setState({headerName:'Earned Points',api:0},()=>this.getListing())
                }
                if(this.state.type=="spent"){
                    this.setState({headerName:'Spend Points',api:1},()=>this.getListing())
                }
                if(this.state.type=="log"){
                    this.setState({headerName:'Payout Log',api:2},()=>this.getListing())
                }
                
            })
        }) 
    }

    componentWillUnmount(){
        this.setState({ListingData:{}})
    }

    getListing(){
        Utils.ApiPost(`${this.state.api==0?R.constants.Api.earned:this.state.api==1?R.constants.Api.spend:this.state.api==2?R.constants.Api.payoutLog:null}${this.state.user_id}`,response=(data)=>{
            console.log(`${this.state.api+ `====>`+this.state.user_id},   ====>`,JSON.stringify(data))
            // alert(JSON.stringify(data));
            if(data.res==200){
                if(data.data.res_status=="success"){
                    this.setState({nR:false,ListingData:this.state.api==0?data.data.earn_list:this.state.api==1?data.data.spend_list:this.state.api==2?data.data.earn_list:null,isLoading:false})
                }
                if(data.data.res_status=="no_data"){
                    this.setState({nR:true,ListingData:[],isLoading:false})
                }
            }
        })
    }

    goBack(){
        this.props.navigation.goBack(null)
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
    
    renderEarned(item){
        return(
            <View style={{padding:10,margin:5,backgroundColor:'#fff',elevation:5}} >
                <Text  style={{fontWeight:'bold'}}>
                    Points : <Text  style={{fontWeight:'100'}}>{item.item.add_points}</Text>
                </Text>
                <Text style={{fontWeight:'bold'}}>
                    Date : <Text style={{fontWeight:'100'}}>{item.item.add_date}</Text>
                </Text>
                
                {item.item.payment_type=="Call Received"&&
                    <View style={{}}>
                        <Text style={{fontWeight:'bold'}}>
                            Payment Type : <Text style={{fontWeight:'100'}}>{item.item.payment_type}</Text>
                        </Text>
                        {item.item.duration!==""&&<Text style={{fontWeight:'bold'}}>
                            Duration : <Text style={{fontWeight:'100'}}> {item.item.duration} Secs </Text> 
                        </Text>}
                        <Text style={{fontWeight:'bold'}}>
                            Voice Call : <Text style={{fontWeight:'100'}}>{item.item.byuser}</Text>
                        </Text>
                    </View>
                }
                {
                    item.item.payment_type=="Online"&&
                        <View>
                            <Text style={{fontWeight:'bold'}}>
                                Payment Type : <Text style={{fontWeight:'100'}}>{item.item.payment_type}</Text>
                            </Text>
                            
                        </View>
                }
                {/* for Chat */}
                {(item.item.spend_type=="Chat Subscription")&&<View>
                        <Text  style={{fontWeight:'bold'}}>
                            Chat Subscription 
                        </Text>
                    </View>
                    
                }
                {
                    item.item.payment_type=="Gift"&&
                        <View>
                            <Text style={{fontWeight:'bold'}}>
                                Payment Type : <Text style={{fontWeight:'100'}}>{item.item.payment_type}</Text>
                            </Text>
                            <Text style={{fontWeight:'bold'}}>
                                Gift From : <Text style={{fontWeight:'100'}}>{item.item.byuser}</Text>
                            </Text>
                        </View>
                }
                
                {item.item.payment_notes!==""&&<Text style={{fontWeight:'bold'}}>
                    Payment Notes :<Text style={{fontWeight:'100'}}> {item.item.payment_notes}</Text>
                </Text>}
                
                
            </View>
        )
    }

    // renderChatSubscription(item){
    //     return(
    //         <View style={{padding:10,margin:5,backgroundColor:'#fff',elevation:5}} > 
    //             <Text>{(item.item.s)}</Text>
    //         </View>
    //     );
    // }



    renderSpend(item){
        return(
            <View style={{padding:10,margin:5,backgroundColor:'#fff',elevation:5}} >
                {(item.item.spend_type=="Payout"||item.item.spend_type=="Buy Gift")&&<View>
                        <Text  style={{fontWeight:'bold'}}>
                            Payment Type : <Text  style={{fontWeight:'100'}}>{item.item.spend_type}</Text>
                        </Text>
                    </View>
                }
                {(item.item.spend_type=="Voice Call"||item.item.spend_type=="Recording Sent")&&<View>
                        <Text  style={{fontWeight:'bold'}}>
                            {item.item.spend_type=="Voice Call"?"Voice Call":"Recording Sent"} : <Text  style={{fontWeight:'100'}}>{item.item.byprofile}</Text>
                        </Text>
                        <Text  style={{fontWeight:'bold'}}>
                            Duration : <Text  style={{fontWeight:'100'}}>{item.item.duration} Secs</Text>
                        </Text>
                    </View>
                }
                {/* Editing for the chat  */}
                 {(item.item.spend_type=="Chat Subscription")&&<View>
                        <Text  style={{fontWeight:'bold'}}>
                            Chat Subscription 
                        </Text>
                    </View>
                    
                }
                <Text  style={{fontWeight:'bold'}}>
                     Spend Points : <Text  style={{fontWeight:'100'}}>{item.item.spend_point}</Text>
                </Text>
                <Text style={{fontWeight:'bold'}}>
                    Date : <Text style={{fontWeight:'100'}}>{item.item.spend_date}</Text>
                </Text>
            </View>
        )
    }

    renderLog(item){
        return(
            <View  style={{padding:10,margin:5,backgroundColor:'#fff',elevation:5}} >
                <Text  style={{fontWeight:'bold'}}>
                    Points : <Text  style={{fontWeight:'100'}}>{item.item.points}</Text>
                </Text>
                <Text style={{fontWeight:'bold'}}>
                    Payment Mode : <Text style={{fontWeight:'100'}}>{item.item.payment_mode}</Text>
                </Text>
                {
                    item.item.payment_mode=="Paytm"&&
                        <View>
                            <Text  style={{fontWeight:'bold'}}>
                                Paytm Number : <Text  style={{fontWeight:'100'}}>{item.item.paytm_number}</Text>
                            </Text>
                        </View>
                }
                {/* for the chat */}
                {(item.item.spend_type=="Chat Subscription")&&<View>
                        <Text  style={{fontWeight:'bold'}}>
                            Chat Subscription 
                        </Text>
                    </View>
                    
                }

                {
                    item.item.payment_mode=="Bank Account"&&
                        <View>
                            <Text  style={{fontWeight:'bold'}}>
                                Bank Name : <Text  style={{fontWeight:'100'}}>{item.item.bank_name}</Text>
                            </Text>
                            <Text  style={{fontWeight:'bold'}}>
                                IFSC code : <Text  style={{fontWeight:'100'}}>{item.item.ifsc_code}</Text>
                            </Text>
                            <Text  style={{fontWeight:'bold'}}>
                                Account Holder : <Text  style={{fontWeight:'100'}}>{item.item.account_holdername}</Text>
                            </Text>
                            <Text  style={{fontWeight:'bold'}}>
                                Account number : <Text  style={{fontWeight:'100'}}>{item.item.account_number}</Text>
                            </Text>
                        </View>
                }
                {item.item.notes!==""&&<Text style={{fontWeight:'bold'}}>
                    Payment Notes :<Text style={{fontWeight:'100'}}> {item.item.notes}</Text>
                </Text>}
                <Text  style={{fontWeight:'bold'}}>
                    Status : <Text  style={{fontWeight:'100'}}>{item.item.status}</Text>
                </Text>
            </View>
        )
    }

    render(){
        return(
            <View style={{flex:1,backgroundColor:'#fff'}}>
                <Header backClick={()=>this.goBack()} title={this.state.headerName}/>
                {this.state.isLoading&&
                    <View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                        <Loader/>
                    </View>
                }
                {
                    !this.state.isLoading&&
                        <View style={{flex:1}}>
                             {!this.state.nR&&<FlatList
                                data={this.state.ListingData}
                                ItemSeparatorComponent = { this.FlatListItemSeparator }
                                keyExtractor={(item, index) => String(index)}
                                renderItem={(item)=>{
                                    return(
                                        <View>
                                            {
                                                this.state.api==0?this.renderEarned(item):
                                                this.state.api==1?this.renderSpend(item):
                                                this.state.api==2?this.renderLog(item):
                                                null
                                            }
                                                {/* this.renderChatSubscription(); */}
                                        </View>
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
                        
                        
                }
            </View>
        )
    }
}