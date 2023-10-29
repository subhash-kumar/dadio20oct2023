import React from 'react'
import {View,Image,Text,TextInput} from 'react-native'
import Styles from '../../Styles'
import { TouchableOpacity } from 'react-native-gesture-handler'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const Header = ({
    title,
    backClick,
    chatScreen,
    profileImage,
    giftClicked,
    callClicked,
    disableCall,
    openMenu,
    style,
    ProfileClick
})=>{
    return(
        <View style={[{height:55,elevation:5,backgroundColor: "#fff",flexDirection:'row',alignItems:'center'},style]}>
            <TouchableOpacity onPress={backClick} style={{justifyContent:'center',padding:10,flex:1}}>
                <Icon name="chevron-left" size={30} color="#232323" />
            </TouchableOpacity>
            <View style={{flexDirection:'row',alignItems:'center',flex:5}}>
                {
                    chatScreen && <TouchableOpacity onPress={ProfileClick} style={{marginEnd:10,elevation:5}}>
                        <Image
                            style={{height:40,width:40,borderRadius:50,borderWidth:2,borderColor:'#fff'}}
                            source={{uri:profileImage}}
                        />
                    </TouchableOpacity>
                }
                <Text numberOfLines={1} style={{flex:1,fontSize:16,fontWeight:'bold',color:"#232323"}}>
                    {title}
                </Text>
            </View>
            { chatScreen &&<View style={{flex:3,flexDirection:'row',justifyContent:'space-evenly'}}>
                <TouchableOpacity onPress={giftClicked}>
                    <Icon name="gift" size={30} color="red" />
                </TouchableOpacity>
                <TouchableOpacity disabled={disableCall} onPress={callClicked}>
                    <Icon name="phone" size={30} color="lightgreen" />
                </TouchableOpacity>
                

            </View>}
        </View>
    )
} 

export default Header