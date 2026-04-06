import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  Image,
  ScrollView,
} from "react-native";
import { db, firebase_auth } from "../firebaseConfig.js";
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

  const getUserRecipesKey = () => {
    const user = firebase_auth.currentUser;
    if (!user) return null;
    return `savedRecipes_${user.uid}`;
  };

  const getUserCuisineKey = () => {
    const user = firebase_auth.currentUser;
    if (!user) return null;
    return `selectedCuisine_${user.uid}`;
  };

  const getUserDifficultyKey = () => {
    const user = firebase_auth.currentUser;
    if (!user) return null;
    return `selectedDifficulty_${user.uid}`;
  };

  const handleLogout = async () => {
    try {
      await signOut(firebase_auth);
    } catch (error) {
      console.log("Logout error:", error);
      Alert.alert("Logout Error", "Could not log out.");
    }
  };

  const loadSavedPreferences = async () => {
    try {
      const cuisineKey = getUserCuisineKey();
      const difficultyKey = getUserDifficultyKey();

      if (!cuisineKey || !difficultyKey) {
        setIsLoaded(true);
        return;
      }

      const savedCuisine = await AsyncStorage.getItem(cuisineKey);
      const savedDifficulty = await AsyncStorage.getItem(difficultyKey);

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
      const cuisineKey = getUserCuisineKey();
      const difficultyKey = getUserDifficultyKey();

      if (!cuisineKey || !difficultyKey) return;

      await AsyncStorage.setItem(cuisineKey, cuisine);
      await AsyncStorage.setItem(difficultyKey, difficulty);
    } catch (error) {
      console.log("Error saving preferences:", error);
    }
  };

  const saveRecipeLocally = async (newRecipe) => {
    try {
      const storageKey = getUserRecipesKey();

      if (!storageKey) {
        console.log("No logged-in user found.");
        return;
      }

      const existingRecipes = await AsyncStorage.getItem(storageKey);
      let recipesArray = existingRecipes ? JSON.parse(existingRecipes) : [];

      const alreadyExists = recipesArray.some(
        (recipe) =>
          recipe.id === newRecipe.id &&
          recipe.difficulty === newRecipe.difficulty
      );

      if (!alreadyExists) {
        const recipeWithTime = {
          ...newRecipe,
          cookedAt: Date.now(),
        };

        recipesArray.push(recipeWithTime);
        await AsyncStorage.setItem(storageKey, JSON.stringify(recipesArray));
      }
    } catch (error) {
      console.log("Error saving recipe locally:", error);
    }
  };

  const getOfflineRecipe = async () => {
    try {
      const storageKey = getUserRecipesKey();

      if (!storageKey) {
        console.log("No logged-in user found.");
        return null;
      }

      const savedRecipes = await AsyncStorage.getItem(storageKey);
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

  const difficultyOptions = ["Easy", "Medium", "Hard"];

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
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.greeting}>Ready to cook?</Text>
          <Text style={styles.title}>Choose your next dish</Text>
        </View>

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Select Cuisine</Text>

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
              <Text
                style={[
                  styles.cuisineText,
                  cuisine === item.name && styles.selectedCuisineText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Select Difficulty</Text>

        <View style={styles.difficultyRow}>
          {difficultyOptions.map((item) => (
            <TouchableOpacity
              key={item}
              style={[
                styles.difficultyButton,
                difficulty === item && styles.selectedDifficultyButton,
              ]}
              onPress={() => setDifficulty(item)}
            >
              <Text
                style={[
                  styles.difficultyText,
                  difficulty === item && styles.selectedDifficultyText,
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.primaryButton} onPress={getRecipe}>
        <Text style={styles.primaryButtonText}>Make Food</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => navigation.navigate("CookedDishes")}
      >
        <Text style={styles.secondaryButtonText}>Previously Cooked Dishes</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 70,
    paddingBottom: 30,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
  },

  greeting: {
    fontSize: 15,
    color: "#9d7d7d",
    marginBottom: 4,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#2b2b2b",
    maxWidth: 220,
  },

  logoutButton: {
    backgroundColor: "#CB7478",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 16,
  },

  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },

  sectionCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 18,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2b2b2b",
    marginBottom: 16,
    textAlign: "center",
  },

  cuisineContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  cuisineButton: {
    width: "30%",
    minWidth: 92,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    paddingVertical: 14,
    paddingHorizontal: 8,
    alignItems: "center",
    margin: 6,
    borderWidth: 2,
    borderColor: "transparent",
  },

  selectedCuisine: {
    backgroundColor: "#F48F92",
    borderColor: "#C96C70",
  },

  cuisineText: {
    marginTop: 8,
    fontSize: 15,
    fontWeight: "600",
    color: "#222",
    textAlign: "center",
  },

  selectedCuisineText: {
    color: "#1f1f1f",
  },

  image: {
    width: 58,
    height: 58,
    borderRadius: 29,
    marginBottom: 4,
  },

  difficultyRow: {
    flexDirection: "row",
    justifyContent: "center",
    flexWrap: "wrap",
  },

  difficultyButton: {
    backgroundColor: "#EFE3D8",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginHorizontal: 6,
    marginVertical: 6,
    minWidth: 92,
    alignItems: "center",
  },

  selectedDifficultyButton: {
    backgroundColor: "#F48F92",
  },

  difficultyText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#4d4d4d",
  },

  selectedDifficultyText: {
    color: "#fff",
  },

  primaryButton: {
    backgroundColor: "#F48F92",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 6,
  },

  primaryButtonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },

  secondaryButton: {
    marginTop: 14,
    backgroundColor: "#fff",
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#D07A7D",
  },

  secondaryButtonText: {
    color: "#C96C70",
    fontSize: 20,
    fontWeight: "bold",
  },
});