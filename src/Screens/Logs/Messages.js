import React from 'react'
import {View,Text,FlatList,TouchableOpacity, Image,ActivityIndicator} from 'react-native'
import R from 'res/R'
import moment from 'moment';

export default class Messages extends React.Component{
    constructor(){
        super()
        this.state=({
            entries:[],
            pageNum:0,
            refreshing:false,
            noRes:false
        })
    }

    componentDidMount(){
        console.log("callData====>",this.props.data)
        this.setState({entries:this.props.data})
    }

    componentDidUpdate(prevProps) {
        // console.log("nrChild=====>",this.props.nRChild)

        if (prevProps.data !== this.props.data) {
          this.updateAndNotify();
        }
        if(prevProps.nRChild !==this.props.nRChild){
            this.setState({noRes:this.props.nRChild})
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

    _handleLoadMore = () => {
        // console.warn(this.state.noResults)
        if(!this.state.noRes){
            this.setState(
            (prevState, nextProps) => ({
                pageNum: prevState.pageNum + 1,
                refreshing: true
            }),
                () => {
                    console.log(this.state.pageNum)
                    this.props.paginate(this.state.pageNum)
                    setTimeout(()=>{this.setState({refreshing:false})},2000)
                }
            );
        }
    };

    renderFooter =()=>{
        if(this.state.refreshing){
            return (
                <View style={{height:30,marginVertical:10}} >
                    <ActivityIndicator style={{height:'100%',width:'100%'}} size={'large'} color={'red'} />
                </View>
            )
        }
    };
      
    render(){
        return(
            <View style={{flex:1}} >
                <FlatList
                    ItemSeparatorComponent = { this.FlatListItemSeparator }
                    data={this.state.entries}
                    keyExtractor={(item, index) => String(index)}
                    ListFooterComponent={this.renderFooter()}
                    refreshing={this.state.refreshing}
                    onEndReached={this._handleLoadMore}
                    onEndReachedThreshold={0.0001}
                    renderItem={({item})=>{
                        return(
                            <View  style={{padding:10,flexDirection:'row',alignItems:'center',flexDirection:'row'}}>
                                <View style={{paddingHorizontal:10,}}>
                                    <TouchableOpacity onPress={()=>this.props.profileNavigate(item.profile_id)}>
                                        <Image
                                            style={{height:45,width:45,borderRadius:50,borderWidth:2,borderColor:'#fff'}}
                                            source={{uri:item.profile_pic}}
                                        />
                                    </TouchableOpacity>
                                    {
                                        item.unread_msg!=="0" &&
                                            <View style={{position:'absolute',bottom:3,right:4,backgroundColor:R.colors.cyan,paddingHorizontal:5,borderColor:'#fff',borderRadius:10,borderWidth:1}}>
                                                <Text style={{fontSize:12,color:'#fff'}}>
                                                    {item.unread_msg}
                                                </Text>
                                            </View>
                                    }
                                </View>
                                <TouchableOpacity onPress={()=>{this.setState({pageNum:0},()=>this.props.messageClickHere(item))}} style={{flex:4,justifyContent:'center'}}>
                                    <Text style={{fontSize:16,fontWeight:'bold'}}>
                                        {item.display_name}
                                    </Text>
                                    <Text numberOfLines={1} style={{fontSize:12}}>
                                        {item.msg_text}
                                    </Text>
                                </TouchableOpacity>
                                <Text style={{flex:1,fontSize:12,marginHorizontal:5,color:'grey'}}>
                                    {item.msg_time}
                                </Text>

                            </View>
                        )
                    }}
                />
            </View>
        )
    }
}