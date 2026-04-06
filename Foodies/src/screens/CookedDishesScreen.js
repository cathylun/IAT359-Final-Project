import { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase_auth } from "../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function CookedDishesScreen({ navigation }) {
  const [savedRecipes, setSavedRecipes] = useState([]);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSavedRecipes();
    }, [])
  );

  const getUserRecipesKey = () => {
    const user = firebase_auth.currentUser;
    if (!user) return null;
    return `savedRecipes_${user.uid}`;
  };

  const loadSavedRecipes = async () => {
    try {
      const storageKey = getUserRecipesKey();

      if (!storageKey) {
        setSavedRecipes([]);
        return;
      }

      const recipes = await AsyncStorage.getItem(storageKey);
      const parsedRecipes = recipes ? JSON.parse(recipes) : [];

      const sortedRecipes = [...parsedRecipes].sort((a, b) => {
        const timeA = a.cookedAt || 0;
        const timeB = b.cookedAt || 0;
        return timeB - timeA;
      });

      setSavedRecipes(sortedRecipes);
    } catch (error) {
      console.log("Error loading saved recipes:", error);
      Alert.alert("Error", "Could not load saved dishes.");
    }
  };

  const deleteRecipe = async (recipeToDelete) => {
    try {
      const storageKey = getUserRecipesKey();

      if (!storageKey) return;

      const recipes = await AsyncStorage.getItem(storageKey);
      const parsedRecipes = recipes ? JSON.parse(recipes) : [];

      const updatedRecipes = parsedRecipes.filter(
        (recipe) =>
          !(
            recipe.id === recipeToDelete.id &&
            recipe.difficulty === recipeToDelete.difficulty
          )
      );

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedRecipes));
      loadSavedRecipes();
    } catch (error) {
      console.log("Error deleting recipe:", error);
      Alert.alert("Error", "Could not delete recipe.");
    }
  };

  const confirmDelete = (recipe) => {
    Alert.alert(
      "Delete Recipe",
      `Remove "${recipe.title}" from your cooked dishes?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => deleteRecipe(recipe),
        },
      ]
    );
  };

  const openRecipe = (recipe) => {
    navigation.navigate("DishIntro", { recipe });
  };

  const renderRecipe = ({ item }) => (
    <View style={styles.recipeCard}>
      <TouchableOpacity
        style={styles.recipeMain}
        onPress={() => openRecipe(item)}
        activeOpacity={0.8}
      >
        <Image source={{ uri: item.image }} style={styles.recipeImage} />
        <View style={styles.recipeTextContainer}>
          <Text style={styles.recipeTitle}>{item.title}</Text>
          <Text style={styles.recipeInfo}>
            {item.cuisine} • {item.difficulty}
          </Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => confirmDelete(item)}
      >
        <Text style={styles.deleteButtonText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="chevron-back" size={22} color="#F48F92" />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.header}>Previously Cooked Dishes</Text>

      {savedRecipes.length === 0 ? (
        <Text style={styles.emptyText}>
          You have not cooked any saved dishes yet.
        </Text>
      ) : (
        <FlatList
          data={savedRecipes}
          keyExtractor={(item, index) => `${item.id}-${item.difficulty}-${index}`}
          renderItem={renderRecipe}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB",
    padding: 20,
    paddingTop: 60,
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

  header: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#c46a6a",
  },

  listContainer: {
    paddingBottom: 20,
  },

  recipeCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
  },

  recipeMain: {
    flexDirection: "row",
    alignItems: "center",
  },

  recipeImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
  },

  recipeTextContainer: {
    flex: 1,
  },

  recipeTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },

  recipeInfo: {
    marginTop: 6,
    fontSize: 14,
    color: "#888",
  },

  deleteButton: {
    marginTop: 12,
    alignSelf: "flex-end",
    backgroundColor: "#f8d7d7",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  deleteButtonText: {
    color: "#b84d4d",
    fontWeight: "bold",
  },

  emptyText: {
    marginTop: 40,
    textAlign: "center",
    fontSize: 16,
    color: "#777",
  },
});