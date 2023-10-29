import React from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import Header from 'comp/Header'
import R from 'res/R'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import RangeSlider from 'rn-range-slider';
import Loader from 'comp/Loader'
import Toast from "react-native-simple-toast";
import Utils from 'res/Utils'

export default class MyPreference extends React.Component {
    constructor() {
        super()
        this.state = ({
            user_id: '',
            isLoading: true,
            male: false,
            female: false,
            rangeLow1: 0,
            rangeHigh1: 0,
            rangeLow2: 18,
            rangeHigh2: 35,
            online: false,
            offline: false
        })
    }

    goBack() {
        this.props.navigation.state.params.backFromBasicInfo("home");
        this.props.navigation.goBack();
    }

    componentDidMount() {
        var data = this.props.navigation.getParam('details')

        if (data.find_gender != "") {
            data.find_gender.map((gender) => {
                if (gender == "Male") {
                    this.setState({ male: true })
                }
                if (gender == "Female") {
                    this.setState({ female: true })
                }
            })
        }
        if (data.find_people != "") {
            data.find_people.map((status) => {
                if (status == "10") {
                    this.setState({ online: true })
                }
                if (status == "20") {
                    this.setState({ offline: true })
                }
            })
        }

        this.setState({ user_id: data.user_id, rangeHigh1: data.find_distance == "" ? 0 : parseInt(data.find_distance), rangeLow2: data.find_min_age == "" ? 0 : parseInt(data.find_min_age), rangeHigh2: data.find_max_age == "" ? 0 : parseInt(data.find_max_age), isLoading: false }, () => console.log("data.find_distance==>", data.find_distance))
    }

    validateData() {
        if (!this.state.male && !this.state.female) {
            Toast.show("Please select gender", Toast.SHORT)
        }
        else if (!this.state.online && !this.state.offline) {
            Toast.show("Please select status", Toast.SHORT)
        }
        else {
            var gender = []
            var status = []
            if (this.state.male) {
                gender.push("Male");
            }
            if (this.state.female) {
                gender.push("Female");
            }
            if (this.state.online) {
                status.push("10")
            }
            if (this.state.offline) {
                status.push("20")
            }
            console.log(gender)
            console.log(status)
            console.log(this.state.user_id)
            let obj = {};
            // var formData = new FormData()
            // formData.append("find_gender",gender)
            // formData.append("find_people",status)
            // formData.append("min_age",this.state.rangeLow2)
            // formData.append("max_age",this.state.rangeHigh2)
            // formData.append("find_distance",this.state.rangeHigh1)
            obj.find_people = status;
            obj.find_gender = gender;
            obj.min_age = this.state.rangeLow2;
            obj.max_age = this.state.rangeHigh2;
            obj.find_distance = this.state.rangeHigh1;
            console.log("formData===>", obj)
            this.PostFormData(`${R.constants.Api.savePreference}${this.state.user_id}`, obj)
        }
    }

    
    PostFormData(url, param) {
        this.setState({ isLoading: true })
        let formBody = [];
        for (let property in param) {
            let encodedKey = encodeURIComponent(property);
            let encodedValue;
            if (property === 'find_gender') {
                console.log('print')
                encodedValue = param[property];
            } else {
                encodedValue = encodeURIComponent(param[property]);
            }

            formBody.push(encodedKey + "=" + encodedValue);
        }
        formBody = formBody.join("&");
        console.log("form body===>", formBody)
        fetch(url, {
            method: "POST",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'

            },
            body: formBody
        })
            .then((response) => response.json())
            .then((responseJson) => {
                if (responseJson.res_status === "success") {
                    Utils.storeData('currentOffset',0)
                        this.setState({isLoading:false},()=>{
                            Toast.show("Preference save sucessfully",Toast.SHORT)
                            this.goBack()
                        }) 
                } else {
                    this.setState({ isLoading: false },()=>
                        Toast.show("Preference not saved",Toast.SHORT)
                    )
                }
                console.log("responseJson====>", responseJson)
            })
            .catch((error) => {
                // DeviceEventEmitter.emit("NoNetwork");
                console.log(error);
                // return false
            });

    }

    render() {
        return (
            <View style={{ flex: 1 }}>
                <Header backClick={() => this.goBack()} title={"My Preference"} />
                {this.state.isLoading && <View style={{ zindex: 1, backgroundColor: 'rgba(0,0,0,0.5)', position: 'absolute', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                    <Loader />
                </View>}
                {!this.state.isLoading &&
                        <View>
                            <View style={{ flex: 1, padding: 20 }}>
                                <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 5, color: '#232323' }}>
                                    I want to find
                                    </Text>
                                <View style={{ flexDirection: 'row', height: 40 }}>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                                        <TouchableOpacity onPress={() => this.setState({ male: !this.state.male })}>
                                            <Icon name={this.state.male ? "checkbox-marked" : "checkbox-blank-outline"} size={25} color="#232323" />
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#232323' }}>
                                            Male
                                            </Text>
                                        <View style={{ padding: 5, margin: 5, backgroundColor: R.colors.cyan, borderRadius: 50 }}>
                                            <Icon name="gender-male" size={25} color="#232323" />
                                        </View>
                                    </View>
                                    <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                                        <TouchableOpacity onPress={() => this.setState({ female: !this.state.female })}>
                                            <Icon name={this.state.female ? "checkbox-marked" : "checkbox-blank-outline"} size={25} color="#232323" />
                                        </TouchableOpacity>
                                        <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#232323' }}>
                                            Female
                                            </Text>
                                        <View style={{ padding: 5, margin: 5, backgroundColor: 'pink', borderRadius: 50 }}>
                                            <Icon name="gender-female" size={25} color="#232323" />
                                        </View>
                                    </View>

                                </View>
                                <View style={{ height: 60, width: '100%', marginVertical: 15 }} >
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 5, color: '#232323' }}>
                                        show people from {this.state.rangeLow2} to {this.state.rangeHigh2}
                                    </Text>
                                    <RangeSlider
                                        style={{ height: 60 }}
                                        min={18}
                                        rangeEnabled={true}
                                        thumbColor="#232323"
                                        initialLowValue={this.state.rangeLow2}
                                        initialHighValue={this.state.rangeHigh2}
                                        max={70}
                                        labelStyle="none"
                                        selectionColor="#232323"
                                        blankColor="#d3d3d3"
                                        onValueChanged={(low, high, fromUser) => {
                                            this.setState({ rangeLow2: low, rangeHigh2: high })
                                        }}
                                    />

                                </View>
                                <View style={{ height: 60, width: '100%', marginVertical: 15 }} >
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 5, color: '#232323' }}>
                                        Distance from {this.state.rangeLow1} to {this.state.rangeHigh1} {this.state.rangeHigh1 == "5000" ? "+" : ""}
                                    </Text>
                                    <RangeSlider
                                        style={{ height: 60 }}
                                        min={0}
                                        rangeEnabled={false}
                                        thumbColor="#232323"

                                        initialLowValue={this.state.rangeHigh1}
                                        max={5000}
                                        labelStyle="none"
                                        selectionColor="#232323"
                                        blankColor="#d3d3d3"
                                        step={500}
                                        onValueChanged={(low, high, fromUser) => {
                                            this.setState({ rangeHigh1: low }, () => console.log("lowDis==>", this.state.rangeLow1, "==>high==>", this.state.rangeHigh1))
                                        }}
                                    />

                                </View>
                                <View style={{ marginVertical: 15 }}>
                                    <Text style={{ fontSize: 18, fontWeight: 'bold', padding: 5, color: '#232323' }}>
                                        Find people who is
                                        </Text>
                                    <View style={{ flexDirection: 'row', height: 40 }}>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                                            <TouchableOpacity onPress={() => this.setState({ online: !this.state.online })}>
                                                <Icon name={this.state.online ? "checkbox-marked" : "checkbox-blank-outline"} size={25} color="#232323" />
                                            </TouchableOpacity>
                                            <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#232323' }}>
                                                Online
                                                </Text>

                                        </View>
                                        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', padding: 5 }}>
                                            <TouchableOpacity onPress={() => this.setState({ offline: !this.state.offline })}>
                                                <Icon name={this.state.offline ? "checkbox-marked" : "checkbox-blank-outline"} size={25} color="#232323" />
                                            </TouchableOpacity>
                                            <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#232323' }}>
                                                Offline
                                                </Text>

                                        </View>
                                    </View>
                                </View>
                                <View style={{ marginTop: 80, paddingVertical: 30 }}>
                                    <TouchableOpacity onPress={() => this.validateData()} style={{ height: 50, borderRadius: 10, alignItems: 'center', justifyContent: 'center', backgroundColor: '#232323' }}>
                                        <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#fff' }}>
                                            SEARCH
                                            </Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>

                }
            </View>
        )
    }
}