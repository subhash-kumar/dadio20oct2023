import React from 'react'
import {TouchableOpacity,View,Animated} from 'react-native'
import TextView from '../TextView'
import Loader from '../Loader';

 const SubmitButton = ({textValue,onButtonClick,loading})=>{
    return(
        <View>
           <TouchableOpacity 
                onPress={onButtonClick} 
                style={{backgroundColor:'#007e7a',margin:20,height:50,alignItems:'center',justifyContent:'center',borderRadius:5}}>
                <TextView textValue={textValue} textStyle={{color:'white',fontSize:16}}/>
                {loading && <Loader
                    loaderStyle={{
                        position:'absolute',
                        right:13,
                    }}/>
                }
            </TouchableOpacity>
        </View>
    )
}

export default SubmitButton