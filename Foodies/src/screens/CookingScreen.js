import { useState } from "react";
import { View, Text, TouchableOpacity, Image, StyleSheet } from "react-native";

export default function CookingScreen({ route, navigation }) {
  const { recipe } = route.params;
  const steps = recipe.analyzedInstructions[0]?.steps || [];
  // Extract steps safely, if the recipe does not contain instructions, use an empty array instead


  const [stepIndex, setStepIndex] = useState(0);
  const currentStep = steps[stepIndex] || { step: "" };
  const cleanText = currentStep.step.replace(/Step\s*\d+:\s*/i, "");
  // Clean text such remove "Step X:" if present

  // GIF mapping based on keywords
  const actionGifs = [
    { keyword: "slice", gif: require("../gif/cutting.gif") },
    { keyword: "cut", gif: require("../gif/cutting.gif") },
    { keyword: "chop", gif: require("../gif/cutting.gif") },
    { keyword: "oven", gif: require("../gif/putinoven.gif") },
    { keyword: "preheat", gif: require("../gif/preheat.gif") },
    { keyword: "sit", gif: require("../gif/sit.gif") },
    { keyword: "boil", gif: require("../gif/boil.gif") },
    { keyword: "add", gif: require("../gif/adding.gif") },
    { keyword: "mix", gif: require("../gif/whisk.gif") },
    { keyword: "stir", gif: require("../gif/stir.gif") },
    { keyword: "sauce", gif: require("../gif/sauce.gif") },
  ];

  const getGifForStep = (stepText) => {
    const lower = stepText.toLowerCase();

    for (let action of actionGifs) {
      if (lower.includes(action.keyword)) {
        return { source: action.gif, style: styles.gifImage };
      }
    }    // Function to choose appropriate GIF based on step text and
    // check if any keyword matches the step 

    return { source: require("../gif/maindude.png"), style: styles.mainImage };
    // Default image of application logo if no keyword is matched
  };

  if (!currentStep) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No steps available for this recipe.</Text>
      </View>
    );
  }    // If no current step available, display a message to the user.

  const imageData = getGifForStep(cleanText);
  // Call the function to get the correct image or GIF for the current step.

  const goPrevious = () => {
    if (stepIndex > 0) setStepIndex(stepIndex - 1);
  };

  const handleNext = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      navigation.navigate("Camera"); 
    }
  };  // Move to the next cooking step, if the user is already on the last step, 
  // navigate to the Camera screen instead.

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Step {currentStep.number}</Text>
      <Text style={styles.stepText}>{cleanText}</Text>
      <Image source={imageData.source} style={imageData.style} />

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.navButton, stepIndex === 0 && styles.disabledButton]}
          onPress={goPrevious}
          disabled={stepIndex === 0}
        >
          <Text style={styles.nextButtonText}>Previous Step</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextButtonText}>
            {stepIndex < steps.length - 1 ? "Next Step" : "Take Photo"}
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.backHomeButton}
        onPress={() =>
          navigation.navigate("ProtectedArea", { screen: "HomeScreen" })
        }
      >
        <Text style={styles.backHomeText}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB",
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  stepText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: "center",
  },
  gifImage: {
    width: 100,
    height: 100,
    marginBottom: 30,
  },
  mainImage: {
    width: 60,
    height: 60,
    marginBottom: 30,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  navButton: {
    backgroundColor: "#874a4aff",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  nextButton: {
    backgroundColor: "#F48F92",
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    marginBottom: 15,
  },
  nextButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  backHomeButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#C96C70",
  },
  backHomeText: {
    color: "#C96C70",
    fontSize: 16,
    fontWeight: "bold",
  },
});
