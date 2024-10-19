import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StateContext } from "../StateProvider";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";

const MessageCard = () => {
  const { userState, setUserState } = useContext(StateContext);
  const [privateIDs, setPrivateIDs] = useState([]);
  const [userData, setUserData] = useState([]);
  useEffect(() => {
    onSnapshot(doc(db, "userChats", userState.user.uid), (d) => {
      setPrivateIDs((prevUserData) => [...prevUserData, d.data()]);
    });
  }, []);
  useEffect(() => {
    privateIDs?.map((userInfo) => setUserData(userInfo.userInfo));
  }, [privateIDs]);

  const navigation = useNavigation();
  return (
    <>
      {userData?.map((data) => {
        return (
          <TouchableOpacity
            key={data.chatID}
            onPress={() =>
              navigation.navigate("ChatScreen", {
                chatID: data.chatID,
                name: data.toName,
                photoUrl: data.photoUrl,
                toEMail: data.toEMail,
                userData: userData,
              })
            }
          >
            <View style={styles.container}>
              <View style={styles.container2}>
                <View style={styles.imgView}>
                  {data.photoUrl ? (
                    <Image
                      resizeMode="center"
                      style={styles.image}
                      source={{ uri: data.photoUrl }}
                    />
                  ) : (
                    <Image
                      resizeMode="center"
                      style={styles.image}
                      source={require("../assets/dummy-profile-pic.png")}
                    />
                  )}
                </View>
                <View style={styles.msgView}>
                  <Text style={styles.nameUser}>{data.toName}</Text>
                  <Text>{data.lastMessage}</Text>
                </View>
              </View>
              <View style={styles.time}>
                <View
                  style={{
                    width: 10,
                    height: 10,
                    backgroundColor: "lightgray",
                    borderRadius: 360,
                  }}
                ></View>
                <Text>{data.time}</Text>
              </View>
            </View>
          </TouchableOpacity>
        );
      })}
    </>
  );
};
const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    height: 75,
    padding: 10,
    justifyContent: "space-between",
    width: "100%",
    flex: 1,
  },
  container2: {
    flexDirection: "row",
  },
  imgView: {
    alignItems: "center",
    top: -3,
  },
  msgView: {
    left: 10,
    width: 240,
    height: 35,
  },
  nameUser: {
    fontWeight: "500",
    fontSize: 18,
  },
  time: {
    justifyContent: "space-evenly",
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 360,
    alignSelf: "auto",
  },
});
export default MessageCard;
