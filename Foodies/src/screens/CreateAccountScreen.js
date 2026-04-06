import { createUserWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase_auth } from "../firebaseConfig";

export default function CreateAccountScreen({ navigation }) {
  const [favoriteCuisine, setFavoriteCuisine] = useState("Italian");
  const [cookingSkill, setCookingSkill] = useState("Easy");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = firebase_auth;

  const cuisineOptions = ["Italian", "Japanese", "Chinese", "Mexican", "Greek"];
  const skillOptions = ["Easy", "Medium", "Hard"];

  async function handleCreateAccount() {
    try {
      if (!email.trim() || !password.trim()) {
        Alert.alert("Missing Info", "Please enter an email and password.");
        return;
      }

      await AsyncStorage.setItem("selectedCuisine", favoriteCuisine);
      await AsyncStorage.setItem("selectedDifficulty", cookingSkill);

      await createUserWithEmailAndPassword(auth, email, password);

      Alert.alert("Account created", "Your preferences have been saved.");
    } catch (error) {
      console.log(error.message);
      Alert.alert("Create Account Error", error.message);
    }
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.navigate("SignIn")}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.card}>
            <Text style={styles.header}>Create Account</Text>
            <Text style={styles.subtext}>
              Tell us a little about your cooking style.
            </Text>

            <Text style={styles.label}>What kind of cuisine do you like?</Text>
            <View style={styles.optionsContainer}>
              {cuisineOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    favoriteCuisine === option && styles.selectedOption,
                  ]}
                  onPress={() => setFavoriteCuisine(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      favoriteCuisine === option && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>What difficulty do you want to cook in?</Text>
            <View style={styles.optionsContainer}>
              {skillOptions.map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    cookingSkill === option && styles.selectedOption,
                  ]}
                  onPress={() => setCookingSkill(option)}
                >
                  <Text
                    style={[
                      styles.optionText,
                      cookingSkill === option && styles.selectedOptionText,
                    ]}
                  >
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholder="Enter your email"
              placeholderTextColor="#b9a8a8"
            />

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              placeholder="Enter your password"
              placeholderTextColor="#b9a8a8"
            />

            <TouchableOpacity
              style={styles.doneButton}
              onPress={handleCreateAccount}
            >
              <Text style={styles.doneButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: "#F6EADB",
  },

  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
  },

  backButton: {
    alignSelf: "flex-start",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },

  backButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#c46a6a",
  },

  card: {
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },

  header: {
    fontSize: 32,
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
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FC8585",
    marginBottom: 10,
    marginTop: 14,
  },

  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 8,
  },

  optionButton: {
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#f1d6d6",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 10,
    marginBottom: 10,
  },

  selectedOption: {
    backgroundColor: "#FC8585",
    borderColor: "#FC8585",
  },

  optionText: {
    color: "#555",
    fontSize: 15,
    fontWeight: "600",
  },

  selectedOptionText: {
    color: "#ffffff",
  },

  input: {
    backgroundColor: "#ffffff",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#f1d6d6",
    marginBottom: 12,
    color: "#333",
  },

  doneButton: {
    marginTop: 20,
    backgroundColor: "#FC8585",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },

  doneButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "bold",
  },
});