import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, Alert } from "react-native";
import { db } from "../firebaseConfig.js";
import { Picker } from "@react-native-picker/picker";

export default function HomeScreen({ navigation }) {

  const [cuisine, setCuisine] = useState("Italian");
  const [difficulty, setDifficulty] = useState("Easy");

  const getRecipe = async () => {

    try {
      let minTime, maxTime;

      if (difficulty === "Easy") {
        minTime = 0;
        maxTime = 20;
      } else if (difficulty === "Medium") {
        minTime = 21;
        maxTime = 40;
      } else {
        minTime = 41;
        maxTime = 120;
      }
      // set min and max time based on difficulty

      const searchResponse = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisine}&number=20&addRecipeInformation=true&apiKey=e9969f8d922447e49055c217f58185b2`
      );
      // fetch recipes from API based on selected cuisine
      const searchData = await searchResponse.json();
      if (!searchData.results || searchData.results.length === 0) {
        Alert.alert("No recipe found");
        return;
      }
      // if result does not exsit or is empty array , show alert

      const filteredRecipes = searchData.results.filter(
        (recipe) =>
          recipe.readyInMinutes >= minTime &&
          recipe.readyInMinutes <= maxTime
      );
      // keep only recipes which time falls within the selected difficulty range
      if (filteredRecipes.length === 0) {
        Alert.alert("No recipes match this difficulty");
        return;
      }

      const recipe =
        filteredRecipes[Math.floor(Math.random() * filteredRecipes.length)];
      // pick random recipe from filterd list
      const recipeId = recipe.id;
      //fetch full id

      const infoResponse = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=e9969f8d922447e49055c217f58185b2`
      );
      //second api for detail like ingredient,instructions
      const recipeData = await infoResponse.json();

      await setDoc(doc(db, "recipes", recipeId.toString()), {
        id: recipeData.id,
        title: recipeData.title,
        image: recipeData.image,
        cuisine: cuisine,
        difficulty: difficulty,
        readyInMinutes: recipeData.readyInMinutes,
        servings: recipeData.servings,
        summary: recipeData.summary,
        instructions: recipeData.instructions || "",
        ingredients:
          recipeData.extendedIngredients?.map((item) => ({
            id: item.id,
            name: item.name,
            original: item.original,
            amount: item.amount,
            unit: item.unit,
          })) || [],
        createdAt: serverTimestamp(),
      });

      navigation.navigate("DishIntro", { recipe: recipeData });

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

      <Text style={styles.label}>Select Difficulty</Text>

      <Picker
        selectedValue={difficulty}
        onValueChange={(itemValue) => setDifficulty(itemValue)}
        style={{ width: 200 }}
      >
        <Picker.Item label="Easy" value="Easy" />
        <Picker.Item label="Medium" value="Medium" />
        <Picker.Item label="Hard" value="Hard" />
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