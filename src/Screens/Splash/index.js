import React from 'react'
import {View,Text,Image} from 'react-native'
import R from 'res/R'
import Utils from 'res/Utils'

export default class Splash extends React.Component{
    componentDidMount(){
        this._retrivedata()
    }

    _retrivedata = async ()=>{
        Utils.getData("userData",value=(data)=>{
            console.log(JSON.parse(data.value))
            setTimeout(()=>{
                if(JSON.parse(data.value)==null){
                    this.props.navigation.replace("Landing")
                }
                else{
                    this.props.navigation.replace("Dashboard")
                }
            },3000)
        })
        
    }

    render(){
        return(
            <View style={{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:R.colors.background}}>
                <Image
                    source={R.images.t1}
                    style={{position:'absolute',top:0,left:0 ,height:120,width:180}}
                />
                <Image
                    source={R.images.logo}
                    style={{height:120,width:190}}
                />
                <Image
                    source={R.images.t2}
                    style={{position:'absolute',bottom:0,right:0 ,height:120,width:180}}
                />
            </View>
        )
    }
}