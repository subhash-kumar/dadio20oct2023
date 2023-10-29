import React from 'react';
import {ImageBackground,View, Text, TouchableOpacity, Dimensions, Image,FlatList ,ScrollView,BackHandler} from 'react-native';
import Header from 'comp/Header'
import R from 'res/R';
// import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Icon from 'react-native-vector-icons/FontAwesome';
import RadioButton from 'react-native-vector-icons/MaterialCommunityIcons';
import TextInputView from 'comp/TextInputView';
import Loader from 'comp/Loader';
import Toast from 'react-native-simple-toast';
import { Alert } from 'react-native';
import Utils from 'res/Utils';
import { color } from 'react-native-reanimated';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

const colors = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
const textcolors = ['#0a1931', '#e1701a', '#583d72', '#ff6701'];

export default class ChatPaid extends React.Component {
  constructor() {
    super();
    this.state = {
      entries:[],
      user_id:'',
      package_id:'',
      package_price:'',
      nR:false,
      isLoading:true,
      
     };
   }
        componentDidMount() {
          // Using the backhandler?
          // this.backHandler = BackHandler.addEventListener(
          //   "hardwareBackPress",
          //   this.gobackChatScreen
          // );

          Utils.getData(
            'userData',
            (value = (data) => {
              // alert(JSON.stringify(data))
              var userData = JSON.parse(data.value);
              // alert(JSON.stringify(userData.mycode))
              this.setState({user_id: userData.user_id}, () => this.getpakages());
            }),
          );
      }

      // componentWillUnmount() {
      //   this.backHandler.remove();
      // }


      getdata(user){
        console.log("+++++++++++++++++"+JSON.stringify(user));
        this.props.navigation.navigate('BuyChat',{
          // data: JSON.stringify(user),
          // packageid:JSON.stringify(user.package_id),
          packageid:(user.package_id),
          packageName:(user.package_name),
          packageValidity:(user.package_validity),  
          packagePrice:(user.package_price),  
          userId:this.state.user_id,
        })
        // this.props.navigation.navigate('OnlineUser',{
        //   userId:this.state.user_id,
        // })

      }
      getpakages(){ 
      // Utils.ApiPost(`${R.constants.Api.chatPackage}${this.state.user_id}`,
      Utils.ApiPost(`${R.constants.Api.chatPackage}${this.state.user_id}`,
      (response=(data)=> {
        // alert(JSON.stringify(data));
        console.log('chatPay=====>',JSON.stringify(data.data));
        if(data.res==200){
            if(data.data.res_status=="success"){
              // alert("i ma in sucess")
              // alert(JSON.stringify(data.data))
                this.setState({
                  entries: data.data.package_list,
                  isLoading:false,
                });
                // alert(JSON.stringify(dataSource))
                console.log(this.state.entries);
            }
            if(data.data.res_status == 'no_data'){
              this.setState({nR:true , entries: [] , isLoading: false});
            }
        }
    }),
    );
    }
      gobackChatScreen=()=>{
        console.log("This is working ");
        this.props.navigation.navigate('OnlineUser');
      }
      goBack=()=>{
        // this.props.navigation.state.params.backFromChatScreen("messageList","");
        this.props.navigation.goBack();
        // this.props.navigation.navigate('ChatScreen');
      }

            render(){
              const { entries} = this.state; 
              return(
                    <View style={{flex:1,backgroundColor:'#fff'}}>
                      <Header 
                        title="Chat Subscription"
                        // style={{flex:1,elevation:0}}
                        backClick={()=>this.goBack()}
                      />
                      {this.state.isLoading && (
                            <View
                              style={{
                                zindex: 1,
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                position: 'absolute',
                                height: '100%',
                                width: '100%',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}>
                              <Loader />
                            </View>
                          )}
                      {!this.state.isLoading && (
                          <View style={{flex: 1}}>
                              {this.state.nR && (
                                <View
                                    style={{
                                    flex: 1,
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    }}>
                                    <Text style={{color: '#d3d3d3'}}>No Records</Text>
                                </View>
                              )}
                              {!this.state.nR &&(
                                // <View style={{backgroundColor:'#ffffff',width:windowWidth*0.9,margin:10,borderRadius:20,alignItems:'center',justifyContent:'space-evenly'}}>
                                  <ScrollView  style={{flex:1,marginBottom:30,}}>
                                        {
                                        entries.map((user,i)=>(
                                            <View key={user.package_id} style={{padding:10}}>
                                                <View  style={{backgroundColor:colors[i],marginLeft:27,borderRadius:12,alignItems:'center',padding:5,width:windowWidth*0.8}}>
                                                  <ImageBackground 
                                                     source={R.images.t2}
                                                     style={{alignItems:'center',padding:5,width:windowWidth*0.8}}>
                                                       
                                                        <View style={{flexDirection:'row'}}>
                                                  <Icon name="diamond" size={40} color="#fff"/>
                                                  <Icon name="diamond" size={30} color="#fff"/>
                                                  <Icon name="diamond" size={20} color="#fff"/>
                                                  <Icon name="diamond" size={10} color="#fff"/>
                                                  </View>
                                                    <Text style={{fontSize:25,color:textcolors[i],fontWeight:'700' }}>{user.package_id}</Text>
                                                    <Text style={{fontSize:20,color:textcolors[i],fontWeight:'700'}}>{user.package_name} </Text>
                                                    <Text style={{fontSize:20,color:textcolors[i],fontWeight:'700'}}>{user.package_validity} </Text>
                                                      <View style={{flexDirection:'row'}}>
                                                      <Icon style={{padding:5,color:textcolors[i]}} name="rupee" size={20} />
                                                      <Text style={{color:textcolors[i],fontSize:19,fontWeight:'700'}}>{user.package_price} </Text>
                                                      </View>
                                                    <TouchableOpacity 
                                                    onPress={()=>this.getdata(user)
                                                    }
                                                      style={{borderRadius:15,width:windowWidth*0.4,height:50,backgroundColor:'#fff',alignItems:'center',justifyContent:'center'}}>
                                                      <Text style={{fontSize:20,fontWeight:'700',color:textcolors[i]}}>Buy</Text>
                                                    </TouchableOpacity>


                                                  </ImageBackground>
                                                  
                                                </View>
                                            </View>
                                          ))
                                        }
                                    </ScrollView>
                              )}      
                           </View>                              
                      )}
                    </View>
              );
            }
}
                          


