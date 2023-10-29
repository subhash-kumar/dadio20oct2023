import React from 'react'
import {View,Text} from 'react-native'
import R from 'res/R'
const TextView = ({
    textValue,
    textStyle
})=>{
    return(
        <View>
            <Text style={[{color:R.colors.textColor},textStyle]}>
                {textValue}
            </Text>
        </View>
    )
} 

export default TextView