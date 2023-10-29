import React, { Component } from 'react'
import { Text, View, Dimensions, StyleSheet, TouchableOpacity, FlatList } from 'react-native'
import Header from 'comp/Header';
import { SafeAreaView } from 'react-native';
import R from 'res/R'
import Utils from 'res/Utils';
import Loader from 'comp/Loader';
import Icon from 'react-native-vector-icons/FontAwesome';


const windowWidth = Dimensions.get('window').width;

export class PlanValidity extends Component {


    constructor() {
        super()
        this.state = ({
            entries: [],
            user_id: '',
            data: [],
            isLoading: true,
        })
    }

    componentDidMount() {
        Utils.getData(
            'userData',
            (value = (data) => {
                // alert(JSON.stringify(data))
                var userData = JSON.parse(data.value);
                // alert(JSON.stringify(userData.mycode))
                this.setState({ user_id: userData.user_id });
                console.log("this is ", userData);
                this.getUserHistory();
                this.getDetails();
            }),
        );
    }
    getUserHistory = () => {
        Utils.ApiPost(`${R.constants.Api.subscription}${this.state.user_id}`, response = (data) => {
            if (data.res == 200) {
                if (data.data.res_status == "success") {
                    // alert(JSON.stringify(data));
                    console.log("OnlineUser===>", data.data)
                    this.setState({
                        entries: data.data.mysubscription_history,
                        isLoading: false,
                    });
                    // this.setState({isLoading: false})
                }
            }
        })
    }

    getDetails() {
        Utils.ApiPost(`${R.constants.Api.basicInfo}${this.state.user_id}`, response = (data) => {
            if (data.res == 200) {
                //   alert(JSON.stringify(data));
                if (data.data.res_status == "success") {
                    console.log("basicInfo In Subscription===>", data.data)
                    this.setState({
                        data: data.data,
                    });
                    //   this.setState({isLoading: false})
                }
            }
        })
    }

    goBack = () => {
        this.props.navigation.goBack();
    }

    flatlistRenderDataHistory = (item) => {
        return (
            <View style={{ padding: 10, margin: 5, backgroundColor: '#fff', elevation: 5 }} >
                <Text style={{ fontWeight: 'bold' }}>
                    Name : <Text style={{ fontWeight: '100' }}>{item.package_name}</Text>
                </Text>
                <Text style={{ fontWeight: 'bold' }}>
                    Price : <Text style={{ fontWeight: '100' }}>{item.package_price}</Text> <Icon style={{ padding: 5 }} name="rupee" size={15} />
                </Text>
                <Text style={{ fontWeight: 'bold' }}>
                    Apply Point : <Text style={{ fontWeight: '100' }}>{item.apply_points}</Text>
                </Text>
                <Text style={{ fontWeight: 'bold' }}>
                    Validity : <Text style={{ fontWeight: '100' }}>{item.package_validity}</Text>
                </Text><Text style={{ fontWeight: 'bold' }}>
                    Duration : <Text style={{ fontWeight: '100' }}>{item.duration}</Text>
                </Text>
                <Text style={{ fontWeight: 'bold' }}>
                    Date : <Text style={{ fontWeight: '100' }}>{item.buy_date}</Text>
                </Text>
            </View>

        );
    }

    flatlistHeader = () => {
        return (
            <View style={{ alignItems: 'center' }}>
            </View>
        );
    }
    render() {
        return (
            <View style={{ flex: 1 }}>
                <Header
                    title="Buy Chat Subscription "
                    // style={{flex:1,elevation:0}}
                    backClick={() => this.goBack()}
                />
                {this.state.isLoading && (
                    <View
                        style={{
                            zindex: 1,
                            backgroundColor: 'rgba(0,0,0,0.5)',
                            position: 'absolute',
                            height: '100%',
                            width: '100%',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                        <Loader />
                    </View>
                )}
                {this.state.data.active_chatstatus === 20 ? <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5 }}>
                    {this.state.data.active_chatstatus === 20 ? <View style={{ flex: 1, justifyContent: 'center', padding: 5 }} ><Text style={styles.textFont} >No Packages</Text></View> : ""}
                    <TouchableOpacity
                        style={{
                            height: 50,
                            borderRadius: 10,
                            alignItems: 'center',
                            justifyContent: 'center',
                            backgroundColor: '#232323',
                            width: 100,
                        }}
                        onPress={() => { this.props.navigation.navigate('ChatPaid') }} >
                        <Text style={{ fontSize: 16, paddingHorizontal: 5, color: '#fff' }}>
                            BUY
                        </Text>
                    </TouchableOpacity>
                </View> :
                    <View style={{ padding: 5, justifyContent: 'center', elevation: 2 }}>
                        <View style={{ width: windowWidth - 11, elevation: 5, padding: 10, backgroundColor: 'white' }}>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', elevation: 2 }}>
                                <Text style={{ fontSize: 20, fontWeight: '700', color: '#02adf5' }}>Subscription Plan</Text>
                            </View>
                            <View style={{ flexDirection: "row", justifyContent: 'space-between' }}>
                                <Text style={styles.textFont} >Expire On</Text>
                                <Text style={styles.textFont} >{this.state.data.chat_expire_date}</Text>
                            </View>
                            <View style={{ flexDirection: 'row', justifyContent: 'center', padding: 5 }}>
                            </View>
                        </View>
                    </View>}

                <SafeAreaView>
                    <FlatList
                        ListHeaderComponent={this.flatlistHeader()}
                        data={this.state.entries}
                        keyExtractor={(item, index) => String(index)}
                        renderItem={({ item }) => this.flatlistRenderDataHistory(item)}
                    // ListFooterComponent={}
                    />
                </SafeAreaView>
            </View>
        )
    }
}
export default PlanValidity
const styles = StyleSheet.create({
    textFont: {
        fontSize: 15,
        fontWeight: '700',
    },
    textValidity: {
        fontSize: 20,
        fontWeight: '700'

    },


});

