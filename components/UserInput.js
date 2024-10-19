import { View, TextInput, StyleSheet } from "react-native";
import React, { useEffect, useState } from "react";

const UserInput = ({
  placeHolder,
  setUser,
  name,
  evalid,
  setEvalid,
  secureText,
}) => {
  const [valid, setValid] = useState(false);
  useEffect(() => {
    if (placeHolder === "Email") {
      const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      const isEmailValid = emailPattern.test(name);
      setValid(isEmailValid);
      setEvalid(isEmailValid);
    }
  }, [placeHolder, setUser, name]);

  return (
    <View style={styles.container}>
      <TextInput
        placeholder={placeHolder}
        onChangeText={setUser}
        secureTextEntry={secureText}
        value={name}
        style={
          placeHolder === "Email" && !valid && !evalid && name.length > 1
            ? styles.inputBox2
            : styles.inputBox1
        }
      />
    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  inputBox1: {
    borderWidth: 1,
    borderRadius: 11,
    borderColor: "grey",
    width: 285,
    height: 50,
    padding: 10,
    margin: 10,
  },
  inputBox2: {
    borderWidth: 1,
    borderRadius: 11,
    borderColor: "red",
    width: 285,
    height: 50,
    padding: 10,
    margin: 10,
  },
});
export default UserInput;
