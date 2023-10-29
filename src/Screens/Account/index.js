import React, { Component } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Image, StyleSheet } from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import R from 'res/R'
import Header from 'comp/Header'
import Loader from 'comp/Loader'
import Utils from 'res/Utils'
import { Collapse, CollapseHeader, CollapseBody } from "accordion-collapse-react-native";
import Calls from '../Logs/Calls';
import Logs from '../Logs';


const AccountRow = ({
    leftIconName,
    fieldText,
    secondaryText,
    hideRightBtn,
    editClick,
    iconColor
}) => {
    return (
        <View>
            <View style={{ flexDirection: 'row', minHeight: 50 }}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={leftIconName} size={25} color={!iconColor ? "grey" : "red"} />
                </View>
                <View style={{ flex: 5, }}>
                    <TouchableOpacity onPress={editClick} style={{ flexDirection: "row", flex: 1, marginVertical: 10 }}>
                        <View style={{ flex: 5, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#232323' }}>
                                {fieldText}
                            </Text>
                            {secondaryText !== "" &&
                                <Text numberOfLines={2} style={{ fontSize: 13, color: '#232323' }}>
                                    {secondaryText}
                                </Text>
                            }
                        </View>
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            {!hideRightBtn &&
                                <TouchableOpacity >
                                    <Icon name="pencil" size={20} color="lightgrey" />
                                </TouchableOpacity>
                            }
                        </View>
                    </TouchableOpacity>
                    <View
                        style={{
                            height: 1,
                            marginEnd: 20,
                            backgroundColor: "lightgrey",
                        }}
                    />
                </View>

            </View>

        </View>
    )
}

export default class Account extends Component {
    constructor(props) {
        super(props)
        this.state = ({
            isLoading: true,
            AccountInfo: ""
        })
    }
    componentDidMount() {
        Utils.getData("userData", value = (data) => {
            var userData = JSON.parse(data.value)
        })
        setTimeout(() => { this.setState({ isLoading: false }) }, 1000)
    }



    render() {
        console.log("+++++++++++>", this.props.details)
        return (
            <View style={{ flex: 1 }}>
                {this.state.isLoading && <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader />
                </View>}
                {!this.state.isLoading &&
                    <View style={{ flex: 1 }}>
                        <Header backClick={() => this.props.onGoBack()} title={"My Account"} />
                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={{ height: 160, alignItems: 'center', justifyContent: 'center' }}>
                                <Image
                                    style={{ height: 140, width: 140, resizeMode: 'cover', borderRadius: 100, borderWidth: 3, borderColor: '#fff' }}
                                    source={{ uri: this.props.details.profile_pic }}
                                />
                                <View style={{ position: "absolute", bottom: 20, left: 0, right: 0, alignItems: 'center', marginLeft: 100 }}>
                                    <TouchableOpacity onPress={() => this.props.menuClick('profileImage')} style={{ backgroundColor: '#fff', padding: 5, borderRadius: 50, borderWidth: StyleSheet.hairlineWidth, borderColor: 'grey' }}>
                                        <Icon name="camera" size={20} color="#232323" />
                                    </TouchableOpacity>
                                </View>
                            </View>
                            <View>
                                <AccountRow
                                    leftIconName={"account"}
                                    fieldText={this.props.details.name + ` (ID: ${this.props.details.mycode})`}
                                    secondaryText={this.props.details.email_id}
                                    hideRightBtn={true}
                                />
                                <Collapse>
                                    <CollapseHeader>
                                        <View style={{ flexDirection: "row", justifyContent: 'center', padding: 5, minHeight: 50, marginLeft: -5 }}>
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon name="account" size={25} color="grey" />
                                            </View>
                                            <View style={{ flex: 5, justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#232323', padding: 10, marginLeft: -5 }}>
                                                    My Profile
                                                </Text>
                                                <View
                                                    style={{
                                                        height: 1,
                                                        marginEnd: 20,
                                                        backgroundColor: "lightgrey",
                                                    }} />
                                            </View>
                                        </View>
                                    </CollapseHeader>
                                    <CollapseBody  >
                                        <View style={{ marginLeft: 15 }}>
                                            <AccountRow
                                                editClick={() => this.props.menuClick("about", this.props.details.about_us)}
                                                leftIconName={"information-outline"}
                                                fieldText={"About Me"}
                                                secondaryText={this.props.details.about_us}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("info")}
                                                leftIconName={"information"}
                                                fieldText={"Basic Info"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("reffer")}
                                                leftIconName={"share"}
                                                fieldText={"Refer & Earn"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("recordVoice", this.props.details.audio_file)}
                                                leftIconName={"microphone"}
                                                fieldText={"Record Your Voice"}
                                                secondaryText={""}
                                            />
                                        </View>
                                    </CollapseBody>
                                </Collapse>
                                <Collapse>
                                    <CollapseHeader>
                                        <View style={{ flexDirection: "row", justifyContent: 'center', padding: 5, minHeight: 50, marginLeft: -5 }}>
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon name="diamond-stone" size={25} color="#02adf5" />
                                            </View>
                                            <View style={{ flex: 5, justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#02adf5', padding: 10, marginLeft: -5 }}>
                                                    Points & Gift Shop
                                                </Text>
                                                <View
                                                    style={{
                                                        height: 1,
                                                        marginEnd: 20,
                                                        backgroundColor: "lightgrey",
                                                    }} />
                                            </View>
                                        </View>
                                    </CollapseHeader>
                                    <CollapseBody>
                                        <View style={{ marginLeft: 15 }}>
                                            <AccountRow
                                                editClick={() => this.props.menuClick("points")}
                                                leftIconName={"diamond-stone"}
                                                fieldText={"Buy Points"}
                                                secondaryText={""}
                                            />
                                            {/* <AccountRow 
                                            editClick={()=>this.props.menuClick("chatpaid")}
                                            leftIconName={"diamond-stone"} 
                                            fieldText={"Buy Chat"} 
                                            secondaryText={""}
                                        /> */}
                                            <AccountRow
                                                editClick={() => this.props.menuClick("points")}
                                                leftIconName={"diamond"}
                                                fieldText={"My Points & Records"}
                                                secondaryText={""}
                                            />
                                            {/* <AccountRow     
                                        editClick={()=>this.props.menuClick("Chating valid")}
                                        leftIconName={"gift-outline"}
                                        fieldText={"My Gifts Chating"} 
                                        secondaryText={""}
                                        /> */}
                                            <AccountRow
                                                editClick={() => this.props.menuClick("buyChat")}
                                                leftIconName={"chat-processing-outline"}
                                                fieldText={"Buy chat"}
                                                secondaryText={""}
                                            />
                                            {/* plan Vlidity */}
                                            <AccountRow
                                                editClick={() => this.props.menuClick("PlanValidity")}
                                                leftIconName={"chat-plus-outline"}
                                                fieldText={"My Chat Subscription"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("myGift")}
                                                leftIconName={"gift-outline"}
                                                fieldText={"My Gifts"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("giftShop")}
                                                leftIconName={"gift"}
                                                fieldText={"Gift Shop"}
                                                secondaryText={""}
                                            />
                                        </View>
                                    </CollapseBody>
                                </Collapse>
                                <Collapse>
                                    <CollapseHeader>

                                        <View style={{ flexDirection: "row", justifyContent: 'center', padding: 5, minHeight: 50, marginLeft: -5 }}>
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon name="magnify" size={25} color="grey" />
                                            </View>
                                            <View style={{ flex: 5, justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#232323', padding: 10, marginLeft: -5 }}>
                                                    Search User
                                                </Text>
                                                <View
                                                    style={{
                                                        height: 1,
                                                        marginEnd: 20,
                                                        backgroundColor: "lightgrey",
                                                    }} />
                                            </View>
                                        </View>
                                    </CollapseHeader>
                                    <CollapseBody>
                                        <View style={{ marginLeft: 15 }}>
                                            <AccountRow
                                                editClick={() => this.props.menuClick("preferences")}
                                                leftIconName={"account-group"}
                                                fieldText={"My Search Preference"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("search")}
                                                leftIconName={"magnify"}
                                                fieldText={"Search Users"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("OnlineUser")}
                                                leftIconName={"heart-plus-outline"}
                                                fieldText={"Online Users"}
                                                secondaryText={""}
                                            />
                                            {/* <AccountRow
                                                editClick={() => this.props.menuClick("MostActiveUser")}
                                                leftIconName={"charity"}
                                                fieldText={"Most Active User"}
                                                secondaryText={""}

                                            /> */}
                                        </View>
                                    </CollapseBody>
                                </Collapse>
                                <Collapse>
                                    <CollapseHeader>

                                        <View style={{ flexDirection: "row", justifyContent: 'center', padding: 5, minHeight: 50, marginLeft: -5 }}>
                                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                                <Icon name="shield-account" size={25} color="grey" />
                                            </View>

                                            <View style={{ flex: 5, justifyContent: 'center' }}>
                                                <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#232323', padding: 10, marginLeft: -5 }}>
                                                    Privacy & Security  </Text>
                                                <View
                                                    style={{
                                                        height: 1,
                                                        marginEnd: 20,
                                                        backgroundColor: "lightgrey",
                                                    }} />
                                            </View>
                                        </View>
                                    </CollapseHeader>
                                    <CollapseBody>
                                        <View style={{ marginLeft: 15 }}>
                                            <AccountRow
                                                editClick={() => this.props.menuClick("privacy")}
                                                leftIconName={"shield-half-full"}
                                                fieldText={"Privacy Controls"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("password")}
                                                leftIconName={"key"}
                                                fieldText={"Update Passwords"}
                                                secondaryText={""}
                                            />
                                            <AccountRow
                                                editClick={() => this.props.menuClick("delete")}
                                                leftIconName={"delete-forever"}
                                                fieldText={"Delete Account"}
                                                secondaryText={""}
                                            />
                                        </View>
                                    </CollapseBody>
                                </Collapse>
                                <AccountRow
                                    // editClick={()=>this.props.menuClick("callLog")}
                                    // editClick={()=>this.props.menuClick("callog")}
                                    editClick={() => this.props.menuClick("callLog")}
                                    leftIconName={"phone"}
                                    fieldText={"Call & Chat Logs"}
                                    secondaryText={""}
                                />
                                <AccountRow
                                    editClick={() => this.props.menuClick("help")}
                                    leftIconName={"help-circle"}
                                    fieldText={"Need Help?"}
                                    secondaryText={""}
                                />
                                <AccountRow
                                    editClick={() => this.props.menuClick("logout")}
                                    leftIconName={"power"}
                                    fieldText={"Log out"}
                                    secondaryText={""}
                                    iconColor={true}
                                />
                            </View>
                        </ScrollView>
                    </View>
                }
            </View>
        )
    }
}