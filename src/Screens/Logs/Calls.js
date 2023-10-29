import React from 'react'
import {View,Text,FlatList, Image,TouchableOpacity} from 'react-native'
import R from 'res/R'
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';

// import Utils from 'res/Utils'


export default class Calls extends React.Component{
    constructor(){
        super()
        this.state=({
            entries:[]
        })
    }

    componentDidMount(){
        console.log("callData====this is call log>",this.props.data)
        this.setState({entries:this.props.data})

        // //
        // Utils.getData("userData",value=(data)=>{
        //     var userData = JSON.parse(data.value)
        // })
        // //
    }

    componentDidUpdate(prevProps) {
        if (prevProps.data !== this.props.data) {
          this.updateAndNotify();
        }
    }

    updateAndNotify(){
        this.setState({entries:this.props.data})
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
            <View style={{flex:1}} >
                <FlatList
                    ItemSeparatorComponent = { this.FlatListItemSeparator }
                    data={this.state.entries}
                    keyExtractor={(item, index) => String(index)}
                    renderItem={({item})=>{
                        return(
                            <View style={{padding:10,flexDirection:'row',alignItems:'center',justifyContent:"space-between"}}>
                               <View style={{flexDirection:'row',}}>
                                    <TouchableOpacity onPress={()=>this.props.profileNavigate(item.profile_id)}>
                                        <Image
                                            style={{height:45,width:45,borderRadius:50,borderWidth:2,borderColor:'#fff'}}
                                            source={{uri:item.profile_pic}}
                                        />
                                    </TouchableOpacity>
                                    <View style={{justifyContent:'center'}}>
                                        <Text style={{fontSize:16,fontWeight:'bold'}}>
                                            {item.display_name}
                                        </Text>
                                        <View style={{flexDirection:'row',alignItems:'center'}}>
                                            <Icon name={item.call_activity=="10"?"call-made":item.call_activity=="30"?"call-missed":"call-received"} size={14} color={item.call_activity=="10"?"lightgreen":item.call_activity=="30"?"red":"lightgreen"} />
                                            <Text style={{fontSize:12,marginHorizontal:5,color:'grey'}}>
                                                {item.call_time}
                                            </Text>
                                        </View>
                                    </View>
                                </View>
                                {item.block_call==10&&
                                    <TouchableOpacity style={{width:35}} onPress={()=>this.props.callClickHere(item)}>
                                        <Icon name="call" size={20} color="#000" />
                                    </TouchableOpacity>
                                }
                            </View>
                        )
                    }}
                />
            </View>
        )
    }
}