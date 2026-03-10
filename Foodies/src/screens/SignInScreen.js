import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Image,
  Text,
  TextInput,
  View,
} from "react-native";
import { firebase_auth } from "../firebaseConfig";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = firebase_auth;

  async function handleSignUp() {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      console.log(response);
      Alert.alert("Sign up success. User: " + email + " signed up.");
    } catch (error) {
      console.log(error.message);
      Alert.alert("Sign Up Error", error.message);
    }
  }

  async function handleSignIn() {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);

      Alert.alert("User: " + email + " signed in");
    } catch (error) {
      console.log(error.message);
      Alert.alert("Sign In Error", error.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Food From Home</Text>

      <View style={styles.inputContainer}>
        <Image
          style={styles.logo}
          source={require("../../assets/prettierBowl.png")}
        />
        <Text style={styles.inputHeader}>Email:</Text>
        <TextInput
          style={styles.input}
          keyboardType="email-address" // optimizes keyboard for email entry (@ symbol)
          value={email}
          onChangeText={setEmail} // updates state on every keystroke
          autoCapitalize="none" // important! Prevents auto-capitalizing the first letter of emails
        />
        {/* Password Input */}
        <Text style={styles.inputHeader}>Password:</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true} // hides text for security (dots/asterisks)
          value={password}
          onChangeText={setPassword}
        />
      </View>

      <View style={styles.buttonLogin}>
        <Button title="Sign In" onPress={handleSignIn} color={"#FFFFFF"} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="Sign Up" onPress={handleSignUp} color={"#FC8585"} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#F6EADB",
  },
  header: {
    fontSize: 36,
    marginBottom: 24,
    color: "#FC8585",
    textAlign: "center",
  },

  inputContainer: {
    display: "flex",
    justifyContent: "center",
    marginHorizontal: 56,
  },

  logo: {
    alignSelf: "center",
    width: 160,
    height: 160,
    resizeMode: "contain",
    paddingBottom: 24,
  },
  inputHeader: {
    fontSize: 16,
    marginBottom: 12,
    color: "#FC8585",
    textAlign: "left",
  },

  input: {
    marginBottom: 24,
    paddingBottom: 4,
    textAlign: "left",
    borderBottomWidth: 1,
  },
  buttonLogin: {
    marginTop: 24,
    textDecorationLines: "none",
    color: "#FFFFFF",
    backgroundColor: "#FC8585",
    marginHorizontal: 96,
    borderRadius: 99,
  },

  buttonContainer: {
    padding: 20,
  },
});
