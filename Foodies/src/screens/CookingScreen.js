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
      return {
        source: action.gif,
        style: styles.gifImage,
      };
    }
  }

  return {
    source: require("../gif/maindude.png"),
    style: styles.mainImage,
  };
};

  return (
    <ScrollView style={styles.container}> 

      <Text style={styles.title}>
        Cooking Steps
      </Text>

      {steps.map((step) => {
        const cleanText = step.step.replace(/Step\s*\d+:\s*/i, "");
      const imageData = getGifForStep(cleanText);


        return (
          <View key={step.number} style={{ marginTop: 15 }}>
            
          <Text style={styles.step}>
            {cleanText}
          </Text>

          <Image
            source={imageData.source}
            style={imageData.style}
          />
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
  stepContainer: {
  marginTop: 15,
  },
  gifImage: {
    width: 80,
    height: 80,
    marginTop: 5,
    alignSelf: "center",

  },

  mainImage: {
    width: 50,
    height: 50,
    marginTop: 10,
    alignSelf: "center",
    marginBottom: -10,
  },
});
