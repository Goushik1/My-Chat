import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Button,
  Modal,
  TextInput,
  Image,
  TouchableWithoutFeedback,
} from "react-native";
import React, { useContext, useEffect, useState } from "react";
import MessageCard from "../components/MessageCard";
import { signOut, updateProfile } from "firebase/auth";
import { auth, db, storage } from "../firebase";
import { StateContext } from "../StateProvider";
import { MaterialIcons } from "@expo/vector-icons";
import { Entypo } from "@expo/vector-icons";
import { doc, onSnapshot, updateDoc } from "firebase/firestore";
import UserFind from "../components/UserFind";
import * as ImagePicker from "expo-image-picker";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = ({ navigation }) => {
  const { userState, setUserState } = useContext(StateContext);
  const [modalVisible1, setModalVisible1] = useState(false);
  const [modalVisible2, setModalVisible2] = useState(false);
  const [image, setImage] = useState(null);
  const [profile, setProfile] = useState(null);

  const signout = async () => {
    try {
      await AsyncStorage.removeItem(userState.user.email);
    } catch (err) {
      console.log(err);
    }
    signOut(auth).then(() => {
      navigation.navigate("LoginScreen");
      setUserState(null);
    });
  };

  const openGallery = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };
  const deleteProfile = async () => {
    try {
      await updateProfile(auth.currentUser, {
        photoURL: null,
      }),
        await updateDoc(doc(db, "users", userState.user.uid), {
          photoUrl: null,
        });
    } catch (err) {
      console.log(err);
    }
  };
  const upload = async () => {
    try {
      const res = await fetch(image);
      const blob = await res.blob();
      const storageRef = ref(storage, "images/" + userState.user.email);
      const snapshot = await uploadBytes(storageRef, blob);
      const url = await getDownloadURL(snapshot.ref);

      await updateProfile(auth.currentUser, {
        photoURL: url,
      });

      await updateDoc(doc(db, "users", userState.user.uid), {
        photoUrl: url,
      });

      setProfile(url);
      setImage(null);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (auth.currentUser) {
      const unsubscribe = onSnapshot(
        doc(db, "users", auth.currentUser.uid),
        (docSnapshot) => {
          const data = docSnapshot.data();
          if (data) {
            setProfile(data.photoUrl);
          }
        },
        (error) => console.log(error)
      );

      return () => unsubscribe();
    }
  }, [profile]);

  return (
    <View style={styles.container}>
      <Modal
        visible={modalVisible1}
        animationType="slide"
        onRequestClose={() => {
          setModalVisible1(!modalVisible1);
        }}
      >
        <UserFind
          setModalVisible={setModalVisible1}
          modalVisible={modalVisible1}
        />
      </Modal>

      <Modal
        transparent={true}
        animationType="slide"
        visible={modalVisible2}
        onRequestClose={() => setModalVisible2(!modalVisible2)}
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible2(false)}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <View style={styles.profileText}>
                <Text style={{ fontWeight: "500", fontSize: 20 }}>
                  Profile Pic
                </Text>
                <TouchableOpacity
                  onPress={() => setModalVisible2(!modalVisible2)}
                >
                  <Entypo name="cross" size={24} color="black" />
                </TouchableOpacity>
              </View>
              <View style={styles.profileLogo}>
                <TouchableOpacity
                  style={styles.accessLogo}
                  onPress={() => openGallery()}
                >
                  <MaterialIcons name="photo-library" size={32} color="black" />
                  <Text>Gallery</Text>
                </TouchableOpacity>
                {image ? (
                  <TouchableOpacity
                    style={styles.accessLogo}
                    onPress={() => upload()}
                  >
                    <MaterialIcons name="upload" size={32} color="black" />
                    <Text>Upload</Text>
                  </TouchableOpacity>
                ) : (
                  <></>
                )}

                <TouchableOpacity
                  style={styles.accessLogo}
                  onPress={() => deleteProfile()}
                >
                  <MaterialIcons name="delete" size={32} color="black" />
                  <Text>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <View style={styles.topView}>
        <View>
          <Text style={styles.topTxt}>MyChat</Text>
          <TouchableOpacity onPress={signout}>
            <Text>signout</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.searchProfile}>
          <TouchableOpacity
            style={styles.rightLogoV}
            onPress={() => setModalVisible1(true)}
          >
            <MaterialIcons name="search" size={28} color="black" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imgView}
            onPress={() => setModalVisible2(true)}
          >
            {profile ? (
              <Image
                resizeMode="center"
                style={styles.image}
                source={{ uri: profile }}
              />
            ) : (
              <Image
                resizeMode="center"
                style={styles.image}
                source={require("../assets/dummy-profile-pic.png")}
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
      <ScrollView style={styles.msgView}>
        <MessageCard displayName={userState?.user.displayName} />
      </ScrollView>
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: 43,
    height: 43,
    borderRadius: 360,
    alignSelf: "auto",
  },
  topView: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "lightgrey",
    width: "100%",
    height: 90,
    paddingTop: 38,
    paddingHorizontal: 15,
  },
  topTxt: {
    fontSize: 22,
  },
  rightLogoV: {
    margin: 10,
  },
  msgView: {
    width: "100%",
  },
  textInput: {
    width: 355,
    height: "auto",
    borderRadius: 20,
    padding: 10,
    backgroundColor: "grey",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  imgView: {
    borderRadius: 360,
  },
  searchProfile: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalBackground: {
    flex: 1,
  },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    backgroundColor: "lightgrey",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  profileLogo: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 30,
  },
  accessLogo: {
    alignItems: "center",
  },
  profileText: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
});
export default HomeScreen;
