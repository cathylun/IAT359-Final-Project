// Firebase sign-in function
import { signInWithEmailAndPassword } from "firebase/auth";

// React state hook
import { useState } from "react";

// React Native components
import {
  Alert,
  Image,
  Text,
  TextInput,
  View,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";

// Safe area handling
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase config
import { firebase_auth } from "../firebaseConfig";

// Main screen component
export default function SignInScreen({ navigation }) {
  const [email, setEmail] = useState(""); // email input
  const [password, setPassword] = useState(""); // password input

  // handle sign-in
  async function handleSignIn() {
    try {
      // authenticate user
      await signInWithEmailAndPassword(firebase_auth, email, password);
      Alert.alert("Sign in success", `User: ${email} signed in.`);
    } catch (error) {
      console.log(error.message);
      Alert.alert("Sign In Error", error.message);
    }
  }

  return (
    // safe area wrapper
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* dismiss keyboard on outside tap */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* adjust UI when keyboard opens */}
        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          {/* scrollable content */}
          <ScrollView
            contentContainerStyle={styles.scrollContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
            contentInsetAdjustmentBehavior="automatic"
          >
            <View style={styles.card}>
              {/* app logo */}
              <Image
                style={styles.logo}
                source={require("../gif/maindude.png")}
              />

              {/* title + description */}
              <Text style={styles.header}>Food From Home</Text>
              <Text style={styles.subtext}>
                Sign in to keep cooking with your saved preferences and dishes.
              </Text>

              {/* email input */}
              <Text style={styles.inputHeader}>Email</Text>
              <TextInput
                style={styles.input}
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                placeholder="Enter your email"
                placeholderTextColor="#b9a8a8"
              />

              {/* password input */}
              <Text style={styles.inputHeader}>Password</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                placeholder="Enter your password"
                placeholderTextColor="#b9a8a8"
              />

              {/* sign-in button */}
              <TouchableOpacity style={styles.signInButton} onPress={handleSignIn}>
                <Text style={styles.signInButtonText}>Sign In</Text>
              </TouchableOpacity>

              {/* navigate to create account */}
              <TouchableOpacity
                style={styles.createAccountButton}
                onPress={() => navigation.navigate("CreateAccount")}
              >
                <Text style={styles.createAccountText}>Create Account</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
}

// styles for UI
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6EADB",
  },
  flex: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  card: {
    width: "100%",
    maxWidth: 460,
    alignSelf: "center",
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  logo: {
    alignSelf: "center",
    width: 240,
    height: 130,
    resizeMode: "contain",
    marginBottom: 10,
  },
  header: {
    fontSize: 34,
    fontWeight: "bold",
    color: "#FC8585",
    textAlign: "center",
    marginBottom: 8,
  },
  subtext: {
    fontSize: 14,
    color: "#9e7f7f",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  inputHeader: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FC8585",
    marginBottom: 8,
    marginTop: 10,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#f1d6d6",
    marginBottom: 14,
    color: "#333",
  },
  signInButton: {
    marginTop: 14,
    backgroundColor: "#FC8585",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  signInButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
  createAccountButton: {
    marginTop: 14,
    alignItems: "center",
    paddingVertical: 10,
  },
  createAccountText: {
    color: "#c46a6a",
    fontSize: 16,
    fontWeight: "600",
  },
});