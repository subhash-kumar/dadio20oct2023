import React from 'react'
import {View,Text,Image,TouchableOpacity,ScrollView} from 'react-native'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from 'comp/Button';
import Toast from "react-native-simple-toast";

export default class SelectGender extends React.Component{

    constructor(){
        super()
        this.state=({
            gender:0
        })
    }

    updateGender(){
        this.props.UploadClick("gender",this.state.gender==1?"Male":"Female")
    }

    render(){
       return(
        <View style={{flex:1}}>
            <Image
                source={R.images.t1}
                style={{position:'absolute',top:0,left:0 ,height:120,width:180}}
            />
            <Image
                source={R.images.t2}
                style={{position:'absolute',bottom:0,right:0 ,height:120,width:180}}
            />
            <ScrollView>
                <View style={{flex:1,alignItems:'center',justifyContent:'center',margin:40}}>
                    <Image
                        source={R.images.logo}
                        style={{height:120,width:190,marginVertical:10}}
                    />
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginVertical:10}}>
                        <TouchableOpacity onPress={()=>this.setState({gender:1})} style={{borderRadius:1000,justifyContent:'center',alignItems:'center',backgroundColor: this.state.gender==1?R.colors.cyan:"#fff",elevation:10,padding:20,margin:20}}>
                            <Icon name="gender-male" size={40} color="#232323"/>
                            <Text style={{marginHorizontal:15}}>
                                    Male
                                </Text>
                        </TouchableOpacity>
                        <Text>
                            or
                        </Text>
                        <TouchableOpacity onPress={()=>this.setState({gender:2})} style={{borderRadius:1000,justifyContent:'center',alignItems:'center',backgroundColor: this.state.gender==2?'pink':"#fff",elevation:10,padding:20,margin:20}}>
                            <Icon name="gender-female" size={40} color="#232323"/>
                            <Text style={{marginHorizontal:10}}>
                                    Female
                                </Text>
                        </TouchableOpacity>
                    </View>
                    <Button btnPress={()=>{this.state.gender==0?Toast.show("Please select a gender.",Toast.SHORT):this.updateGender()}} btnStyle={{backgroundColor:"#232323",paddingHorizontal:15,}} btnText={"Next: Select Age"}/>
                </View>
            </ScrollView>

            
        </View>
        )
    }
}