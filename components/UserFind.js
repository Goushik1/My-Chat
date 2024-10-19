import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Image,
} from "react-native";
import React, { useContext, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { StateContext } from "../StateProvider";
import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase";

const UserFind = ({ setModalVisible, modalVisible }) => {
  const { userState, setUserState } = useContext(StateContext);
  const [userNameFind, setUserNameFind] = useState("");
  const [userNameData, setUserNameData] = useState(null);
  const navigation = useNavigation();
  let userVisible = false;
  const findUser = () => {
    const q = query(
      collection(db, "users"),
      where("displayName", "==", userNameFind)
    );
    getDocs(q).then((doc) => {
      setUserNameData(doc.docs.map((d) => d.data()));
    });
  };
  const createChat = async (recevierId, recevierName, recevierPic) => {
    const combineID =
      userState.user.uid < recevierId
        ? userState.user.uid + recevierId
        : recevierId + userState.user.uid;
    try {
      const data = await getDoc(doc(db, "chats", combineID));
      if (!data.exists()) {
        await setDoc(doc(db, "chats", combineID), {
          messages: [],
        });
        await updateDoc(doc(db, "userChats", recevierId), {
          userInfo: arrayUnion({
            lastMessage: "",
            chatID: combineID,
            toName: userState.user.displayName,
            toEMail: userState.user.uid,
            photoUrl: userState.user.photoUrl,
            time: "",
          }),
        });
        await updateDoc(doc(db, "userChats", userState.user.uid), {
          userInfo: arrayUnion({
            lastMessage: "",
            chatID: combineID,
            toName: recevierName,
            toEMail: recevierId,
            photoUrl: recevierPic,
            time: "",
          }),
        });
      }
    } catch (err) {
      console.log(err);
    }

    navigation.navigate("ChatScreen", {
      chatID: combineID,
      name: recevierName,
      photoUrl: recevierPic,
      toEMail: recevierId,
    });
    setModalVisible(!modalVisible);
  };
  return (
    <View style={styles.container}>
      <View style={styles.textInput}>
        <TextInput
          placeholder="Search User"
          onChangeText={setUserNameFind}
          value={userNameFind}
          onSubmitEditing={() => {
            findUser();
          }}
        />
      </View>
      <ScrollView style={{ flex: 1, width: "100%" }}>
        {userNameData
          ? userNameData.map((name) => {
              userVisible = true;
              return (
                <TouchableOpacity
                  key={name.uid}
                  onPress={() =>
                    createChat(name.uid, name.displayName, name.photoUrl)
                  }
                  style={styles.container2}
                >
                  <View style={styles.imgView}>
                    {name.photoUrl ? (
                      <Image
                        resizeMode="center"
                        style={styles.image}
                        source={{ uri: name.photoUrl }}
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
                    <Text style={styles.nameUser}>{name.displayName}</Text>
                  </View>
                </TouchableOpacity>
              );
            })
          : (userVisible = false)}
        {!userVisible && (
          <Text style={{ textAlign: "center", fontWeight: "500" }}>
            No user's found
          </Text>
        )}
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    alignItems: "center",
    flex: 1,
  },
  container2: {
    flexDirection: "row",
    width: "100%",
    height: 75,
    padding: 10,
  },
  textInput: {
    width: 355,
    height: "auto",
    borderRadius: 20,
    padding: 10,
    margin: 10,
    backgroundColor: "grey",
    justifyContent: "space-between",
  },
  imgView: {
    borderRadius: 360,
    alignItems: "center",
    top: -3,
  },
  msgView: {
    left: 10,
  },
  nameUser: {
    fontWeight: "500",
    fontSize: 18,
  },
  image: {
    width: 60,
    height: 60,
    borderRadius: 360,
    alignSelf: "auto",
  },
});
export default UserFind;
