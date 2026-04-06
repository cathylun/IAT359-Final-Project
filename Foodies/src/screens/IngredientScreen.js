import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { firebase_auth } from "../firebaseConfig";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

export default function IngredientScreen({ route, navigation }) {
  const { recipe } = route.params;
  const ingredients = recipe.ingredients || [];
  const [groceryItems, setGroceryItems] = useState([]);

  useEffect(() => {
    loadGroceryList();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGroceryList();
    }, [])
  );

  const getUserGroceryKey = () => {
    const user = firebase_auth.currentUser;
    if (!user) return null;
    return `groceryList_${user.uid}`;
  };

  const loadGroceryList = async () => {
    try {
      const storageKey = getUserGroceryKey();

      if (!storageKey) {
        setGroceryItems([]);
        return;
      }

      const existingItems = await AsyncStorage.getItem(storageKey);
      const parsedItems = existingItems ? JSON.parse(existingItems) : [];
      setGroceryItems(parsedItems);
    } catch (error) {
      console.log("Error loading grocery list:", error);
    }
  };

  const isInGroceryList = (ingredient) => {
    return groceryItems.some(
      (item) =>
        item.name?.toLowerCase() === ingredient.name?.toLowerCase() &&
        (item.measure || "").toLowerCase() ===
          (ingredient.measure || "").toLowerCase()
    );
  };

  const addToGroceryList = async (ingredient) => {
    try {
      const storageKey = getUserGroceryKey();

      if (!storageKey) {
        Alert.alert("Error", "No logged-in user found.");
        return;
      }

      const existingItems = await AsyncStorage.getItem(storageKey);
      let groceryList = existingItems ? JSON.parse(existingItems) : [];

      const alreadyExists = groceryList.some(
        (item) =>
          item.name?.toLowerCase() === ingredient.name?.toLowerCase() &&
          (item.measure || "").toLowerCase() ===
            (ingredient.measure || "").toLowerCase()
      );

      if (alreadyExists) {
        Alert.alert(
          "Already Added",
          `${ingredient.name} is already in your grocery list.`
        );
        return;
      }

      const newItem = {
        id: `${ingredient.name}-${Date.now()}`,
        name: ingredient.name,
        measure: ingredient.measure || "",
        addedAt: Date.now(),
      };

      groceryList.push(newItem);
      await AsyncStorage.setItem(storageKey, JSON.stringify(groceryList));
      setGroceryItems(groceryList);

      Alert.alert("Added", `${ingredient.name} was added to your grocery list.`);
    } catch (error) {
      console.log("Error adding ingredient:", error);
      Alert.alert("Error", "Could not add ingredient to grocery list.");
    }
  };

  const removeFromGroceryList = async (ingredient) => {
    try {
      const storageKey = getUserGroceryKey();

      if (!storageKey) {
        Alert.alert("Error", "No logged-in user found.");
        return;
      }

      const existingItems = await AsyncStorage.getItem(storageKey);
      const groceryList = existingItems ? JSON.parse(existingItems) : [];

      const updatedList = groceryList.filter(
        (item) =>
          !(
            item.name?.toLowerCase() === ingredient.name?.toLowerCase() &&
            (item.measure || "").toLowerCase() ===
              (ingredient.measure || "").toLowerCase()
          )
      );

      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedList));
      setGroceryItems(updatedList);

      Alert.alert(
        "Removed",
        `${ingredient.name} was removed from your grocery list.`
      );
    } catch (error) {
      console.log("Error removing ingredient:", error);
      Alert.alert("Error", "Could not remove ingredient from grocery list.");
    }
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={22} color="#F48F92" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.headerCard}>
          <Text style={styles.title}>Ingredients</Text>
          <Text style={styles.subtitle}>
            {ingredients.length} item{ingredients.length === 1 ? "" : "s"} needed
          </Text>
        </View>

        <View style={styles.listCard}>
          {ingredients.length === 0 ? (
            <Text style={styles.emptyText}>No ingredients available</Text>
          ) : (
            ingredients.map((item, index) => {
              const added = isInGroceryList(item);

              return (
                <View key={item.id || index} style={styles.ingredientRow}>
                  <View style={styles.leftSide}>
                    <View style={styles.bullet} />
                    <View style={styles.ingredientTextWrap}>
                      <Text style={styles.ingredientText}>{item.name}</Text>
                      {!!item.measure && (
                        <Text style={styles.measureText}>{item.measure}</Text>
                      )}
                    </View>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.actionButton,
                      added ? styles.removeButton : styles.addButton,
                    ]}
                    onPress={() =>
                      added
                        ? removeFromGroceryList(item)
                        : addToGroceryList(item)
                    }
                  >
                    <Text
                      style={[
                        styles.actionButtonText,
                        added
                          ? styles.removeButtonText
                          : styles.addButtonText,
                      ]}
                    >
                      {added ? "Remove" : "Add"}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })
          )}
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Cooking", { recipe })}
        >
          <Text style={styles.buttonText}>Start Cooking</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
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

  headerCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2B2B2B",
    marginBottom: 6,
  },

  subtitle: {
    fontSize: 15,
    color: "#9d7d7d",
  },

  listCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 24,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },

  ingredientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1e3d8",
  },

  leftSide: {
    flexDirection: "row",
    alignItems: "flex-start",
    flex: 1,
    marginRight: 12,
  },

  bullet: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#F48F92",
    marginTop: 6,
    marginRight: 12,
  },

  ingredientTextWrap: {
    flex: 1,
  },

  ingredientText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2b2b2b",
  },

  measureText: {
    marginTop: 4,
    fontSize: 14,
    color: "#8a7a7a",
  },

  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },

  addButton: {
    backgroundColor: "#F48F92",
  },

  removeButton: {
    backgroundColor: "#f8d7d7",
  },

  actionButtonText: {
    fontWeight: "bold",
    fontSize: 14,
  },

  addButtonText: {
    color: "#fff",
  },

  removeButtonText: {
    color: "#b84d4d",
  },

  emptyText: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    paddingVertical: 20,
  },

  button: {
    marginTop: 22,
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