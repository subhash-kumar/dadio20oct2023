import React from 'react'
import {View,Text,Image,TouchableOpacity,PermissionsAndroid,Dimensions,ScrollView} from 'react-native'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialIcons';
import Loader from 'comp/Loader'
import Toast from "react-native-simple-toast";
import Utils from 'res/Utils'

import ImageCropPicker from "react-native-image-crop-picker";
import { each } from "underscore";
import Button from 'comp/Button';
export default class UploadImage extends React.Component{

    constructor(){
        super()
        this.state=({
            selectedImage:"",
            isLoading:false
        })
    }

    checkPermission(id){
        if (Platform.OS === "android") {
            this.checkAndroidPermissions(id)
            .then(() => {
                this.setState({ permissionsError: false },()=>{
                    this.getId(id)
                });
            })
            .catch(error => {
                this.setState({ permissionsError: true});
                console.log("checkAndroidPermissions", error);
                return;
            });
        }
    }


    checkAndroidPermissions = (id) =>
        new Promise((resolve, reject) => {
            PermissionsAndroid.requestMultiple(id==1?[PermissionsAndroid.PERMISSIONS.CAMERA]:id==2?[PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]:null)
		.then(result => {
			const permissionsError = {};
			permissionsError.permissionsDenied = [];
			each(result, (permissionValue, permissionType) => {
                if (permissionValue === "denied") {
                    console.log("denied Permission");
                    permissionsError.permissionsDenied.push(permissionType);
                    permissionsError.type = "Permissions error";
                }
			})
			if (permissionsError.permissionsDenied.length > 0) {
                console.log("denied Permission");
                reject(permissionsError);
			} else {
                console.log("granted Permission");
                resolve();
			}
		})
		.catch(error => {
			reject(error);
		});
    });

    getId(index) {
        if (index == 1) {
            ImageCropPicker.openCamera({
              includeExif: true,
              cropping: true
            }).then(image => {
                console.warn(image);
                this.setState({selectedImage:image})
            });
        } else if (index == 2) {
            ImageCropPicker.openPicker({
              includeExif: true,
              cropping: true
            }).then(image => {
              console.warn(image);
              this.setState({selectedImage:image})

            });
        }
      }
      uploadImage= async()=>{
          this.setState({isLoading:true})
        var formData = new FormData();
        var Data={
            uri:
                Platform.OS === "android"
                ? `${this.state.selectedImage.path}`
                : this.state.selectedImage.path.replace("file://", ""),
            type: this.state.selectedImage.mime,
            name: "image.jpg"
            }
        formData.append("type","profile")
        formData.append("file",Data)
            console.log(formData)
        await Utils.ApiPostwithBody(R.constants.Api.uploadToAlbum+this.props.userId,formData,response=(data)=>{
            console.log("upload====>",JSON.stringify(data))
            // this.setState({isLoading:false},()=>
            // this.getProfileGallery()
            // )
            if(data.res.status==200){
                this.setState({isLoading:false})
                if(data.data.res_status="success"){
                    Toast.show("Profile Picture uploaded successfully",Toast.SHORT)
                    this.props.UploadClick(2)
                }
                else{
                    Toast.show("Something went wrong!",Toast.SHORT)
                }
            }else{
                Toast.show("Something went wrong!",Toast.SHORT)
            }
        })
    }


    render(){
        return(
            <View style={{flex:1,alignItems:'center',justifyContent:'center'}}>
               
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
                        {this.state.selectedImage!==""&&
                            <View style={{backgroundColor:'#fff',padding:5,margin:10}}>
                                <Image
                                    source={{uri:this.state.selectedImage.path}}
                                    style={{height:200,width:Dimensions.get("screen").width-120,resizeMode:'center'}}
                                />
                            </View>
                        }
                        <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',marginVertical:10}}>
                            <TouchableOpacity onPress={()=>this.checkPermission(1)} style={{borderRadius:1000,justifyContent:'center',alignItems:'center',backgroundColor: "#fff",elevation:10,padding:20,margin:20}}>
                                <Icon name="camera" size={40} color="#232323"/>
                                <Text style={{marginHorizontal:10}}>
                                    Camera
                                </Text>
                            </TouchableOpacity>
                            <Text>
                                or
                            </Text>
                            <TouchableOpacity onPress={()=>this.checkPermission(2)} style={{borderRadius:1000,justifyContent:'center',alignItems:'center',backgroundColor: "#fff",elevation:10,padding:20,margin:20}}>
                                <Icon name="sd-card" size={40} color="#232323"/>
                                <Text style={{marginHorizontal:10}}>
                                    Gallery
                                </Text>
                            </TouchableOpacity>
                        </View>
                        {
                            this.state.selectedImage!==""&&
                            <Button btnPress={()=>this.uploadImage()} btnStyle={{backgroundColor:"#232323",paddingHorizontal:15,}} btnText={"Next: Upload Audio Recording"}/>
                        }
                    </View>
                </ScrollView>
                
                {this.state.isLoading&&
                    <View style={{zindex:5,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                        <Loader/>
                    </View>
                }
            </View>
        )
    }
}