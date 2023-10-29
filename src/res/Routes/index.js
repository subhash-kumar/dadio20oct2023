import {  createAppContainer } from "react-navigation";
import { createStackNavigator } from 'react-navigation-stack';

import Splash from 'src/Screens/Splash'
import Landing from 'src/Screens/Landing'
import Login from 'src/Screens/Login'
import Dashboard from 'src/Screens/Dashboard'
import ProfileDetails from 'src/Screens/ProfileDetails'
import Account from 'src/Screens/Account'
import GiftShop from 'src/Screens/GiftShop'
import MyGift from 'src/Screens/MyGift'
import PrivacyControls from 'src/Screens/PrivacyControls'
import BasicInfo from 'src/Screens/BasicInfo'
import MyPreference from 'src/Screens/MyPreference'
import ChatScreen from 'src/Screens/Logs/ChatScreen'
import Points from 'src/Screens/Points'
import BuyGift from 'src/Screens/GiftShop/BuyGift'
import UpdatePassword from 'src/Screens/UpdatePassword'
import Call from 'src/Screens/Call'
import EditProfile from 'src/Screens/EditProfile'
import AfterSignUp from 'src/Screens/AfterSignUp'
import Listing from 'src/Screens/Points/Listing'
import Payout from 'src/Screens/Points/Payout'
import Static from 'src/Screens/Static'
import Reffer from 'src/Screens/Reffer'
import BuyChat from 'src/Screens/ChatPaid/BuyChat'
import ChatPaid from 'src/Screens/ChatPaid/ChatPaid'
import OnlineUser from 'src/Screens/OnlineUser'
import PlanValidity from "src/Screens/PlanValidity";
import MostActiveUser from "src/Screens/MostActiveUser";
const Navigations = createStackNavigator({
    Splash: Splash,
    Landing:Landing,
    Login:Login,
    Dashboard:Dashboard,
    ProfileDetails:ProfileDetails,
    Account:Account,
    GiftShop:GiftShop,
    MyGift:MyGift,
    PrivacyControls:PrivacyControls,
    BasicInfo:BasicInfo,
    MyPreference:MyPreference,
    ChatScreen:ChatScreen,
    Points:Points,
    BuyGift:BuyGift,
    UpdatePassword:UpdatePassword,
    Call:Call,
    EditProfile:EditProfile,
    AfterSignUp:AfterSignUp,
    Listing:Listing,
    Payout:Payout,
    Static:Static,
    Reffer:Reffer,
    BuyChat:BuyChat,
    ChatPaid:ChatPaid,
    OnlineUser:OnlineUser,
    PlanValidity:PlanValidity,
    MostActiveUser:MostActiveUser,
  },{
      initialRouteName:'Splash',
      headerMode: 'none',
      navigationOptions: {
        headerVisible: false,
      }
  });
  
  export default createAppContainer(Navigations);