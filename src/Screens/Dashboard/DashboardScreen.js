import React, { Component } from 'react'
import { View, Text, Dimensions, PermissionsAndroid, Image, StyleSheet, Modal, FlatList,TouchableOpacity} from 'react-native'
import Carousel, { Pagination } from 'react-native-snap-carousel';
// import { TouchableOpacity } from 'react-native-gesture-handler';
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Loader from 'comp/Loader'
import Utils from 'res/Utils'
import Toast from "react-native-simple-toast";
import Sound from 'react-native-sound';
import { each } from "underscore";
import Geolocation from '@react-native-community/geolocation';

const image_path = "https://www.dadio.in/apps/uploads/"

var profileAudio


export default class DashboardScreen extends Component {

    constructor() {
        super()
        this.state = ({
            activeSlide: 0,
            activeIndex: 0,
            isLoading: true,
            currentOffset: 0,
            totalUser: 0,
            entries: "",
            modalContentValue: 0,
            Alert_Visibility: false,
            Alert_VisibilityModal: false,
            user_id: null,
            audioEnable: 1,
            audioUri: "",
            permissionsError: false,
            audioPlaying: false,
            nR: false,
            giftsLoading: true,
            entriesModal: [
                {
                    "id": "0",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
                {
                    "id": "1",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
                {
                    "id": "2",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
                {
                    "id": "3",
                    "image": R.images.logo,
                    "name": "test1",
                    "cost": 20
                },
            ]

        })
    }

    componentDidMount() {
        this.checkPermission()

    }

    componentWillUnmount() {
        this.stopAudio()
    }

    AlertBoxVisibility() {
        this.setState({ Alert_Visibility: !this.state.Alert_Visibility });
    }
    AlertBoxVisibilityModal() {
        this.setState({ Alert_VisibilityModal: !this.state.Alert_VisibilityModal });
        console.log(this.state.Alert_VisibilityModal);
    }

    checkPermission() {
        if (Platform.OS === "android") {
            this.checkAndroidPermissions()
                .then(() => {
                    this.setState({ permissionsError: false }, () => {
                        this._retriveData()
                    });
                })
                .catch(error => {
                    this.setState({ permissionsError: true, isLoading: false });
                    console.log("checkAndroidPermissions", error);
                    return;
                });
        }
    }

    checkAndroidPermissions = () =>
        new Promise((resolve, reject) => {
            PermissionsAndroid.requestMultiple([
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION
            ])
                .then(result => {
                    const permissionsError = {};
                    permissionsError.permissionsDenied = [];
                    each(result, (permissionValue, permissionType) => {
                        if (permissionValue === "denied") {
                            console.log("denied Permission");
                            permissionsError.permissionsDenied.push(permissionType);
                            permissionsError.type = "Permissions error";
                        }
                    });
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


    _retriveData = async () => {

        await Utils.getData("sound", value = (data) => {
            console.log("soundData====>", parseInt(data.value))
            this.setState({ audioEnable: parseInt(data.value) == NaN ? 0 : parseInt(data.value) })
        })
        await Utils.getData("currentOffset", value = (data) => {
            this.setState({ isLoading: true, currentOffset: data.value == null || data.value == undefined ? 1 : parseInt(data.value) }, () => {
                console.log("currentOffset", this.state.currentOffset)
            })
        })
        await Utils.getData("userData", value = (data) => {
            var userData = JSON.parse(data.value)
            this.setState({ user_id: userData.user_id })
        })

        this.getGeoLocation()

    }

    getGeoLocation = async () => {
        Geolocation.getCurrentPosition(this.geoSuccess, this.geoFailure, { enableHighAccuracy: false, timeout: 20000 });
    }



    geoSuccess = (position) => {
        console.log("position=========>" + position.coords.latitude);
        this.setState({ coords: position.coords }, () => {
            this._saveUserLocation(this.state.coords)
        })
    }

    geoFailure = (err) => {
        // this.setState({error: err.message});
        console.log("locationError====>" + JSON.stringify(err))
        switch (err.code) {
            case 1: {
                // hasLocationPermission = await this.hasLocationPermission();
                Toast.show("Please allow the location request.", Toast.SHORT)
                this.setState({ isLoading: false })
                break;
            }
            case 2: {
                Toast.show("Please turn on your GPS", Toast.SHORT);
                this.setState({ isLoading: false })
                break;
            }
            default: {
                // hasLocationPermission = await this.hasLocationPermission();
                Toast.show("Unable to get location at the moment.", Toast.SHORT)
                this.setState({ isLoading: false })
                break;
            }
        }
        //   console.log("entries",JSON.stringify(this.state.entries))
    }

    _saveUserLocation(location) {
        Utils.ApiPost(`${R.constants.Api.saveUserLocation}${this.state.user_id}&geo_latitude=${location.latitude}&geo_longitude=${location.longitude}`, response = (data) => {
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    console.log("locationservice===>", data.data)
                }
            }
        })
        this._getTotalProfile()
    }

    _getTotalProfile = async () => {
        await Utils.ApiPost(`${R.constants.Api.profileList}${this.state.user_id}`, response = (data) => {//profileList Api
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    // console.log("profileList===>",data.data)
                    this.setState({ totalUser: data.data.total_users, })

                }
            }

            // else{
            //     Toast.show("please check your internet.",Toast.SHORT)
            // }
            // this.setState({isLoading:false})
        })
        if (this.state.currentOffset !== undefined) {
            this._profileDetailWebSearvice()
        }
    }


    _profileDetailWebSearvice() {
        Utils.ApiPost(`${R.constants.Api.profileDetails}${this.state.user_id}&limit_offset=${this.state.currentOffset}`, response = (data) => {
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    console.log("profileDetails===>", data.data)
                    this.setState({ entries: data.data, audioUri: data.data.audio_file, isLoading: false },
                        () => this.setState({ isLoading: false }, () => {
                            if (this.state.Alert_Visibility) {
                                this.AlertBoxVisibility()
                            }
                            if (this.state.audioEnable == 1) {
                                setTimeout(() => {
                                    this.setState({ audioPlaying: true }, () => this.playAudio())
                                }, 1000);

                            }
                        }
                        ))
                }
                else if (data.data.res_status = "no_user") {
                    this.setState({ isLoading: false, entries: "", Alert_Visibility: false })
                }
            }
            else {
                this.setState({ isLoading: false })
            }


        })
    }

    _updateUserLike() {
        // console.log("this.state.entries.profile_id====>",this.state.entries.profile_id)
        // console.log(`${R.constants.Api.likeUnlike}${this.state.entries.profile_id}&like_by=${this.state.user_id}&action=${this.state.entries.ilike_profile==0?1:0}`)
        Utils.ApiPost(`${R.constants.Api.likeUnlike}${this.state.entries.profile_id}&like_by=${this.state.user_id}&action=${this.state.entries.ilike_profile == 0 ? 1 : 0}`, response = (data) => {
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    console.log("likeUnlike===>", data.data)
                }
            }
            else {
                this.setState({ isLoading: false })
                // Toast.show("please check your internet.",Toast.SHORT)
            }
        })
    }


    _renderItem = ({ item, index }) => {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <Image
                    source={{ uri: item.profile_img }}
                    style={{ flex: 1, resizeMode: 'cover' }}
                />
            </View>
        );
    }

    pagination(item) {
        return (
            <View style={{ position: 'absolute', zIndex: 10, top: 5 }}>
                <Pagination
                    dotsLength={item.length}
                    activeDotIndex={this.state.activeSlide}
                    containerStyle={{ paddingVertical: 0, paddingHorizontal: 0, paddingEnd: 5 }}
                    dotContainerStyle={{ alignSelf: 'flex-start', height: 15 }}
                    dotStyle={{
                        width: (Dimensions.get("screen").width / item.length) - 5,
                        marginHorizontal: -5,
                        borderRadius: 0,
                        height: 5,
                        backgroundColor: "#8e151a"
                    }}
                    inactiveDotStyle={{
                        width: (Dimensions.get("screen").width / item.length) - 5,
                        marginHorizontal: -5,
                        height: 5,
                        backgroundColor: '#3a4147'
                    }}
                    inactiveDotOpacity={1}
                    inactiveDotScale={1}
                />
                <View style={{ flexDirection: 'row', margin: 10, alignItems: 'center', height: 50 }}>
                    <TouchableOpacity onPress={() => { this.stopAudio(), this.props.onProfileClick(this.state.entries.profile_id) }} style={{ flexDirection: 'row', justifyContent: 'center', }}>
                        <View style={{}}>
                            <Image
                                source={{ uri: this.state.entries.profile_images[0].profile_img }}
                                style={{ height: 45, width: 45, borderRadius: 50, borderWidth: 2, borderColor: '#ffffff', resizeMode: "cover" }}
                            />
                            <View
                                style={{ backgroundColor: this.state.entries.profile_online == "online" ? "#24ff02" : "grey", height: 15, width: 15, borderRadius: 10, borderWidth: 1, position: 'absolute', top: 0, right: 0, borderColor: '#ffffff' }}
                            />
                        </View>
                        <View style={{ paddingHorizontal: 10 }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', color: 'white' }}>
                                {this.state.entries.display_name}, {this.state.entries.gender}
                            </Text>
                            <Text style={{ fontSize: 14, color: 'white' }}>
                                {this.state.entries.current_age}Yrs, {this.state.entries.distance_km}kms
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderModel() {
        return (
            <Modal
                visible={this.state.Alert_Visibility}
                transparent={true}
                animationType={"fade"}
                onRequestClose={() => { this.AlertBoxVisibility() }} >
                {
                    this.state.modalContentValue == 0 ? this.likeModalContent()
                        : this.state.modalContentValue == 1 ? this.dislikeModalContent() : null
                }
            </Modal>

        );
    }

    dislikeModalContent() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <View style={{ backgroundColor: '#ffffff', padding: 17, borderRadius: 100, elevation: 5 }}>
                    <Image
                        style={{ height: 40, width: 40 }}
                        source={R.images.cancel}
                    />
                </View>

            </View>
        )
    }

    likeModalContent() {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                <View style={{ backgroundColor: '#ffffff', padding: 17, borderRadius: 100, elevation: 5 }}>
                    <Image
                        style={{ height: 40, width: 43 }}
                        source={R.images.heart}
                    />
                </View>

            </View>
        )
    }

    changeProfileAction() {
        this.stopAudio()
        this.setState({
            activeSlide: 0,
            currentOffset: this.state.currentOffset + 1,



        }, () => {
            this.AlertBoxVisibility()
            setTimeout(() => {
                this._profileDetailWebSearvice()
            }, 500)
            Utils.storeData('currentOffset', this.state.currentOffset)
        })
        this.callMostActiveUser();
    }

    callMostActiveUser = () => {
        console.log(this.state.currentOffset);
        if (this.state.currentOffset % 11 === 0) {
            console.log("This is offset Vlue  ===", this.state.currentOffset);
            this.props.mostActiveUser()
        }
    }

    heartClick() {
        this.setState({ modalContentValue: 0 }, () => {
            this._updateUserLike()
            this.changeProfileAction()
        })
    }

    cancelClick() {
        this.setState({ modalContentValue: 1 }, () => this.changeProfileAction())
    }

    btnSpeakerPress() {
        console.warn(this.state.audioEnable == 1 ? "mute" : "ON")
        if (this.state.audioEnable == 0) {
            this.playAudio()
        }
        if (this.state.audioEnable == 1) {
            if (this.state.audioPlaying) {
                this.stopAudio()
            }
        }
        this.setState({ audioEnable: this.state.audioEnable == 0 ? 1 : 0 }, () => Utils.storeData("sound", this.state.audioEnable))

    }

    playAudio() {
        console.log(this.state.audioUri)
        profileAudio = new Sound(this.state.audioUri, '',
            (error, sound) => {
                if (error) {
                    // alert('error' + error.message);
                    return;
                }
                profileAudio.play(() => {
                    profileAudio.release();
                });
            });

    }

    stopAudio() {
        if (this.state.audioPlaying) {
            profileAudio.stop(() => {
                console.log('Stop');
                this.setState({ audioPlaying: false })
            })
        }
    }

    // this is for the Render gift modal

    getgiftList() {
        Utils.ApiPost(R.constants.Api.giftsForSend + this.state.user_id, response = (data) => {
            // console.log(data)
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    this.setState({ nR: false, entriesModal: data.data.gift_list, giftsLoading: false })
                }
                if (data.data.res_status == "no_gift") {
                    this.setState({ nR: true, entriesModal: [], giftsLoading: false })
                }
            }
        })
    }

    navigateGiftShop = () => {
        this.AlertBoxVisibilityModal()
        // this.props.navigation.state.params.backFromChatScreen("navGift","");
        // this.props.navigation.goBack();
        // this.backHandler.remove();
        // this.props.navigation.navigate('Chatpaid')
        this.props.giftNavigation()
        // this.props.navigation.navigate('GiftShop')
    }

    sendGift = (gift_id, payment_id) => {
        Utils.ApiPost(`${R.constants.Api.sendGift}${this.state.user_id}&profile_id=${this.state.entries.profile_id}&gift_id=${gift_id}&payment_id=${payment_id}`, response = (data) => {
            // console.log("sendGift=====>",data)
            if (data.res == 200) {
                this.AlertBoxVisibilityModal()
                if (data.data.res_status == "success") {
                    Toast.show("Gift sent sucessfully!")
                }
                if (data.data.res_status == "no_gift") {
                    Toast.show("Gift sent failed!")
                }
                // this.chatList()
            }
        })
    }

    giftModalRender() {
        return (
            <Modal
                visible={this.state.Alert_VisibilityModal}
                transparent={true}
                animationType={"fade"}
                onRequestClose={() => { this.AlertBoxVisibilityModal() }} >
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.8)' }}>
                    <View style={{ width: '95%' }}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#232323', padding: 20, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
                            <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                                Send Gift
                            </Text>
                            <TouchableOpacity onPress={() => this.AlertBoxVisibilityModal()}>
                                <Icon name="close-thick" size={25} color="#fff" />
                            </TouchableOpacity>
                        </View>
                        {!this.state.giftsLoading && <View style={{ backgroundColor: '#fff' }}>
                            {!this.state.nR && <FlatList
                                data={this.state.entriesModal}
                                numColumns={2}
                                style={{ height: 350 }}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => {
                                    return (
                                        <View style={{ alignItems: 'center', justifyContent: 'center', width: (Dimensions.get("window").width - 60) / 2, margin: 10, backgroundColor: '#fff', }}>
                                            <View style={{ padding: 10, borderWidth: StyleSheet.hairlineWidth, borderRadius: 5, borderColor: '#d3d3d3', marginVertical: 10 }}>
                                                <Image
                                                    style={{ height: 100, width: 100, borderRadius: 10, resizeMode: "contain" }}
                                                    source={{ uri: item.gift_image }}
                                                />
                                            </View>
                                            <View style={{ alignItems: 'center', justifyContent: 'center', height: 40, }}>
                                                <Text style={{ color: '#232323' }}>
                                                    {item.gift_name}
                                                </Text>
                                            </View>
                                            <TouchableOpacity onPress={() => this.sendGift(item.gift_id, item.payment_id)} style={{ paddingHorizontal: 10, borderRadius: 10, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', height: 40, backgroundColor: '#232323' }}>
                                                <Text style={{ color: '#fff', marginHorizontal: 10 }}>
                                                    Send
                                                </Text>
                                                <Icon name="send" size={25} color="#fff" />
                                            </TouchableOpacity>

                                        </View>
                                    )
                                }}
                            />}
                            {this.state.nR && <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', height: 250, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Text style={{ color: "#fff" }}>
                                    No Gifts
                                </Text>
                            </View>
                            }
                        </View>}
                        {this.state.giftsLoading &&
                            <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', height: 250, width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                                <Loader />
                            </View>
                        }
                        <View style={{ height: 60, backgroundColor: '#fff', borderBottomStartRadius: 10, borderBottomEndRadius: 10, justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableOpacity
                                onPress={() => this.navigateGiftShop()}
                                style={{ flexDirection: 'row' }}>
                                <Icon name="gift" size={25} color="red" />
                                <Text style={{ color: R.colors.cyan, fontSize: 18, marginHorizontal: 10, fontWeight: 'bold' }}>
                                    Buy More Gifts
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

        );
    }


    render() {
        // console.log("this.state.entries.profile_images===>",this.state.entries)
        return (
            <View style={{ flex: 1 }}>
                {this.state.isLoading && <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader />
                </View>}
                {(!this.state.isLoading && this.state.entries == "") &&
                    <View style={{ zindex: 1, backgroundColor: '#fff', position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                            <Image
                                source={R.images.oops}
                                style={{ height: 100, width: 80, marginBottom: 20 }}
                            />
                            <Text numberOfLines={2} style={{ textAlign: 'center' }}>
                                No profile found as per {"\n"} your preference!
                            </Text>
                        </View>
                    </View>}
                {(!this.state.isLoading && this.state.entries !== "") && <View style={{ flex: 1 }}>
                    {this.pagination(this.state.entries.profile_images)}
                    <Carousel
                        showSpinner={true}
                        spinnerColor={"red"}
                        inactiveSlideScale={1}
                        ref={(c) => { this._carousel = c; }}
                        data={this.state.entries.profile_images}
                        onSnapToItem={(index) => this.setState({ activeSlide: index })}
                        renderItem={this._renderItem}
                        sliderWidth={Dimensions.get('screen').width}
                        itemWidth={Dimensions.get('screen').width}
                    />

                    <View style={[this.state.entries.myself_usehand == 20 ? stylesLocal.buttonPlacementRight : stylesLocal.buttonPlacementLeft, { position: 'absolute', top: 0, bottom: 0, alignItems: 'center', justifyContent: 'center', }]}>
                        <View style={{ marginVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity onPress={() => this.props.onCall(this.state.entries, "outgoing")} style={{ backgroundColor: "#ffffff", padding: 13, borderRadius: 50 }} >
                                <Image
                                    style={{ height: 18, width: 18 }}
                                    source={R.images.call_green}
                                />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ backgroundColor: "#ffffff", padding: 13, borderRadius: 50 }}  onPress={()=> this.setState({ giftsLoading: true }, () => { this.AlertBoxVisibilityModal(), this.getgiftList() })}>
                                <Icon name="gift" size={20} color="red" />
                            </TouchableOpacity>
                        </View>
                        <View style={{ marginVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
                            <TouchableOpacity style={{ backgroundColor: "#ffffff", padding: 13, borderRadius: 50 }} onPress={() => this.btnSpeakerPress()} >
                                <Image
                                    style={{ height: 18, width: 18 }}
                                    source={this.state.audioEnable == 0 ? R.images.mute : R.images.sound}
                                />
                            </TouchableOpacity>
                        </View>

                    </View>

                    <View style={{ position: 'absolute', bottom: 25, left: 0, right: 0, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 30, flexDirection: 'row' }}>
                        <TouchableOpacity
                            onPress={() => { this.cancelClick() }}
                            style={{ backgroundColor: '#ffffff', padding: 13, borderRadius: 100, elevation: 5, flexDirection: 'row' }}>
                            <Image
                                style={{ height: 23, width: 23 }}
                                source={R.images.cancel}
                            />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => {
                                this.props.hiClicked(this.state.entries.profile_id)
                            }}
                            style={{ backgroundColor: '#ffffff', paddingHorizontal: 20, paddingVertical: 13, marginHorizontal: 10, borderRadius: 25, elevation: 5, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                            <Icon name="message-bulleted" size={20} color="#232323" />
                            <Text style={{ color: '#232323', fontSize: 18, marginStart: 10, fontWeight: 'bold' }}>
                                Say Hi!
                            </Text>

                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => { this.heartClick() }}
                            style={{ backgroundColor: '#ffffff', padding: 13, paddingVertical: 14, borderRadius: 100, elevation: 5, flexDirection: 'row' }}>
                            <Image
                                style={{ height: 22, width: 25 }}
                                source={this.state.entries.ilike_profile == 1 ? R.images.heart : R.images.heart_grey}
                            />
                        </TouchableOpacity>
                    </View>
                </View>}
                {this.renderModel()}
                {this.giftModalRender()}
            </View>

        )
    }
}

const stylesLocal = StyleSheet.create({
    buttonPlacementRight: {
        right: 15
    },
    buttonPlacementLeft: {
        left: 15
    }
})