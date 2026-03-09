import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { db } from "../firebaseConfig.js";
import { Picker } from "@react-native-picker/picker";

export default function HomeScreen({ navigation }) {
  const [cuisine, setCuisine] = useState("Italian");

  const getRecipe = async () => {
    try {
      const searchResponse = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisine}&number=1&apiKey=6d32bba489f444f292a99e602a3f0b79`
      );

      const searchData = await searchResponse.json();

      if (!searchData.results || searchData.results.length === 0) {
        Alert.alert("No recipe found");
        return;
      }

      const recipeId = searchData.results[0].id;

      const infoResponse = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=6d32bba489f444f292a99e602a3f0b79`
      );

      const recipe = await infoResponse.json();

      // Save recipe into Firestore
      await setDoc(doc(db, "recipes", recipeId.toString()), {
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        cuisine: cuisine,
        readyInMinutes: recipe.readyInMinutes,
        servings: recipe.servings,
        summary: recipe.summary,
        instructions: recipe.instructions || "",
        ingredients:
          recipe.extendedIngredients?.map((item) => ({
            id: item.id,
            name: item.name,
            original: item.original,
            amount: item.amount,
            unit: item.unit,
          })) || [],
        createdAt: serverTimestamp(),
      });

      navigation.navigate("DishIntro", { recipe });
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Could not fetch or save recipe.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foodies</Text>

      <Text style={styles.label}>Select Cuisine</Text>

      <Picker
        selectedValue={cuisine}
        onValueChange={(itemValue) => setCuisine(itemValue)}
        style={{ width: 200 }}
      >
        <Picker.Item label="Italian" value="Italian" />
        <Picker.Item label="Japanese" value="Japanese" />
        <Picker.Item label="Chinese" value="Chinese" />
        <Picker.Item label="Mexican" value="Mexican" />
        <Picker.Item label="Korean" value="Korean" />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={getRecipe}>
        <Text style={styles.buttonText}>Make Food</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
  },

  label: {
    fontSize: 16,
    marginTop: 10,
  },

  button: {
    marginTop: 30,
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
});