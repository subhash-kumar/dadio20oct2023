import React from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image, Alert, Dimensions, DeviceEventEmitter } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import Menu, { MenuItem, MenuDivider } from 'react-native-material-menu';
import Utils from 'res/Utils'
import Loader from 'comp/Loader'
import Toast from "react-native-simple-toast";

import Dashboard from 'src/Screens/Dashboard'

const image_path = "https://www.dadio.in/apps/uploads/"

export default class ProfileDetails extends React.Component {
    constructor() {
        super()
        this.state = ({
            user_id: "",
            profile_id: "",
            entries: "",
            activeSlide: 0,
            isLoading: true,
            activeCall: "false",
            timerValue: ""
        })
        DeviceEventEmitter.addListener("callTimer", (res) => {
            console.log("callTimer======> event====>", res.data)
            this.setState({ timerValue: res.data })
        })
    }

    componentDidMount() {
        this.setState({
            profile_id: this.props.navigation.getParam("profile_id")
        }, () => {
            Utils.getData("userData", value = (data) => {
                this.getCallingStatus()
                var userData = JSON.parse(data.value)
                this.setState({ user_id: userData.user_id }, () => {
                    this.getProfileDetails()
                })
            })
        })
        console.log("this is testing call ======>",this.state.activeCall);
    }


    getProfileDetails() {
        Utils.ApiPost(`${R.constants.Api.profile}${this.state.user_id}&profile_id=${this.state.profile_id}`, response = (data) => {
            console.log("profile====>", data)
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    this.setState({ entries: data.data, isLoading: false })
                }
            }
        })
    }

    _updateUserLike() {
        Utils.ApiPost(`${R.constants.Api.likeUnlike}${this.state.profile_id}&like_by=${this.state.user_id}&action=${this.state.entries.ilike_profile == 0 ? 1 : 0}`, response = (data) => {
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    console.log("likeUnlike===>", data.data)

                    Toast.show(this.state.entries.ilike_profile == 0 ? "Profile liked" : "Profile Unliked", Toast.SHORT)
                }
            }
            else {
                this.setState({ isLoading: false })
                // Toast.show("please check your internet.",Toast.SHORT)
            }
            this.getProfileDetails()
        })
    }

    _reportProfile() {
        Alert.alert(
            "Report?",
            "Are you sure you want to report this person?",
            [
                {
                    text: "Cancel",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel"
                },
                {
                    text: "OK", onPress: () => {
                        this.setState({ isLoading: true })
                        Utils.ApiPost(`${R.constants.Api.reportProfile}${this.state.user_id}&profile_id=${this.state.profile_id}`, response = (data) => {
                            console.log("reportProfile===>", data.data)
                            if (data.res == 200) {
                                if (data.data.res_status == "success") {
                                    console.log("reportProfile===>", data.data)
                                    // this.chatList()
                                    Toast.show("Profile reported successfully.", Toast.SHORT)
                                }
                            }
                            else {
                                // this.setState({isLoading:false})
                                // Toast.show("please check your internet.",Toast.SHORT)
                            }
                            this.setState({ isLoading: false })
                        })
                    }
                }
            ],
            { cancelable: true }
        );

    }

    _menu = null;
    setMenuRef = ref => {
        this._menu = ref;
    };
    showMenu = () => {
        this._menu.show();
    };
    hideMenu = () => {
        this._menu.hide();
    };
    option1Click = () => {
        this.createCall(this.state.entries, "outgoing")
        this._menu.hide();
    };

    option2Click = (e) => {
        // console.log('DATSWA', e);

        if (this.props.navigation.getParam("from") == "Chat") {
            this.props.navigation.goBack(null)
        }
        else if (this.props.navigation.getParam('OnlineUser') == "OnlineUser") {
            const data = this.props.navigation.getParam('profile_id');
            console.log('back form profile====>', data);
            this.props.navigation.navigate('ChatScreen', {
                profileId: this.props.navigation.getParam('profile_id')
            });
            // this.props.navigation.goBack(null)
        }
        else if(this.props.navigation.getParam('MostActiveUser') == "MostActiveUser"){
            // const data = this.props.navigation.getParam('profile_id');
            // console.log('back form profile====>', data);
            // this.props.navigation.navigate('ChatScreen', {
            //     profileId: this.props.navigation.getParam('profile_id')
            // });
            this.props.navigation.goBack(null)
        }
        else {
            this.props.navigation.goBack()
            this.props.navigation.state.params.backFromProfile(this.state.entries.profile_id);
        }
        // Adding the elseif condition for the online user
        this._menu.hide();
    };
    option3Click = () => {
        this._reportProfile()
        this._menu.hide();
    };
    option4Click = () => {
        this._menu.hide();
    };

    getCallingStatus() {
        Utils.getData("activeCall", value = (data) => {
            if (data.value == null) {
                // activeCall="false"
                this.setState({ activeCall: "false" })
            }
            else {
                // activeCall=data.value
                this.setState({ activeCall: data.value })

            }
            console.log("activeCall===>", this.state.activeCall, data)
        })
    }


    createCall(data, value) {
        console.log("Create call to :===>", data, "====>", value)
        this.props.navigation.navigate('Call', { "type": value, "callDetails": data, "backFromCall": this.backFromCall.bind(this) })
    }

    backFromCall() {
        this.getCallingStatus()
        this.getProfileDetails()
    }

    pagination(item) {
        return (
            <View style={{ position: 'absolute', zIndex: 10, top: 5, width: '100%' }}>
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
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 10 }}>
                    <TouchableOpacity onPress={() => this.props.navigation.goBack(null)}>
                        <Icon name="arrow-left" size={30} color="#fff" />
                    </TouchableOpacity>
                    <Menu
                        ref={this.setMenuRef}
                        button={
                            <TouchableOpacity onPress={this.showMenu}>
                                <Icon name="dots-vertical" size={30} color="#fff" />
                            </TouchableOpacity>
                        }>
                        <MenuItem onPress={this.option1Click}>Call</MenuItem>
                        <MenuItem onPress={this.option2Click}>Message</MenuItem>
                        <MenuItem onPress={this.option3Click}>Report</MenuItem>
                    </Menu>
                </View>
            </View>
        );
    }

    _renderItem = ({ item, index }) => {
        return (
            <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
                <Image
                    source={{ uri: item.profile_img }}
                    style={{ flex: 1 }}
                />
            </View>
        );
    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                {this.state.isLoading &&
                    <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                        <Loader />
                    </View>
                }
                {!this.state.isLoading &&
                    <View style={{ flex: 1 }}>

                        <View style={{ flex: 1.5 }}>
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
                            <LinearGradient colors={['#ffffff00', '#232323']} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', position: "absolute", bottom: 0, left: 0, right: 0 }}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.createCall(this.state.entries, "outgoing")
                                        // new Dashboard().createCall(this.state.entries)
                                    }}
                                    style={{ backgroundColor: '#ffffff', padding: 15, borderRadius: 50, elevation: 5, flexDirection: 'row' }}>
                                    <Image
                                        style={{ height: 15, width: 15 }}
                                        source={R.images.call_green}
                                    />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={this.option2Click}
                                    style={{ backgroundColor: '#ffffff', height: 50, width: 100, justifyContent: 'center', alignItems: 'center', marginHorizontal: 10, borderRadius: 25, elevation: 5, flexDirection: 'row' }}>
                                    <Icon name="message-bulleted" size={18} color="#232323" />
                                    <Text style={{ color: '#232323', fontSize: 16, marginStart: 10, fontWeight: 'bold' }}>
                                        Say Hi!
                                    </Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={() => { this.setState({ activeSlide: 0 }, () => this._updateUserLike()) }}
                                    style={{ backgroundColor: '#ffffff', padding: 15, borderRadius: 50, elevation: 5, flexDirection: 'row' }}>
                                    <Image
                                        style={{ height: 15, width: 18 }}
                                        source={this.state.entries.ilike_profile == 1 ? R.images.heart : R.images.heart_grey}
                                    />
                                </TouchableOpacity>
                            </LinearGradient>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1, backgroundColor: '#232323' }}>
                            <View style={{ flexDirection: 'row', margin: 20 }}>
                                <View>
                                    <Image
                                        source={{ uri: this.state.entries.profile_images[0].profile_img }}
                                        style={{ height: 60, width: 60, borderRadius: 50, borderWidth: 2, borderColor: '#ffffff' }}
                                    />
                                    <View
                                        style={{ backgroundColor: this.state.entries.profile_online == "online" ? "#24ff02" : "grey", height: 15, width: 15, borderRadius: 10, borderWidth: 1, position: 'absolute', top: 2, right: 2, borderColor: '#ffffff' }}
                                    />
                                </View>
                                <View style={{ justifyContent: 'center', paddingHorizontal: 5 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: "white" }}>
                                        {this.state.entries.display_name}, {this.state.entries.gender}
                                    </Text>
                                    <Text style={{ fontSize: 16, color: "white" }}>
                                        {this.state.entries.current_age}Yrs, {this.state.entries.distance_km}kms
                                    </Text>
                                </View>
                            </View>
                            {this.state.entries.about_us !== null &&
                                <View style={{ marginHorizontal: 20 }}>
                                    <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>
                                        About Me (ID: {this.state.entries.profile_code})
                                    </Text>
                                    <Text style={{ color: 'white', fontSize: 14 }}>
                                        {this.state.entries.about_us}
                                    </Text>
                                </View>
                            }
                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginTop: 20 }}>
                                <Text style={{ color: 'white', backgroundColor: 'grey', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginHorizontal: 10 }}>
                                    {this.state.entries.gender}
                                </Text>
                                <Text style={{ color: 'white', backgroundColor: 'grey', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginHorizontal: 10 }}>
                                    {this.state.entries.current_age} Years Old
                                </Text>

                            </View>
                            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 20 }}>
                                <Text style={{ color: 'white', backgroundColor: 'grey', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 25, marginHorizontal: 10 }}>
                                    {this.state.entries.use_hand == 10 ? "Right" : "Left"} Handed
                                </Text>
                            </View>
                        </ScrollView>
                    </View>
                }
                {this.state.activeCall == "true" &&
                    <TouchableOpacity onPress={() => this.createCall(this.state.entries, "outgoing")} style={{ zIndex: 100, position: "absolute", left: 0, right: 0, alignItems: "center", justifyContent: 'center', height: 30, top: 55, backgroundColor: '#05adf6' }}>
                        <Text style={{ color: '#fff' }} >
                            On Going call, Tap to expand
                        </Text>
                        <View style={{ position: 'absolute', right: 5, top: 0, bottom: 0, justifyContent: 'center' }}>
                            <Text style={{ color: '#fff' }} >
                                {this.state.timerValue}
                            </Text>
                        </View>
                    </TouchableOpacity>
                }
            </View>
        )
    }
}