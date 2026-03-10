import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

export default function CookingScreen({ route, navigation }) {

  const { recipe } = route.params;
  const steps = recipe.analyzedInstructions[0]?.steps || [];

  return (
    <ScrollView style={styles.container}>

      <Text style={styles.title}>
        Cooking Steps
      </Text>

      {steps.map((step) => (
        <Text key={step.number} style={styles.step}>
          Step {step.number}: {step.step}
        </Text>
      ))}

      <TouchableOpacity
        style={styles.photoButton}
        onPress={() => navigation.navigate("Camera")}
      >
        <Text style={styles.buttonText}>
          Take Photo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.buttonText}>
          Back to Home
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({

  container: {
    padding: 20
  },

  title: {
    fontSize: 22,
    fontWeight: "bold"
  },

  step: {
    marginTop: 15,
    fontSize: 16
  },

  photoButton: {
    marginTop: 30,
    backgroundColor: "#FF9500",
    padding: 15,
    borderRadius: 10
  },

  homeButton: {
    marginTop: 15,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold"
  }

});