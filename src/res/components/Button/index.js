import React from 'react'
import {View,TouchableOpacity,Text,StyleSheet} from 'react-native'
import styles from './Styles'
import Icon from 'react-native-vector-icons/FontAwesome';

const Button =({
    btnPress,
    btnText,
    btnStyle,
    iconName,
})=>{
    return(
        <TouchableOpacity onPress={btnPress} style={[btnStyle,styles.buttonStyle]}>
            <Icon name={iconName} size={20} color="#fff" />
            <Text style={styles.btnTextStyle}>
                {btnText}
            </Text>
        </TouchableOpacity>
    )
}

export default Button