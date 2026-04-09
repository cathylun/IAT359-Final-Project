import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

// Main screen component for showing recipe introduction
export default function DishIntroScreen({ route, navigation }) {
  const { recipe } = route.params;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()} // Navigate back to previous screen
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#F48F92" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.imageCard}>
        <Image source={{ uri: recipe.image }} style={styles.image} />
      </View>
      {/*  Recipe image display from API */}

      <View style={styles.contentCard}>
        <Text style={styles.tag}>
          {recipe.cuisine || "Cuisine"} • {recipe.difficulty || "Difficulty"}
        </Text>
      {/* show recipe cuisine section + difficulty level,
      if not show Cuisine and Difficulty word*/}

        <Text style={styles.summaryText}>
          {recipe.summary || "No summary available."}
        </Text>
        {/* Recipe description/summary, fallback if missing*/}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Ingredients", { recipe })}
        >
          <Text style={styles.buttonText}>Check Ingredients</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },

  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 30,
  },

  topBar: {
    marginBottom: 12,
  },

  backButton: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
  },

  backText: {
    color: "#F48F92",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 2,
  },

  imageCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 12,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  image: {
    width: "100%",
    height: 240,
    borderRadius: 18,
  },

  contentCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  tag: {
    fontSize: 14,
    fontWeight: "600",
    color: "#C96C70",
    marginBottom: 10,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2B2B2B",
    marginBottom: 14,
    lineHeight: 34,
  },

  summaryText: {
    fontSize: 16,
    color: "#5A4E4E",
    lineHeight: 24,
  },

  button: {
    marginTop: 24,
    backgroundColor: "#F48F92",
    paddingVertical: 17,
    borderRadius: 18,
    alignItems: "center",
  },

  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
});
