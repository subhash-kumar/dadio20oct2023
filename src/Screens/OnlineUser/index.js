import React from 'react'
import { View, Text, FlatList, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import R from 'res/R'
import Utils from 'res/Utils';
import Header from 'comp/Header';
import moment from 'moment';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Loader from 'comp/Loader';
// import Utils from 'res/Utils'

//  let flatListMoredata=[].push(entries);


export default class OnlineUser extends React.Component {
  constructor() {
    super()
    this.state = ({
      entries: [],
      user_id: '',
      pageid: 0,
      isLoading: true,
      flatListMoredata: [],
    })
  }

  componentDidMount() {
    Utils.getData(
      'userData',
      (value = (data) => {
        // alert(JSON.stringify(data))
        var userData = JSON.parse(data.value);
        // alert(JSON.stringify(userData.mycode))
        this.setState({ user_id: userData.user_id }, () => this.getDetails());
      }),
    );
  }


  getDetails() {
    //   alert(this.state.pageid);
    // const pageid=this.state.pageid;
    // alert(`${R.constants.Api.OnlineUser}${this.state.user_id}&pageid=${this.state.pageid}`);
    setTimeout(() => {
      Utils.ApiPost(`${R.constants.Api.OnlineUser}${this.state.user_id}&pageid=${this.state.pageid}`, response = (data) => {
        if (data.res == 200) {
          if (data.data.res_status == "success") {
            //   alert(JSON.stringify(data));
            console.log("OnlineUser===>", data.data)
            // this.state.pageid=this.state.pageid+1;
            console.log(this.state.pageid);
            var filterArray = this.state.flatListMoredata;
            filterArray.push(...data.data.online_userlist)
            this.setState({
              entries: data.data.online_userlist,
              flatListMoredata: filterArray,
            });
            // alert(flatListMoredata)
            console.log("this is called again ");
            this.setState({ isLoading: false })
          }
          // console.log("flatlistMoreData",this.state.flatListMoredata);

        }
      })
      console.log("Entries", this.state.entries);
    }, 1000);
  };
  activityIndicator = () => {
    return (
      <View style={{ alignItems: 'center', padding: 5 }}>
        <ActivityIndicator animating={true} color="#111112" size='large' />
      </View>
    );
  }

  FlatListItemSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          marginHorizontal: 20,
          backgroundColor: "lightgrey",
        }}
      />
    );
  }
  renderfooter = () => {
    { (this.state.isLoading ? this.activityIndicator : this.call) }
    return (
      <View style={{ alignItems: 'center', padding: 5 }}>
        <TouchableOpacity style={{ backgroundColor: '#09e63d', paddingHorizontal: 20, borderRadius: 10 }} onPress={() => this.getDetails()}>
          {/* <ActivityIndicator  animating={true} color="#111112" size='large'/> */}
          <Text style={{ fontSize: 17, fontWeight: '700', padding: 6 }} >Load More</Text>
        </TouchableOpacity>
      </View>
    );
  }



  goBack() {
    // this.props.navigation.state.params.backFromChatScreen("messageList","");
    this.props.navigation.goBack();
  }
  handleLoadMore = () => {
    this.setState({
      pageid: this.state.pageid + 1,
    }, () => {
      this.getDetails();
    })
  };

  render() {
    // alert(JSON.stringify(this.state.entries.display_name));
    return (

      <View style={{ flex: 1 }} >
        <Header
          title="Online User"
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
        <FlatList
          ItemSeparatorComponent={this.FlatListItemSeparator}
          data={this.state.flatListMoredata}
          keyExtractor={(item, index) => String(index)}
          // ListFooterComponent={this.renderfooter()}
          renderItem={({ item }) => {
            return (
              <View style={{ padding: 10, flexDirection: 'row', justifyContent: "space-between" }}  >
                <View style={{ flexDirection: 'row', }}>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('ProfileDetails', { profile_id: (item.profile_id), OnlineUser: ("OnlineUser") })}>
                    <Image
                      style={{ height: 45, width: 45, borderRadius: 50, borderWidth: 2, borderColor: '#fff', resizeMode: 'cover' }}
                      source={{ uri: item.profile_pic }}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => this.props.navigation.navigate('ProfileDetails', { profile_id: (item.profile_id), OnlineUser: ("OnlineUser") })}>
                    <View style={{ flex: 1, marginHorizontal: 10 }}>
                      <Text numberOfLines={1} ellipsizeMode='tail' style={{ flex: 1, fontSize: 16, fontWeight: 'bold' }}>
                        {item.display_name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginHorizontal: 5 }}>
                      <Text style={{ fontSize: 12, marginHorizontal: 5, color: 'grey' }}>
                        ID:{item.profile_code}
                      </Text>
                      <Text style={{ fontSize: 12, color: 'grey' }} >
                        {item.gender}, {item.current_age}Yrs.
                      </Text>
                      {/* <Text  style={{fontSize:12,color:'grey'}} >
                                               {item.current_age}Yrs.
                                            </Text> */}
                    </View>
                  </TouchableOpacity>
                </View>
                <TouchableOpacity style={{ width: 40, alignItems: 'center', padding: 2 }} onPress={() => this.props.navigation.navigate('ProfileDetails', { profile_id: (item.profile_id), OnlineUser: ("OnlineUser") })} >
                  <Text style={{ fontSize: 12, fontWeight: '700' }}>Online</Text>
                  <Icon name="online-prediction" size={25} color="#09e63d" />
                </TouchableOpacity>
              </View>
            )
          }}
          ListFooterComponent={this.activityIndicator()}
          // ListFooterComponent={this.isLoading=true?this.activityIndicator():this.renderfooter()}
          onEndReached={this.handleLoadMore}
          onEndThreshold={1000}
        />
      </View>
    )
  }
}

