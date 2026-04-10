// Firebase auth function
import { createUserWithEmailAndPassword } from "firebase/auth";

// React state hook
import { useState } from "react";

// React Native components
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

// Local storage
import AsyncStorage from "@react-native-async-storage/async-storage";

// Safe area handling
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase config
import { firebase_auth } from "../firebaseConfig";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Main screen component
export default function CreateAccountScreen({ navigation }) {
  const [favoriteCuisine, setFavoriteCuisine] = useState("Italian"); // cuisine state
  const [cookingSkill, setCookingSkill] = useState("Easy"); // skill state
  const [email, setEmail] = useState(""); // email input
  const [password, setPassword] = useState(""); // password input

  // options for selection
  const cuisineOptions = ["Italian", "Japanese", "Chinese", "Mexican", "Greek"];
  const skillOptions = ["Easy", "Medium", "Hard"];

  // create account + save preferences
  async function handleCreateAccount() {
    try {
      // basic validation
      if (!email.trim() || !password.trim()) {
        Alert.alert("Missing Info", "Please enter an email and password.");
        return;
      }

      // create Firebase user
      const userCredential = await createUserWithEmailAndPassword(
        firebase_auth,
        email,
        password
      );

      const uid = userCredential.user.uid; // get user ID

      // save preferences locally per user
      await AsyncStorage.setItem(`selectedCuisine_${uid}`, favoriteCuisine);
      await AsyncStorage.setItem(`selectedDifficulty_${uid}`, cookingSkill);

      Alert.alert("Account created", "Your preferences have been saved.");
    } catch (error) {
      console.log(error.message);
      Alert.alert("Create Account Error", error.message);
    }
  }

  return (
    // safe area wrapper
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      {/* dismiss keyboard when tapping outside */}
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        {/* adjust layout when keyboard is open */}
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
            {/* back button */}
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={22} color="#F48F92" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>

            {/* main card */}
            <View style={styles.card}>
              <Text style={styles.header}>Create Account</Text>
              <Text style={styles.subtext}>
                Tell us a little about your cooking style.
              </Text>

              {/* cuisine selection */}
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

              {/* skill selection */}
              <Text style={styles.label}>How good are you at cooking?</Text>
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

              {/* email input */}
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

              {/* password input */}
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

              {/* submit button */}
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
    </SafeAreaView>
  );
}

// styles for layout and UI
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
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    width: "100%",
    maxWidth: 460,
    marginBottom: 12,
  },
  backText: {
    color: "#F48F92",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 2,
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