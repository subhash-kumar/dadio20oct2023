import React from 'react'
import {View,Text,Image,TouchableOpacity,StyleSheet,ScrollView} from 'react-native'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Button from 'comp/Button';
import Toast from "react-native-simple-toast";
// import DatePicker from 'react-native-datepicker';
import moment from 'moment';
import DateTimePicker from '@react-native-community/datetimepicker';

export default class SelectAge extends React.Component{

    constructor(){
        super()
        this.state=({
            age:moment(new Date()).subtract(18, 'year').calendar(),
            showPicker:false,
            maxDate:moment(new Date()).subtract(18, 'year').calendar(),
            minDate:moment(new Date()).subtract(70, 'year').calendar(),
        })
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
                    
                    <View style={{width:'85%', padding:20,justifyContent:'center',alignItems:'center'}}>
                        <Text style={{fontWeight:'bold',fontSize:16}}>
                            Age
                        </Text>
                        <TouchableOpacity 
                            style={{height:40}}
                            onPress={()=>{this.setState({showPicker:true})}}
                            >
                            <Text style={{marginVertical:10,width:"100%",borderBottomColor:'black',borderBottomWidth:StyleSheet.hairlineWidth,height:40}}>
                                {/* {moment(this.state.age,"").format("DD/MM/YYYY")} */}
                                {this.state.age}
                            </Text>
                        </TouchableOpacity>
                        {this.state.showPicker&&<DateTimePicker
                            maximumDate={new Date(this.state.maxDate)}
                            minimumDate={new Date(this.state.minDate)}
                            testID="datePicker"
                            value={new Date(this.state.age)}
                            mode={'date'}
                            is24Hour={true}
                            display="default"
                            onChange={(event, selectedDate) => {
                                this.setState({age:moment(selectedDate,"").format("DD/MM/YYYY"),showPicker:false}
                                    ,()=>{
                                        console.log(moment(selectedDate,"").format("DD/MM/YYYY"),"=========>",event)
                                })
                              }}
                        />}
                    </View>
                    <Button btnPress={()=>{this.props.UploadClick("age",this.state.age)}} btnStyle={{backgroundColor:"#232323",paddingHorizontal:15,}} btnText={"Finish!"}/>
                </View>
            </ScrollView>
            
        </View>
        )
    }
}