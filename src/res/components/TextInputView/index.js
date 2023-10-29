import React from 'react'
import {View,TextInput,Text,Image,TouchableOpacity} from 'react-native'
import R from 'res/R'
const TextInputView = ({
    title,
    textValue,
    placeholder,
    onChangeValue,
    passwordField,
    keyboardType,
    length,
    multiline
})=>{
    return(
        <View style={{marginVertical:10,paddingHorizontal:20}}>
            <Text style={{paddingHorizontal:4,fontSize:16,fontWeight:'bold'}}>{title}</Text>
            <TextInput
                style={{borderBottomWidth:1,borderBottomColor:R.colors.placeHolderColor,fontSize:16}}
                placeholder={placeholder}
                placeholderTextColor={R.colors.placeHolderColor}
                keyboardType={keyboardType}
                secureTextEntry={passwordField===true?true:false}
                onChangeText={onChangeValue}
                value={textValue}
                multiline={multiline}
                maxLength={length}
            />
        </View>
    )
} 

export default TextInputView