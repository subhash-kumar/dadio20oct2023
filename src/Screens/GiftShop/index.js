import React from 'react';
import {View, Text, FlatList, Dimensions, Image} from 'react-native';
import Header from 'comp/Header';
import R from 'res/R';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {TouchableOpacity} from 'react-native-gesture-handler';
import Loader from 'comp/Loader';
import Utils from 'res/Utils';

export default class GiftShop extends React.Component {
  constructor() {
    super();
    this.state = {
      entries: [],
      isLoading: true,
      nR: false,
      user_id: '',
    };
  }
  componentDidMount() {
    Utils.getData(
      'userData',
      (value = (data) => {
        var userData = JSON.parse(data.value);
        this.setState({user_id: userData.user_id}, () => this.getGifts());
      }),
    );
  }

  getGifts() {
    Utils.ApiPost(
      `${R.constants.Api.giftShop}${this.state.user_id}`,
      (response = (data) => {
        console.log('giftShop====>', JSON.stringify(data.data.gift_list));
        if (data.res == 200) {
          if (data.data.res_status == 'success') {
            this.setState({
              nR: false,
              entries: data.data.gift_list,
              isLoading: false,
            });
            // console.log(this.state.entries);
          }
          if (data.data.res_status == 'no_data') {
            this.setState({nR: true, entries: [], isLoading: false});
          }
        }
      }),
    );
  }

  render() {
    return (
      <View style={{backgroundColor: '#fff', flex: 1}}>
        <Header
          backClick={() => this.props.navigation.goBack(null)}
          title={'Gift Shop'}
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
        {!this.state.isLoading && (
          <View style={{flex: 1}}>
            {this.state.nR && (
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <Text style={{color: '#d3d3d3'}}>No Records</Text>
              </View>
            )}
            {!this.state.nR && (
              <FlatList
                style={{flex: 1}}
                data={this.state.entries}
                numColumns={2}
                keyExtractor={(item) => item.gift_id}
                renderItem={({item}) => {
                  return (
                    <View
                      style={{
                        borderRadius: 10,
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: (Dimensions.get('window').width - 40) / 2,
                        margin: 10,
                        elevation: 5,
                        backgroundColor: '#fff',
                      }}>
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          position: 'absolute',
                          elevation: 5,
                          padding: 10,
                          top: 10,
                          left: 0,
                          backgroundColor: '#fe4e84',
                        }}>
                        <Icon name="currency-inr" size={15} color="#fff" />
                        <Text style={{color: '#fff'}}>{item.gift_price}</Text>
                      </View>
                      <Image
                        style={{
                          height: 100,
                          width: 100,
                          marginVertical: 10,
                          resizeMode: 'contain',
                        }}
                        source={{uri: item.gift_image}}
                      />
                      <View
                        style={{
                          alignItems: 'center',
                          justifyContent: 'center',
                          height: 40,
                          borderBottomStartRadius: 10,
                          borderBottomEndRadius: 10,
                          width: '100%',
                          backgroundColor: '#232323',
                        }}>
                      <TouchableOpacity
                          onPress={() =>
                            this.props.navigation.navigate('BuyGift', {
                              data: JSON.stringify(item),
                              userId: this.state.user_id,
                            })
                          }
                          style={{color: '#f6f6f6'}}>
                          <Text style={{color: '#fff'}}>BUY</Text>
                      </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            )}
          </View>
        )}
      </View>
    );
  }
}
