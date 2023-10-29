import React from 'react'
import {View,Animated,Easing,Text } from 'react-native'
import R from 'res/R'

class Loader extends React.Component {
    constructor() {
        super();
        this.RotateValueHolder = new Animated.Value(0);
      }
      componentDidMount() {
        this.StartImageRotateFunction();
      }
      StartImageRotateFunction() {
        this.RotateValueHolder.setValue(0);
        Animated.timing(this.RotateValueHolder, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
          easing: Easing.linear,
        }).start(() => this.StartImageRotateFunction());
      }
    render(){
        const RotateData = this.RotateValueHolder.interpolate({
            inputRange: [0, 1],
            outputRange: ['0deg', '360deg'],
          });
        return(
                <View style={{paddingHorizontal:5,backgroundColor:'rgba(0,0,0,1)',borderRadius:10,zIndex:5,alignItems:'center'}}>
                  <Animated.Image
                      style={[this.props.loaderStyle,{width: 30,height: 30,marginTop:20,transform: [{ rotate: RotateData }]}]}
                      source={R.images.loader}
                  />
                  <Text style={{color:'#d3d3d3',margin:10}}>
                    please wait...
                  </Text>
                </View>
        )
    }
}

export default Loader