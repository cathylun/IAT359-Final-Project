import { signInWithEmailAndPassword } from "firebase/auth";
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

export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = firebase_auth;

  async function handleSignIn() {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      Alert.alert("Sign in success", `User: ${email} signed in.`);
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
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
        />

        <Text style={styles.inputHeader}>Password:</Text>
        <TextInput
          style={styles.input}
          secureTextEntry={true}
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
        />
      </View>

      <View style={styles.buttonLogin}>
        <Button title="Sign In" onPress={handleSignIn} color="#FFFFFF" />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="Create Account"
          onPress={() => navigation.navigate("CreateAccount")}
          color="#FC8585"
        />
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
    backgroundColor: "#FC8585",
    marginHorizontal: 96,
    borderRadius: 99,
  },

  buttonContainer: {
    padding: 20,
  },
});