import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  Button,
} from "react-native";
import React, { useContext, useEffect, useRef, useState } from "react";
import {
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import {
  addDoc,
  setDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  query,
  orderBy,
  collection,
  arrayUnion,
  updateDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, colRef, db, storage } from "../firebase";
import { StateContext } from "../StateProvider";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

const ChatScreen = ({ navigation, route }) => {
  const { chatID, name, photoUrl, toEMail, userData } = route.params;
  const { userState, setUserState } = useContext(StateContext);
  const [chat, setChat] = useState("");
  const [fireChats, setFireChats] = useState([]);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [imagePath, setImagePath] = useState("");
  const [imageWH, setImageWH] = useState({ width: 0, height: 0 });
  const windowWidth = Dimensions.get("window").width;
  const windowHeight = Dimensions.get("window").height;
  const generateRandomKey = () => {
    return `${Math.random().toString(36)}-${Date.now()}`;
  };
  const formattedTimeStamp = (timeStamp) => {
    const time = timeStamp.toDate();
    let hours = time.getHours();
    const minutes = time.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const strMinutes = minutes < 10 ? "0" + minutes : minutes;
    const formattedTime = hours + ":" + strMinutes + " " + ampm;
    return formattedTime;
  };
  useEffect(() => {
    const quer = query(doc(db, "chats", chatID));
    const unsub = onSnapshot(quer, (d) => {
      setFireChats((prev) => [...prev, d.data()]);
    });
    return () => unsub();
  }, [chatID]);
  useEffect(() => {
    fireChats?.map((d) => setChats(d.messages));
    setLoading(false);
  }, [fireChats]);
  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
    });
    if (!result.canceled) {
      setImagePath(result.assets[0].uri);
      setModalVisible(true);
      Image.getSize(result.assets[0].uri, (width, height) => {
        setImageWH({ width, height }),
          (err) => {
            console.log(err);
          };
      });
    }
  };
  const sendPhoto = async () => {
    const img = await fetch(imagePath);
    const blog = await img.blob();
    const storageRef = ref(storage, "privateImgs/" + blog._data.name);
    console.log(blog);
    uploadBytes(storageRef, blog).then((snapshot) => {
      getDownloadURL(snapshot.ref).then((url) => {
        updateDoc(doc(db, "chats", chatID), {
          messages: arrayUnion({
            imgUrl: url,
            id: generateRandomKey(),
            time: formattedTimeStamp(Timestamp.now()),
            userID: userState.user.uid,
          }),
        });
      });
    });
    setModalVisible(!modalVisible);
  };
  const sendChat = async () => {
    if (chat.length == 0) {
      return;
    }
    try {
      await updateDoc(doc(db, "chats", chatID), {
        messages: arrayUnion({
          text: chat,
          id: generateRandomKey(),
          time: formattedTimeStamp(Timestamp.now()),
          userID: userState.user.uid,
        }),
      });
      setChat("");
      const timeFromChat = await getDoc(doc(db, "chats", chatID));
      const lastMsgTime = timeFromChat.data().messages.slice(-1)[0];
      const docSnap = await getDoc(doc(db, "userChats", userState.user.uid));
      const data = docSnap.data();
      const userInfoArray = data.userInfo;
      const docSnap2 = await getDoc(doc(db, "userChats", toEMail));
      const data2 = docSnap2.data();
      const userInfoArray2 = data2.userInfo;
      const updatedArray1 = userInfoArray.map((d) =>
        d.toName === name
          ? { ...d, lastMessage: chat, time: lastMsgTime.time }
          : d
      );
      const updatedArray2 = userInfoArray2.map((d) =>
        d.toName === userState.user.displayName
          ? { ...d, lastMessage: chat, time: lastMsgTime.time }
          : d
      );
      await updateDoc(doc(db, "userChats", userState.user.uid), {
        userInfo: updatedArray1,
      });
      await updateDoc(doc(db, "userChats", toEMail), {
        userInfo: updatedArray2,
      });
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "black",
          }}
        >
          {imagePath && (
            <Image
              source={{ uri: imagePath }}
              style={{
                width: imageWH.width,
                height: imageWH.height,
                maxWidth: windowWidth,
                maxHeight: windowHeight,
                resizeMode: "contain",
              }}
            />
          )}
          <TouchableOpacity
            onPress={() => {
              sendPhoto();
            }}
            style={{ position: "absolute", right: 15, bottom: 30 }}
          >
            <MaterialCommunityIcons
              name="send-circle"
              size={65}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </Modal>

      <View style={styles.topView}>
        <View style={styles.logoView}>
          <View style={styles.logoLeft}>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back-ios" size={24} color="black" />
            </TouchableOpacity>
            <View>
              {photoUrl ? (
                <Image
                  resizeMode="center"
                  style={styles.image}
                  source={{ uri: photoUrl }}
                />
              ) : (
                <Image
                  resizeMode="center"
                  style={styles.image}
                  source={require("../assets/dummy-profile-pic.png")}
                />
              )}
            </View>
            <View style={styles.nameView}>
              <Text style={styles.name}>{name}</Text>
            </View>
          </View>
          <View style={styles.logoRight}>
            <TouchableOpacity style={styles.rightLogoV}>
              <MaterialIcons name="search" size={28} color="black" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.rightLogoV}>
              <Ionicons name="menu" size={28} color="black" />
            </TouchableOpacity>
          </View>
        </View>
        <ActivityIndicator size={34} color={"black"} animating={loading} />
      </View>

      <View style={styles.chatView}>
        <ScrollView style={{ width: "100%" }}>
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
          >
            {chats?.map((value) =>
              value?.userID === userState.user.uid ? (
                <View style={styles.chatsViewSender} key={value.id}>
                  {value.text ? (
                    <Text>{value.text}</Text>
                  ) : (
                    <Image
                      source={{ uri: value.imgUrl }}
                      style={{
                        width: 200,
                        height: 200,
                      }}
                      resizeMode="contain"
                    />
                  )}
                  <View style={styles.senderTimeView}>
                    <Text style={styles.senderTime}>{value.time}</Text>
                  </View>
                </View>
              ) : (
                <View key={value.id} style={styles.chatsViewReceiver}>
                  {value.text ? (
                    <Text>{value.text}</Text>
                  ) : (
                    <Image
                      source={{ uri: value.imgUrl }}
                      style={{
                        width: 200,
                        height: 200,
                      }}
                      resizeMode="contain"
                    />
                  )}
                  <View style={styles.receiverTimeView}>
                    <Text style={styles.receiverTime}>{value.time}</Text>
                  </View>
                </View>
              )
            )}
          </KeyboardAvoidingView>
        </ScrollView>
      </View>
      <View accessible={true} style={styles.textInput}>
        <View style={{ flex: 1 }}>
          <TextInput
            placeholder="Start Chatting"
            onChangeText={setChat}
            value={chat}
            multiline
          />
        </View>
        <TouchableOpacity
          onPress={() => {
            openGallery();
          }}
          style={styles.photoLib}
        >
          <MaterialIcons name="photo-library" size={24} color="black" />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            sendChat();
          }}
        >
          <Ionicons name="send-sharp" size={24} color="black" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
  },
  topView: {
    backgroundColor: "lightgrey",
    width: "100%",
    height: 90,
  },
  logoView: {
    padding: 20,
    marginTop: 15,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  logoLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  nameView: {
    padding: 10,
  },
  name: {
    fontWeight: "500",
    fontSize: 18,
  },
  logoRight: {
    flexDirection: "row",
    alignItems: "center",
  },
  rightLogoV: {
    paddingLeft: 10,
  },
  image: {
    width: 45,
    height: 45,
    borderRadius: 360,
  },
  textInput: {
    width: 355,
    height: "auto",
    borderRadius: 20,
    padding: 10,
    backgroundColor: "grey",
    flexDirection: "row",
    position: "absolute",
    bottom: 20,
  },
  chatView: {
    width: "100%",
    height: 690,
    padding: 5,
  },
  chatsViewSender: {
    width: "auto",
    height: "auto",
    padding: 10,
    margin: 5,
    alignSelf: "flex-end",
    backgroundColor: "lightgray",
    borderRadius: 24,
  },
  senderTimeView: {
    justifyContent: "center",
  },
  receiverTimeView: {
    justifyContent: "center",
  },
  senderTime: {
    fontSize: 10,
  },
  receiverTime: {
    fontSize: 10,
  },
  chatsViewReceiver: {
    width: "auto",
    height: "auto",
    padding: 10,
    margin: 5,
    alignSelf: "flex-start",
    backgroundColor: "lightgray",
    borderRadius: 24,
  },
  chatContainer: {
    flex: 1,
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  photoLib: {
    marginRight: 10,
  },
});
export default ChatScreen;
