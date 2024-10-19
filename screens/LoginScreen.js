import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import UserInput from "../components/UserInput";
import { useContext, useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { StateContext } from "../StateProvider";
import { doc, setDoc } from "firebase/firestore";
const LoginScreen = ({ navigation }) => {
  const { userState, setUserState } = useContext(StateContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [evalid, setEvalid] = useState(true);
  const d = () => {
    navigation.navigate("Dummy");
  };
  const login = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then((cred) => {
        setDoc(doc(db, "users", cred.user.uid), {
          displayName: cred.user.displayName,
          email: cred.user.email,
          uid: cred.user.uid,
          photoUrl: cred.user.photoURL,
        });
        setUserState({
          user: {
            email: cred.user.email,
            displayName: cred.user.displayName,
            uid: cred.user.uid,
            photoUrl: cred.user.photoURL,
          },
          providerData: {
            email: cred.user.providerData[0].email,
            uid: cred.user.uid,
          },
        });
        console.log(cred.user);
        setEmail("");
        setPassword("");
        navigation.navigate("HomeScreen");
      })
      .catch((err) => {
        console.log(err.message);
        setEvalid(false);
      });
  };

  return (
    <View style={styles.container}>
      <View style={styles.container1}>
        <View style={styles.logView}>
          <Text style={styles.logText}>Login</Text>
        </View>
        {!evalid && email.length > 1 ? (
          <Text>Enter a valid Email & Password</Text>
        ) : null}
        <UserInput
          placeHolder={"Email"}
          setUser={setEmail}
          name={email}
          evalid={evalid}
          setEvalid={setEvalid}
          secureKey={false}
        />
        <UserInput
          placeHolder={"Password"}
          setUser={setPassword}
          name={password}
          secureKey={true}
        />
        <TouchableOpacity onPress={() => login()}>
          <Text style={styles.loginButton}>Login</Text>
        </TouchableOpacity>

        <Text>Don't have an account?</Text>
        <TouchableOpacity onPress={() => navigation.navigate("SignUpScreen")}>
          <Text style={styles.createOne}>Create one</Text>
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
  container1: {
    top: 200,
    alignItems: "center",
    justifyContent: "center",
  },
  logView: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
    margin: 10,
  },
  logText: {
    fontSize: 20,
  },
  createOne: {
    fontWeight: "500",
  },

  loginButton: {
    color: "white",
    width: 280,
    height: 40,
    textAlign: "center",
    backgroundColor: "grey",
    borderRadius: 11,
    textAlignVertical: "center",
  },
});
export default LoginScreen;
