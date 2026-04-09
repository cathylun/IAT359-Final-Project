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
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { db, firebase_auth } from "../firebaseConfig.js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";

export default function HomeScreen({ navigation }) {
  const [cuisine, setCuisine] = useState("Italian");
  // State: selected cuisine

  const [difficulty, setDifficulty] = useState("Easy");
  // State: selected difficulty

  const [isLoaded, setIsLoaded] = useState(false);

  const insets = useSafeAreaInsets();

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

  const handleLogout = () => {
    Alert.alert("Log Out", "Are you sure you want to log out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Log Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut(firebase_auth);
          } catch (error) {
            console.log("Logout error:", error);
            Alert.alert("Logout Error", "Could not log out.");
          }
        },
      },
    ]);
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
      const user = firebase_auth.currentUser;
      if (!user) return;
      const storageKey = `savedRecipes_${user.uid}`;
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

        await setDoc(
          doc(db, `users/${user.uid}/savedRecipes`, newRecipe.id.toString()),
          { ...recipeWithTime, createdAt: serverTimestamp() }
        );
      }
    } catch (error) {
      console.log("Error saving recipe locally:", error);
    }
  };

  const getOfflineRecipe = async () => {
    try {
      const storageKey = getUserRecipesKey();
      if (!storageKey) return null;

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

      return matchingRecipes[
        Math.floor(Math.random() * matchingRecipes.length)
      ];
    } catch (error) {
      console.log("Error loading offline recipe:", error);
      return null;
    }
  };

  const openRecipe = (recipe) => {
    navigation.navigate("DishIntro", { recipe });
  };  // Navigate to recipe detail screen


  const cuisines = [
    { name: "Italian", image: require("../img/Italy.png") },
    { name: "Japanese", image: require("../img/Japan.png") },
    { name: "Chinese", image: require("../img/China.png") },
    { name: "Mexican", image: require("../img/Mexico.png") },
    { name: "Greek", image: require("../img/Greek.png") },
  ];  // Cuisine options + icon of the flags


  const difficultyOptions = ["Easy", "Medium", "Hard"];   // Difficulty options

  const getRecipe = async () => { 
    // Fetch recipe from API

    try {
      const searchResponse = await fetch(
        `https://www.themealdb.com/api/json/v1/1/filter.php?a=${cuisine}`
      ); //fetch recipes by cuisine
      const searchData = await searchResponse.json();

      if (!searchData.meals || searchData.meals.length === 0) {
        Alert.alert("No recipe found");
        return;
      } // If no recipes returned, stop execution


      const recipe =
        searchData.meals[Math.floor(Math.random() * searchData.meals.length)];
      const recipeId = recipe.idMeal; 

      const infoResponse = await fetch(
        `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${recipeId}`
      ); // fetch full recipe details using recipe ID
      const infoData = await infoResponse.json();
      const recipeData = infoData.meals[0];

      const ingredients = [];
      for (let i = 1; i <= 20; i++) {
        const ingredient = recipeData[`strIngredient${i}`];
        const measure = recipeData[`strMeasure${i}`];
        if (ingredient && ingredient.trim() !== "") {
          ingredients.push({ id: i, name: ingredient, measure: measure || "" });
        }
      } // Build ingredients array (API stores ingredients in separate fields)
    // Only include valid ingredients (ignore empty strings)



      const stepsArray = (recipeData.strInstructions || "")
        .split("\n") // split into lines
        .filter((s) => s.trim() !== "") // remove empty lines
        .map((s, index) => ({ number: index + 1, step: s.trim() }));
        // Convert instructions text by step-by-step array

      const formattedRecipe = {
        id: recipeId,
        title: recipeData.strMeal,
        image: recipeData.strMealThumb,
        cuisine,
        difficulty,
        summary: `${recipeData.strMeal} is a ${
          recipeData.strArea
        } dish. Try making this ${difficulty.toLowerCase()} recipe at home.`,
        instructions: recipeData.strInstructions,
        ingredients,
        analyzedInstructions: [{ steps: stepsArray }],
      }; //Create structured recipe object for app use

      try {
        await setDoc(doc(db, "recipes", formattedRecipe.id.toString()), {
          ...formattedRecipe,
          createdAt: serverTimestamp(),
        });
      } catch (error) {
        console.log("Firestore general recipes write failed (ignored):", error);
      } // Save general recipe (ignore errors if not allowed)


      // Save user-specific recipe + AsyncStorage
      await saveRecipeLocally(formattedRecipe);

      // Open recipe screen
      openRecipe(formattedRecipe);
    } catch (error) {
      console.log("API fetch failed, trying offline recipe:", error);

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
      <SafeAreaView style={styles.safeArea} edges={["top"]}>
        <View style={styles.headerRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.greeting}>Ready to cook?</Text>
            <Text style={styles.title}>Choose your next dish</Text>
          </View>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={[
          styles.scrollContent,
          {
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 24) + 110,
          },
        ]}
        showsVerticalScrollIndicator={false}
        contentInsetAdjustmentBehavior="never"
      >
        <View style={styles.content}>
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
            <Text style={styles.primaryButtonText}>Cook Food</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
            onPress={() => navigation.navigate("CookedDishes")}
          >
            <Text style={styles.secondaryButtonText}>
              Previously Cooked Dishes
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },
  safeArea: {
    backgroundColor: "#F6E9DB",
  },
  screen: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  content: {
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 22,
    paddingHorizontal: 20,
  },
  headerTextWrap: {
    flex: 1,
    marginRight: 12,
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
