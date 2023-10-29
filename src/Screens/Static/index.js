import React from 'react'
import {View,Text} from 'react-native'
import Header from 'comp/Header'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview'
import Button from 'comp/Button'
import TextInputView from 'comp/TextInputView'
import R from 'res/R'
import Toast from "react-native-simple-toast";
import Utils from 'res/Utils'
import HTML from 'react-native-render-html';

const faq=`<h3>What Does Dadio Mean ?</h3>
Dadio is derived from Dating with audio. It is the world's first dating app which understands the power of audio in dating. We believe that communication is very important in friendship & dating and if the same happens on audio without revealing the personal mobile nos. it can be a great fun way of knowing each other without any inhibitions. By the way, dadio is also a very beautiful fish, it is generally gold or silver in color with a blue line on it. So use Dadio to make good friends and start a new love story
<h4>How Do I use Dadio?</h4>

<b>Registration</b> : When you download and open the Dadio app for the first time you need to register, via Facebook or using your email id. You need to provide your name, display name, gender, age, audio profile, about you etc.

<b>Verified details</b> : We verify the email and mobile number of every user by sending a verification code. Don't worry these details are NOT shown publically and it is ONLY for our records.

<b>Profile Image</b> : This is your first impression on the platform. You must upload a good profile shot of yourself. This definitely improves your chances of getting a friend request. This is a mandatory field to use the app.

<b>Audio Profile</b> : This is the most unique part of Dadio& you must record an Audio profile of minimum 10 seconds & maximum 20 seconds to be able to use the Dadio app. This is a mandatory field
<h4>Tell me about all Sections and Icons of Dadio</h4>
<b>Timeline / Homepage</b> : This is the section, where you can see the profiles of the users (as per your preference settings). You can do the following on this section
<ul style="list-style-type:circle">
    <li><b>Pics</b> : You can see the profile image of the user, you can scroll left to see all the pics the user has uploaded.</li>

    <li><b>Info</b> : You will see the Name, Gender, Age and Location of the user</li>

    <li><b>Call Me</b> : You can call the user by clicking on Call Me icon. You must have points in your account to make the call. Click here to buy points (starting from Rs 10 only)</li>

    <li><b>Like</b> : You can click on the heart icon to like the person</li>

    <li><b>Chat</b> : You can do text chat with the person, free of cost</li>

    <li><b>Audio Profile</b> : You can listen, mute / unmute the audio profile of the person</li>

    <li><b>Notifications</b> : This bell icon shows the notifications</li>
</ul>
<b>Random Call</b> : This blue colour Call button is for random calling. If you click this button, it will search for nearest person (as per your preference settings) and if that person has enabled receiving random call, he / she will get the call from your side

<b>Chat</b> : You can check all your existing text chats from here

<b>Profile</b> : You can visit your profile page and do the following
<ul style="list-style-type:circle">
    <li>Check and update your profile</li>
    <li>Edit / update Audio profile</li>
    <li>Check and update My Preferences</li>
    <li>Add / edit About yourself content</li>
    <li>Upload / Delete pics from My Album</li>
    <li>Update Basic Info like : Name, Display name, State etc</li>
    <li>Check Privacy controls and enable / disable your availability for random chat or call</li>
    <li>Update password</li>
    <li>Buy or Check Points from My Points section</li>
    <li>Logout</li>
</ul>
<h4>What is the Difference between Green Call button and Blue Call button</h4>
<ul style="list-style-type:circle">
    <li>Call Me (Green Call Button) is the feature for calling the specific person, this you can do from the home page for any profile.</li>
    <li>Random Call (Blue Call Button) is the feature to call anyone (as per your preference settings)</li>
</ul>
<h4>I only want to search Men / Women, how do I do that?</h4>
You can simply go to your profile page and ‘My Preferences’ and select
<ul style="list-style-type:circle">
    <li>I want to find Women / Men</li>
    <li>Select age range</li>
    <li>Select Online / Offline status</li>
</ul>
<h4>What about My Privacy</h4>
Privacy is paramount in Dadio. Your personal details are NEVER shared by the dadio team. Infact when you use the Call Me or Random Call features of Dadio, the call happens between One App to Another and no customer gets to know about your mobile number. For further details please read our privacy policy`

const pp =`At Dadio, your privacy is a top priority. We do not compromise with your privacy. We design all of our products and services with your privacy in mind. At no point in time we save your audio calls. Even the text chat you do can be erased by a simple delete option. We do not save your personal chat or audio message or calls.

We do not use any complicated legal language to talk about the privacy policy. Its as simple as it can be, as we believe in being very transparent.

If you have any queries or issues, please feel free to reach out to us at vrgroupindia@gmail.com

We only need basic information about you to help us search perfect match for you. We need your name, location (via GPS), gender, profile pic and audio profile and a validate email id and phone number to help you use the Dadio app in the best possible way. You are in total control, when you delete your account, all the information gets deleted
<h4>Usage Information</h4>
We collect information about your activity on our services, for instance how you use them (e.g., date and time you logged in, features you’ve been using, searches, clicks and pages which have been shown to you, referring webpage address, advertising that you click on) and how you interact with other users (e.g., users you connect and interact with, time and date of your exchanges, number of messages you send and receive).
<h4>Device information</h4>
We collect information from and about the device(s) you use to access our services, including:

hardware and software information such as IP address, device ID and type, device-specific and apps settings and characteristics, app crashes, advertising IDs (such as Google’s AAID and Apple's IDFA, both of which are randomly generated numbers that you can reset by going into your device’ settings), browser type, version and language, operating system, time zones, identifiers associated with cookies or other technologies that may uniquely identify your device or browser (e.g., IMEI/UDID and MAC address);

information on your wireless and mobile network connection, like your service provider and signal strength;

information on device sensors such as accelerometers, gyroscopes and compasses.

Other information with your consent

If you give us permission, we can collect your precise geolocation (latitude and longitude) through various means, depending on the service and device you’re using, including GPS, Bluetooth or Wi-Fi connections. The collection of your geolocation may occur in the background even when you aren’t using the services if the permission you gave us expressly permits such collection. If you decline permission for us to collect your geolocation, we will not collect it.

Similarly, if you consent, we may collect your photos and videos (for instance, if you want to publish a photo, video or streaming on the services).
<h4>COOKIES AND OTHER SIMILAR DATA COLLECTION TECHNOLOGIES</h4>
We use and may allow others to use cookies and similar technologies (e.g., web beacons, pixels) to recognize you and/or your device(s).

Some web browsers (including Safari, Internet Explorer, Firefox and Chrome) have a “Do Not Track” (“DNT”) feature that tells a website that a user does not want to have his or her online activity tracked. If a website that responds to a DNT signal receives a DNT signal, the browser can block that website from collecting certain information about the browser’s user. Not all browsers offer a DNT option and DNT signals are not yet uniform. For this reason, many businesses, including Dadio, do not currently respond to DNT signals.
<h4>HOW WE USE INFORMATION</h4>
The main reason we use your information is to deliver and improve our services. Additionally, we use your info to help keep you safe and to provide you with advertising that may be of interest to you. Read on for a more detailed explanation of the various reasons we use your information, together with practical examples.

To administer your account and provide our services to you

Create and manage your account

Provide you with customer support and respond to your requests

Complete your transactions

Communicate with you about our services, including order management and billing

To help you connect with other users

Analyze your profile, activity on the service, and preferences to recommend meaningful connections to you and recommend you to others

Show users' profiles to one another

To ensure a consistent experience across your devices

Link the various devices you use so that you can enjoy a consistent experience of our services on all of them. We do this by linking devices and browser data, such as when you log into your account on different devices or by using partial or full IP address, browser version and similar data about your devices to help identify and link them.

Administer your account on these new features and apps

To serve you relevant offers and ads

Administer sweepstakes, contests, discounts or other offers

Develop, display and track content and advertising tailored to your interests on our services and other sites

Communicate with you by email, phone, social media or mobile device about products or services that we think may interest you

To improve our services and develop new ones

Administer focus groups and surveys

Conduct research and analysis of users’ behavior to improve our services and content (for instance, we may decide to change the look and feel or even substantially modify a given feature based on users’ behavior)

Develop new features and services (for example, we may decide to build a new interests-based feature further to requests received from users).

To prevent, detect and fight fraud or other illegal or unauthorized activities

Address ongoing or alleged misbehavior on and off-platform

Perform data analysis to better understand and design countermeasures against these activities

Retain data related to fraudulent activities to prevent against recurrences

To ensure legal compliance

Comply with legal requirements

Assist law enforcement

Enforce or exercise our rights, for example our Terms
<h4>To process your information as described above, we rely on the following legal bases:</h4>
<b>Provide our service to you:</b> Most of the time, the reason we process your information is to perform the contract that you have with us. For instance, as you go about using our service to build meaningful connections, we use your information to maintain your account and your profile, to make it viewable to other users and recommend other users to you.

<b>Legitimate interests:</b> We may use your information where we have legitimate interests to do so. For instance, we analyze users’ behavior on our services to continuously improve our offerings, we suggest offers we think might interest you, and we process information for administrative, fraud detection and other legal purposes.

<b>Consent:</b> From time to time, we may ask for your consent to use your information for certain specific reasons. You may withdraw your consent at any time by contacting us at the address provided at the end of this Privacy Policy.
<h4>HOW WE SHARE INFORMATION</h4>
Since our goal is to help you make meaningful connections, the main sharing of users’ information is, of course, with other users.

With other users

You share information with other users when you voluntarily disclose information on the service (including your public profile). Please be careful with your information and make sure that the content you share is stuff that you’re comfortable being publically viewable since neither you nor we can control what others do with your information once you share it.

If you choose to limit the audience for all or part of your profile or for certain content or information about you, then it will be visible according to your settings.

With our service providers and partners

We use third parties to help us operate and improve our services. These third parties assist us rious tasks, including data hosting and maintenance, analytics, customer care, marketing, advertising, payment processing and security operations.

We may also share information with partners who distribute and assist us in advertising our services. For instance, we may share limited information on you in hashed, non-human readable form to advertising partners.

We follow a strict vetting process prior to engaging any service provider or working with any partner. All of our service providers and partners must agree to strict confidentiality obligations.

For corporate transactions

We may transfer your information if we are involved, whether in whole or in part, in a merger, sale, acquisition, divestiture, restructuring, reorganization, dissolution, bankruptcy or other change of ownership or control.
<h4>When required by law</h4>
We may disclose your information if reasonably necessary: (i) to comply with a legal process, such as a court order, subpoena or search warrant, government / law enforcement investigation or other legal requirements; (ii) to assist in the prevention or detection of crime (subject in each case to applicable law); or (iii) to protect the safety of any person.
<h4>To enforce legal rights</h4>
We may also share information: (i) if disclosure would mitigate our liability in an actual or threatened lawsuit; (ii) as necessary to protect our legal rights and legal rights of our users, business partners or other interested parties; (iii) to enforce our agreements with you; and (iv) to investigate, prevent, or take other action regarding illegal activity, suspected fraud or other wrongdoing.

With your consent or at your request

We may ask for your consent to share your information with third parties. In any such case, we will make it clear why we want to share the information.

We may use and share non-personal information (meaning information that, by itself, does not identify who you are such as device information, general demographics, general behavioral data, geolocation in de-identified form), as well as personal information in hashed, non-human readable form, under any of the above circumstances. We may also share this information with other VR Group companies and third parties (notably advertisers) to develop and deliver targeted advertising on our services and on websites or applications of third parties, and to analyze and report on advertising you see. We may combine this information with additional non-personal information or personal information in hashed, non-human readable form collected from other sources. More information on our use of cookies and similar technologies can be found in our Cookie Policy
<h4>YOUR RIGHTS</h4>
We want you to be in control of your information, so we have provided you with the following tools:

Access / Update tools in the service. Tools and account settings that help you to access, rectify or delete information that you provided to us and that’s associated with your account directly within the service. If you have any question on those tools and settings, please contact our customer care team for help here.

Device permissions. Mobile platforms have permission systems for specific types of device data and notifications, such as phone book and location services as well as push notifications. You can change your settings on your device to either consent or oppose the collection of the corresponding information or the display of the corresponding notifications. Of course, if you do that, certain services may lose full functionality.

Deletion. You can delete your account by using the corresponding functionality directly on the service.

We want you to be aware of your privacy rights. Here are a few key points to remember:

Reviewing your information. Applicable privacy laws may give you the right to review the personal information we keep about you (depending on the jurisdiction, this may be called right of access, right of portability or variations of those terms). You can request a copy of your personal information by putting in such a request here.

Updating your information. If you believe that the information we hold about you is inaccurate or that we are no longer entitled to use it and want to request its rectification, deletion or object to its processing, please contact us here.

For your protection and the protection of all of our users, we may ask you to provide proof of identity before we can answer the above requests.

Keep in mind, we may reject requests for certain reasons, including if the request is unlawful or if it may infringe on trade secrets or intellectual property or the privacy of another user. If you wish to receive information relating to another user, such as a copy of any messages you received from him or her through our service, the other user will have to contact our Privacy Officer to provide their written consent before the information is released.

Also, we may not be able to accommodate certain requests to object to the processing of personal information, notably where such requests would not allow us to provide our service to you anymore. For instance, we cannot provide our service if we do not have your date of birth.

Uninstall. You can stop all information collection by an app by uninstalling it using the standard uninstall process for your device. If you uninstall the app from your mobile device, the unique identifier associated with your device will continue to be stored. If you re-install the application on the same mobile device, we will be able to re-associate this identifier to your previous transactions and activities.
<h4>HOW WE PROTECT YOUR INFORMATION</h4>
We work hard to protect you from unauthorized access to or alteration, disclosure or destruction of your personal information. As with all technology companies, although we take steps to secure your information, we do not promise, and you should not expect, that your personal information will always remain secure.

We regularly monitor our systems for possible vulnerabilities and attacks and regularly review our information collection, storage and processing practices to update our physical, technical and organizational security measures.

We may suspend your use of all or part of the services without notice if we suspect or detect any breach of security. If you believe that your account or information is no longer secure, please notify us immediately here

In order to ensure that our systems and your information are protected against unauthorized access, theft and loss, we implemented a bug bounty program. For more information about our bug bounty program, please click here.
<h4>HOW LONG WE RETAIN YOUR INFORMATION</h4>
We keep your personal information only as long as we need it for legitimate business purposes and as permitted by applicable law. To protect the safety and security of our users on and off our services, we implement a safety retention window of three months following account deletion. During this period, account information will be retained although the account will of course not be visible on the services anymore.

In practice, we delete or anonymize your information upon deletion of your account (following the safety retention window) or after two years of continuous inactivity, unless:

we must keep it to comply with applicable law (for instance, some "traffic data" is kept for one year to comply with statutory data retention obligations);

we must keep it to evidence our compliance with applicable law (for instance, records of consents to our Terms, Privacy Policy and other similar consents are kept for five years);

there is an outstanding issue, claim or dispute requiring us to keep the relevant information until it is resolved; or

the information must be kept for our legitimate business interests, such as fraud prevention and enhancing users' safety and security. For example, information may need to be kept to prevent a user who was banned for unsafe behavior or security incidents from opening a new account.

Keep in mind that even though our systems are designed to carry out data deletion processes according to the above guidelines, we cannot promise that all data will be deleted within a specific timeframe due to technical constraints.
<h4>CHILDREN'S PRIVACY</h4>
Our services are restricted to users who are 18 years of age or older. We do not permit users under the age of 18 on our platform and we do not knowingly collect personal information from anyone under the age of 18. If you suspect that a user is under the age of 18, please use the reporting mechanism available through the service.
<h4>PRIVACY POLICY CHANGES</h4>
Because we're always looking for new and innovative ways to help you build meaningful connections, this policy may change over time. We will notify you before any material changes take effect so that you have time to review the changes.
<h4>HOW TO CONTACT US</h4>
If you have questions about this Privacy Policy, here's how you can reach us: vrgroupindia@gmail.com
<h4>PRIVACY POLICY</h4>
Welcome to Dadio's Privacy Policy. Thank you for taking the time to read it.

We appreciate that you trust us with your information and we intend to always keep that trust. This starts with making sure you understand the information we collect, why we collect it, how it is used and your choices regarding your information. This Policy describes our privacy practices in plain language, keeping legal and technical jargon to a minimum.

This Privacy Policy applies beginning Feb, 21, 2020.
<h3>EFFECTIVE DATE: Feb 21, 2020</h3>`

const qsg=`<h3>Dadio Quick Start Guide</h3>
<ul style="list-style-type:circle">
    <li>Login / Register on Dadio App.</li>
    <li>Verify email & mobile number (It will NOT be shared anywhere, ONLY for admin records)</li>
    <li>Upload a nice profile pic & an impressive Audio Profile.</li>
    <li>Start browsing profiles, you can like and chat with anyone you want (unless they have restricted it in their privacy settings).</li>
    <li>If you want to make a call, please buy points (Starts from ONLY Rs 10).</li>
    <li>No points required to receive a call, rather you earn points for receiving calls on per minute basis.</li>
    <li>By using the calling feature of Dadio App, you can talk to any dadio users without revealing your mobile number. It can be a great fun way of knowing each other without any inhibitions.</li>
</ul>`
export default class Static extends React.Component{
    constructor(){
        super()
        this.state=({
            title:"",
            contactSubject:"",
            contactMessage:""
        })
    }

    componentDidMount(){
        this.setState({title:this.props.navigation.getParam("data").name})
    }

    goBack() {
        this.props.navigation.goBack(null);
    }

    _ValidateInput(){
        if(this.state.contactSubject.trim()==""){
            Toast.show("Please enter your subject",Toast.SHORT)
        }
        else if(this.state.contactMessage.trim()==""){
            Toast.show("please enter your message",Toast.SHORT)
        }
        else{
            this.contactUsWebService()
        }
    }

    contactUsWebService(){
        Utils.ApiPost(`${R.constants.Api.contactUs}${this.props.navigation.getParam("userId")}&contactus_subject=${this.state.contactSubject}&contactus_message=${this.state.contactMessage}`,response=(data)=>{
            console.log("Contact us ====>",data)
            if(data.res==200){
                if(data.data.res_status=="success"){
                    Toast.show("Message Sent Successful!",Toast.SHORT)
                    this.goBack()
                }
            }
        })
    }

    renderContent(){
        return(
            <KeyboardAwareScrollView style={{flex:1,backgroundColor:'#fff'}}>
                <View style={{margin: 10,}}>
                    <HTML html={this.props.navigation.getParam("data").id==0?qsg:this.props.navigation.getParam("data").id==1?faq:this.props.navigation.getParam("data").id==2?pp:null} />
                </View>                
                {
                    this.props.navigation.getParam("data").id==3&&<View>
                        <TextInputView
                            title={"Subject"}
                            placeholder={"Enter your Subject"}
                            textValue={this.state.contactSubject}
                            onChangeValue={(text) => this.setState({ contactSubject: text })}
                            keyboardType={"default"}
                        />
                        <TextInputView
                            title={"Message"}
                            placeholder={"Write your message here"}
                            textValue={this.state.contactMessage}
                            onChangeValue={(text) => this.setState({ contactMessage: text })}
                            keyboardType={"default"}
                            multiline={true}
                        />
                        <Button btnPress={() => this._ValidateInput()} btnStyle={{ backgroundColor: R.colors.submit, flex: 1 }} btnText={"Submit"} />
                    </View>
                }
            </KeyboardAwareScrollView>
        )
    }

    render(){
        return(
            <View style={{flex:1}}>
                <Header backClick={()=>this.goBack()} title={this.state.title}/>
                {this.renderContent()}
            </View>
        )
    }
}