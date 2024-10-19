import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import UserInput from "../components/UserInput";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import React, { useContext, useEffect, useState } from "react";
import { StateContext } from "../StateProvider";
import { collection, doc, getDocs, setDoc } from "firebase/firestore";
const SignUpScreen = ({ navigation }) => {
  const { userState, setUserState } = useContext(StateContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [evalid, setEvalid] = useState(true);
  const [users, setUsers] = useState(null);
  const [alreadyExists, setAlreadyExists] = useState(false);
  const [show, setShow] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passError, setPassError] = useState(null);
  useEffect(() => {
    getDocs(collection(db, "users")).then((d) => {
      setUsers(d.docs.map((doc) => doc.data()));
    });
  }, []);
  useEffect(() => {
    setTimeout(() => {
      setEmailError("");
    }, 4000);
  }, [emailError]);
  useEffect(() => {
    if (password.length > 5) {
      setPassError("");
    }
  }, [password]);
  const signUp = () => {
    const founded = users?.find((data) => data.displayName === displayName);
    if (founded) {
      setAlreadyExists(true);
      setShow(true);
    } else {
      setAlreadyExists(false);
      createUserWithEmailAndPassword(auth, email, password)
        .then((cred) => {
          setEmail("");
          setPassword("");
          setDoc(doc(db, "userChats", cred.user.uid), {});
          setDoc(doc(db, "users", cred.user.uid), {
            displayName: displayName,
            email: cred.user.email,
            uid: cred.user.uid,
            photoUrl: cred.user.photoURL,
          });
          updateProfile(cred.user, {
            displayName: displayName,
          })
            .then(() => {
              setDisplayName("");
              const user = auth.currentUser;

              setUserState({
                user: {
                  email: user.email,
                  displayName: user.displayName,
                  uid: user.uid,
                  photoUrl: cred.user.photoURL,
                },
                providerData: {
                  email: user.providerData[0].email,
                  uid: user.providerData[0].uid,
                },
              });
              navigation.navigate("HomeScreen");
            })
            .catch((err) => console.log(err));
        })
        .catch((err) => {
          if (err.message == "Firebase: Error (auth/email-already-in-use).") {
            setEmailError("Email already exists");
          } else if (
            err.message ==
            "Firebase: Password should be at least 6 characters (auth/weak-password)."
          ) {
            setPassError("Password should be at least 6 characters");
          } else if (err.message == "Firebase: Error (auth/invalid-email).") {
            setEmailError("Enter a valid Email");
            setPassError("Enter a password");
          } else if (
            err.message == "Firebase: Error (auth/missing-password)."
          ) {
            setPassError("Enter a password");
          }
          console.log(err.message);
        });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.container1}>
        <View style={styles.signUpView}>
          <Text style={styles.signUpText}>SignUp</Text>
        </View>

        <UserInput
          placeHolder={"UserName"}
          setUser={setDisplayName}
          name={displayName}
        />
        {alreadyExists && (
          <Text style={styles.alerts1}>UserName already exists</Text>
        )}
        {!alreadyExists && show && (
          <Text style={styles.alerts2}>UserName available</Text>
        )}
        <UserInput
          placeHolder={"Email"}
          setUser={setEmail}
          name={email}
          evalid={evalid}
          setEvalid={setEvalid}
        />
        {emailError && <Text style={styles.alerts1}>{emailError}</Text>}
        <UserInput
          placeHolder={"Password"}
          setUser={setPassword}
          name={password}
        />
        {passError && <Text style={styles.alerts1}>{passError}</Text>}
        <View style={styles.signUpButton}>
          <TouchableOpacity onPress={() => signUp()}>
            <Text style={styles.signUpButtonText}>SignUp</Text>
          </TouchableOpacity>

          <Text>Already have an account?</Text>
          <TouchableOpacity onPress={() => navigation.navigate("LoginScreen")}>
            <Text style={styles.logText}>Login</Text>
          </TouchableOpacity>
        </View>
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
  signUpView: {
    width: "100%",
    flexDirection: "row",
    backgroundColor: "white",
    alignItems: "center",
    margin: 10,
  },
  alerts1: {
    fontSize: 12,
    color: "red",
    alignSelf: "flex-start",
    left: 13,
  },
  alerts2: {
    fontSize: 12,
    color: "green",
    alignSelf: "flex-start",
    left: 13,
  },
  signUpText: {
    fontSize: 20,
  },
  logText: {
    fontWeight: "500",
  },
  signUpButton: {
    top: 6,
    alignItems: "center",
  },
  signUpButtonText: {
    color: "white",
    width: 280,
    height: 40,
    textAlign: "center",
    backgroundColor: "grey",
    borderRadius: 11,
    textAlignVertical: "center",
  },
});
export default SignUpScreen;
