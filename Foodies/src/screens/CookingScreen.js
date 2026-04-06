import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Image } from "react-native";

export default function CookingScreen({ route, navigation }) {
  const { recipe } = route.params;
  const steps = recipe.analyzedInstructions[0]?.steps || [];
  // get cooking steps, if nothing there than use empty array
  
  const actionGifs = [
  { keyword: "slice", gif: require("../gif/cutting.gif") },
  { keyword: "cut", gif: require("../gif/cutting.gif") },
  { keyword: "chop", gif: require("../gif/cutting.gif") },

  // { keyword: "boil", gif: require("../gif/cutting.gif") },
  // { keyword: "simmer", gif: require("../gif/cutting.gif") },
  // { keyword: "steam", gif: require("../gif/cutting.gif") },

  { keyword: "oven", gif: require("../gif/putinoven.gif") },
  { keyword: "preheat", gif: require("../gif/preheat.gif") },

  { keyword: "sit", gif: require("../gif/sit.gif") },



  { keyword: "whisk", gif: require("../gif/whisk.gif") },



  ];

  const getGifForStep = (stepText) => {
  const lower = stepText.toLowerCase();

  for (let action of actionGifs) {
    if (lower.includes(action.keyword)) {
      return action.gif;
    }
  }

  return null;
};
  return (
    <ScrollView style={styles.container}> 

      <Text style={styles.title}>
        Cooking Steps
      </Text>

      {steps.map((step) => {
        const cleanText = step.step.replace(/Step\s*\d+:\s*/i, "");
        const gif = getGifForStep(cleanText);

        return (
          <View key={step.number} style={{ marginTop: 15 }}>
            
          <Text style={styles.step}>
            Step {step.number}: {cleanText}
          </Text>

            {gif && (
              <Image
                source={gif}
                style={{ width: 120, height: 120, marginTop: 5 }}
              />
            )}

          </View>
        );
      })}

      {/* loop through each step and display */}
      <TouchableOpacity
        style={styles.photoButton}
        onPress={() => navigation.navigate("Camera")}
      >
        <Text style={styles.buttonText}>Take Photo</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.homeButton}
        onPress={() => navigation.navigate("ProtectedArea", { screen: "Home" })}
      >
        <Text style={styles.buttonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F6E9DB",
  },

  title: {
    fontSize: 22,
    fontWeight: "bold",
  },

  step: {
    marginTop: 15,
    fontSize: 16,
  },

  photoButton: {
    marginTop: 30,
    backgroundColor: "#874a4aff",
    padding: 15,
    borderRadius: 10,
  },

  homeButton: {
    marginTop: 15,
    backgroundColor: "#FB8989",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});
