import React from 'react'
import {View,Text,BackHandler,Dimensions,Image,TouchableOpacity,PermissionsAndroid,Alert} from 'react-native'
import Header from 'comp/Header'
import Carousel, { Pagination }  from 'react-native-snap-carousel';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ImageCropPicker from "react-native-image-crop-picker";
import { each } from "underscore";
import Utils from 'res/Utils'
import Loader from 'comp/Loader'
import R from 'res/R'

export default class EditProfile extends React.Component{

    constructor(){
        super()
        this.state=({
            entries:[],
            user_id:'',
            activeSlide:0,
            isLoading:true,
            permissionsError:true,
            selectedImage:''
        })
    }
    componentDidMount(){
        this.setState({user_id:this.props.navigation.getParam("details").user_id},()=>this.getProfileGallery())
        this.backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            this.backAction
          );
    }
    componentWillUnmount() {
        this.backHandler.remove();
    }

    getProfileGallery(){
        Utils.ApiPost(R.constants.Api.basicInfo+this.state.user_id,response=(data)=>{
            console.log("profileDataAlbum====>",JSON.stringify(data))
            this.setState({entries:data.data.profile_images,isLoading:false})
        })
    }

    backAction=()=>{
        this.props.navigation.state.params.backFromBasicInfo();
    }

    goBack(){
        this.props.navigation.state.params.backFromBasicInfo();
        this.props.navigation.goBack(null)
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
                this.setState({isLoading:true},()=>this.uploadImage(image))
            });
        } else if (index == 2) {
            ImageCropPicker.openPicker({
              includeExif: true,
              cropping: true
            }).then(image => {
              console.warn(image);
              this.setState({isLoading:true},()=>this.uploadImage(image))
            });
        }
    }

    uploadImage= async(image)=>{
        var formData = new FormData();
        var Data={
            uri:
                Platform.OS === "android"
                ? `${image.path}`
                : image.path.replace("file://", ""),
            type: image.mime,
            name: "image.jpg"
            }
        formData.append("type","album")
        formData.append("file",Data)
            console.log(formData)
        await Utils.ApiPostwithBody(R.constants.Api.uploadToAlbum+this.state.user_id,formData,response=(data)=>{
            console.log("upload====>",JSON.stringify(data))
            // this.setState({isLoading:false},()=>
            this.getProfileGallery()
            // )
        })
    }

    setProfileImage(id){
        this.setState({isLoading:true})
        Utils.ApiPost(`${R.constants.Api.setAsProfileImage+this.state.user_id}&id=${id}`,response=(data)=>{
            console.log("profileDataAlbum==profileSelect==>",JSON.stringify(data))
            // this.setState({isLoading:false})
            this.getProfileGallery()
        })
    }

    deleteImage(id){
        this.setState({isLoading:true})
        Utils.ApiPost(`${R.constants.Api.deleteFromAlbum+this.state.user_id}&id=${id}`,response=(data)=>{
            console.log("profileDataAlbum==delete==>",JSON.stringify(data))
            // this.setState({isLoading:false})
            this.getProfileGallery()
        })
    }

    pagination (item) {
        return (
            <View style={{position:'absolute',zIndex:10,top:5,width:'100%'}}>
                <Pagination
                    dotsLength={item.length}
                    activeDotIndex={this.state.activeSlide}
                    containerStyle={{paddingVertical:0,paddingHorizontal:0,paddingEnd:5}}
                    dotContainerStyle={{alignSelf:'flex-start', height:15 }}
                    dotStyle={{
                        width: (Dimensions.get("screen").width/item.length)-5,
                        marginHorizontal:-5,
                        borderRadius:0,
                        height: 5,
                        backgroundColor: "#8e151a"
                    }}
                    inactiveDotStyle={{ 
                        width: (Dimensions.get("screen").width/item.length)-5,
                        marginHorizontal:-5,
                        height: 5,
                        backgroundColor:'#3a4147'
                    }}
                    inactiveDotOpacity={1}
                    inactiveDotScale={1}
                />
            </View>
        );
    }

    _renderItem = ({item, index}) => {
        console.log(item.pic)
        return (
            <View style={{flex:1,backgroundColor:'#ffffff'}}>
                <Image
                    source={{uri:item.profile_img}}
                    style={{resizeMode:'contain',flex:1}}
                />
                {item.type!=='profile'&&
                <TouchableOpacity 
                    onPress={()=>
                        Alert.alert(
                            "Delete Image?",
                            "Are you sure you want to delete this image?",
                            [
                              {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                              },
                              { text: "Yes, Delete this!", onPress: () => this.deleteImage(item.imgid) }
                            ],
                            { cancelable: true }
                          )
                        }
                    style={{position: 'absolute',top:20,right: 20,flexDirection:'row',alignItems:'center'}}>
                    <View style={{borderRadius:1000,backgroundColor: "#fff",elevation:5,padding:10,margin:10}}>
                        <Icon name="close" size={18} color="red"/>
                    </View>
                </TouchableOpacity>}
                {item.type!=='profile'&&<TouchableOpacity 
                    onPress={()=>
                        Alert.alert(
                            "Looking good? set as Profile Picture?",
                            "Are you sure you want to Set this image as profile image?",
                            [
                              {
                                text: "Cancel",
                                onPress: () => console.log("Cancel Pressed"),
                                style: "cancel"
                              },
                              { text: "Yes!", onPress: () => this.setProfileImage(item.imgid) }
                            ],
                            { cancelable: true }
                          )
                        }
                        style={{backgroundColor:'rgba(0,0,0,0.7)',paddingHorizontal:5,borderRadius:50,position: 'absolute',bottom:20,right: 20,flexDirection:'row',alignItems:'center'}}>
                    <View style={{borderRadius:1000,backgroundColor: "#fff",elevation:5,padding:10,margin:10}}>
                        <Icon name="done" size={18} color="green"/>
                    </View>
                    <Text style={{color:'#fff',fontSize:14}}>
                        set as active
                    </Text>
                </TouchableOpacity>}
            </View>
        );
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Header backClick={()=>this.goBack()} title={"Edit Profile Picture"}/>
                {this.state.isLoading&&
                    <View style={{zindex:1,backgroundColor: 'rgba(0,0,0,0.5)',position:'absolute',height:'100%',width:'100%',alignItems:'center',justifyContent:'center'}}>
                        <Loader/>
                    </View>
                }
                {!this.state.isLoading&&<View style={{flex:1}}>
                        <View style={{flex:3.5}}>
                            { this.pagination(this.state.entries) }
                            <Carousel
                                inactiveSlideScale={1}
                                ref={(c) => { this._carousel = c; }}
                                data={this.state.entries}
                                onSnapToItem={(index) => this.setState({ activeSlide: index }) }
                                renderItem={this._renderItem}
                                sliderWidth={Dimensions.get('screen').width}
                                itemWidth={Dimensions.get('screen').width}
                            />
                        </View>
                        <View style={{flex:1,flexDirection:'row',justifyContent:'center',alignItems:'center'}}>
                            <TouchableOpacity onPress={()=>this.checkPermission(1)} style={{borderRadius:1000,justifyContent:'center',alignItems:'center',backgroundColor: "#fff",elevation:10,padding:30,margin:10}}>
                                <Icon name="camera" size={40} color="#232323"/>
                                <Text style={{marginHorizontal:10}}>
                                    Camera
                                </Text>
                            </TouchableOpacity>
                            <Text>
                                or
                            </Text>
                            <TouchableOpacity onPress={()=>this.checkPermission(2)} style={{borderRadius:1000,justifyContent:'center',alignItems:'center',backgroundColor: "#fff",elevation:10,padding:30,margin:10}}>
                                <Icon name="sd-card" size={40} color="#232323"/>
                                <Text style={{marginHorizontal:10}}>
                                Gallery
                                </Text>
                            </TouchableOpacity>
                        </View>
                </View>}
            </View>
        )
    }
}