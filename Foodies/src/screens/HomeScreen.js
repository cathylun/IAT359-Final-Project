import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
} from "react-native";
import { db, firebase_auth } from "../firebaseConfig.js";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";

export default function HomeScreen({ navigation }) {
  const [cuisine, setCuisine] = useState("Italian");
  const [difficulty, setDifficulty] = useState("Easy");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadSavedPreferences();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    savePreferences();
  }, [cuisine, difficulty, isLoaded]);

  const handleLogout = async () => {
    try {
      await signOut(firebase_auth);
      await AsyncStorage.removeItem("isLoggedIn");
      await AsyncStorage.removeItem("userEmail");
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Logout Error", "Could not log out.");
    }
  };

  const loadSavedPreferences = async () => {
    try {
      const savedCuisine = await AsyncStorage.getItem("selectedCuisine");
      const savedDifficulty = await AsyncStorage.getItem("selectedDifficulty");

      if (savedCuisine) setCuisine(savedCuisine);
      if (savedDifficulty) setDifficulty(savedDifficulty);
    } catch (error) {
      console.log("Error loading preferences:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const savePreferences = async () => {
    try {
      await AsyncStorage.setItem("selectedCuisine", cuisine);
      await AsyncStorage.setItem("selectedDifficulty", difficulty);
    } catch (error) {
      console.log("Error saving preferences:", error);
    }
  };

  const saveRecipeLocally = async (newRecipe) => {
    try {
      const existingRecipes = await AsyncStorage.getItem("savedRecipes");
      let recipesArray = existingRecipes ? JSON.parse(existingRecipes) : [];

      const alreadyExists = recipesArray.some(
        (recipe) =>
          recipe.id === newRecipe.id &&
          recipe.difficulty === newRecipe.difficulty
      );

      if (!alreadyExists) {
        recipesArray.push(newRecipe);
        await AsyncStorage.setItem("savedRecipes", JSON.stringify(recipesArray));
      }
    } catch (error) {
      console.log("Error saving recipe locally:", error);
    }
  };

  const getOfflineRecipe = async () => {
    try {
      const savedRecipes = await AsyncStorage.getItem("savedRecipes");
      const recipesArray = savedRecipes ? JSON.parse(savedRecipes) : [];

      const matchingRecipes = recipesArray.filter(
        (recipe) =>
          recipe.cuisine?.toLowerCase() === cuisine.toLowerCase() &&
          recipe.difficulty?.toLowerCase() === difficulty.toLowerCase()
      );

      if (matchingRecipes.length === 0) {
        Alert.alert(
          "Offline Mode",
          "You have no dishes cooked in this cuisine and difficulty for offline mode"
        );
        return null;
      }

      const randomRecipe =
        matchingRecipes[Math.floor(Math.random() * matchingRecipes.length)];

      return randomRecipe;
    } catch (error) {
      console.log("Error loading offline recipe:", error);
      return null;
    }
  };

  const openRecipe = (recipe) => {
    navigation.navigate("DishIntro", {
      recipe,
    });
  };

  const cuisines = [
    { name: "Italian", image: require("../img/Italy.png") },
    { name: "Japanese", image: require("../img/Japan.png") },
    { name: "Chinese", image: require("../img/China.png") },
    { name: "Mexican", image: require("../img/Mexico.png") },
    { name: "Greek", image: require("../img/Greek.png") },
  ];

  const getRecipe = async () => {
    try {
      const searchResponse = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`
      );

      const searchData = await searchResponse.json();

      if (!searchData.meals || searchData.meals.length === 0) {
        Alert.alert("No recipe found");
        return;
      }

      const recipe =
        searchData.meals[Math.floor(Math.random() * searchData.meals.length)];

      const recipeId = recipe.idMeal;

      const infoResponse = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
      );

      const infoData = await infoResponse.json();
      const recipeData = infoData.meals[0];

      const ingredients = [];

      for (let i = 1; i <= 20; i++) {
        const ingredient = recipeData[`strIngredient${i}`];
        const measure = recipeData[`strMeasure${i}`];

        if (ingredient && ingredient.trim() !== "") {
          ingredients.push({
            id: i,
            name: ingredient,
            measure: measure || "",
          });
        }
      }

      const instructionsText = recipeData.strInstructions || "";

      const stepsArray = instructionsText
        .split("\n")
        .filter((s) => s.trim() !== "")
        .map((s, index) => ({
          number: index + 1,
          step: s.trim(),
        }));

      const formattedRecipe = {
        id: recipeId,
        title: recipeData.strMeal,
        image: recipeData.strMealThumb,
        cuisine: cuisine,
        difficulty: difficulty,
        summary: `${recipeData.strMeal} is a ${recipeData.strArea} dish. Try making this ${difficulty.toLowerCase()} recipe at home.`,
        instructions: instructionsText,
        ingredients: ingredients,
        analyzedInstructions: [
          {
            steps: stepsArray,
          },
        ],
      };

      await setDoc(doc(db, "recipes", recipeId.toString()), {
        ...formattedRecipe,
        createdAt: serverTimestamp(),
      });

      await saveRecipeLocally(formattedRecipe);

      openRecipe(formattedRecipe);
    } catch (error) {
      console.log("Online fetch failed, trying offline recipe:", error);

      const offlineRecipe = await getOfflineRecipe();

      if (offlineRecipe) {
        Alert.alert(
          "Offline Mode",
          "Opening a saved dish from this cuisine and difficulty."
        );
        openRecipe(offlineRecipe);
      }
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Foodies</Text>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      <Text style={styles.label}>Select Cuisine</Text>
      <View style={styles.cuisineContainer}>
        {cuisines.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={[
              styles.cuisineButton,
              cuisine === item.name && styles.selectedCuisine,
            ]}
            onPress={() => setCuisine(item.name)}
          >
            <Image source={item.image} style={styles.image} />
            <Text style={styles.cuisineText}>{item.name}</Text>
          </TouchableOpacity>
        ))}
      </View>

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
    backgroundColor: "#F6E9DB",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 28,
    marginBottom: 20,
    fontWeight: "bold",
  },

  label: {
    fontSize: 16,
    marginTop: 10,
    marginBottom: 8,
  },

  button: {
    marginTop: 30,
    backgroundColor: "#FB8989",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },

  logoutButton: {
    position: "absolute",
    top: 60,
    right: 20,
    backgroundColor: "#c46a6a",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
  },

  logoutText: {
    color: "white",
    fontWeight: "bold",
  },

  cuisineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginTop: 10,
  },

  cuisineButton: {
    padding: 12,
    margin: 8,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    alignItems: "center",
    minWidth: 90,
  },

  selectedCuisine: {
    borderWidth: 3,
    borderColor: "#c46a6a",
    backgroundColor: "#FB8989",
  },

  cuisineText: {
    marginTop: 4,
  },

  image: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 5,
  },
});