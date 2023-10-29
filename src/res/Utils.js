import AsyncStorage from '@react-native-community/async-storage';
import Toast from "react-native-simple-toast";

const Utils = {
    storeData : async (key,value,from) => {
        try{
            console.log("data storing in :",key,"=====>lue ===>",value,"===from===>",from)
            await AsyncStorage.setItem(key, (value == null? '' :value.toString()))
        }
        catch(error){
            console.log("store data Utils error :",error)
        }
    },

    getData : async (key,value=()=>{}) =>{
        try{
            const data= await AsyncStorage.getItem(key)
            console.log("data retriveing in :",key,"=====>lue ===>",data)
            value ({"value":data})
        }
        catch(error){
            console.log("get data Utils error :",error)
        }
    },

    ApiPost : async (url,response=()=>{})=>{
            await fetch(url, {
                method: "POST"
            })
            .then(res=> {
                // console.log(res)
                const statusCode = res.status;
                const data = res.json();
                return Promise.all([statusCode, data]);
            })
            .then(([res, data]) => {
                // console.log('===============responseCode================')
                // console.log(res, data);
                response ({"res":res,"data":data})
            })
            .catch(error => {
                // console.log("ApiError"+error);
                response ({ "res": "network error", "data":"" });
            });
    },
    ApiPostwithBody : async (url,input,response=()=>{})=>{
        console.log("url======>",url)
        console.log("qwertyuiop=====>",input)
        await fetch(url, {
            method: "POST",
            // headers:{
            //     "Content-Type":"multipart/form-data"   
            // },
            body: input

        })
        .then(res=> {
            console.log(res)
            return res
        })
        .then(res => {
            response ({"res":res,"data":""})
        })
        .catch(error => {
            console.log("ApiError"+error);
        });
}
}

export default Utils