// React hooks
import { useEffect, useCallback, useState } from "react";

// React Native components
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";

// Local storage
import AsyncStorage from "@react-native-async-storage/async-storage";

// Navigation focus hook
import { useFocusEffect } from "@react-navigation/native";

// Safe area handling
import { SafeAreaView } from "react-native-safe-area-context";

// Firebase auth
import { firebase_auth } from "../firebaseConfig";

// Main screen component
export default function GroceryListScreen() {
  const [groceryItems, setGroceryItems] = useState([]); // grocery list state

  // load list on mount
  useEffect(() => {
    loadGroceryList();
  }, []);

  // reload list when screen is focused
  useFocusEffect(
    useCallback(() => {
      loadGroceryList();
    }, [])
  );

  // generate user-specific storage key
  const getUserGroceryKey = () => {
    const user = firebase_auth.currentUser;
    if (!user) return null;
    return `groceryList_${user.uid}`;
  };

  // load grocery list from storage
  const loadGroceryList = async () => {
    try {
      const storageKey = getUserGroceryKey();

      if (!storageKey) {
        setGroceryItems([]); // no user
        return;
      }

      const savedItems = await AsyncStorage.getItem(storageKey);
      const parsedItems = savedItems ? JSON.parse(savedItems) : [];

      // sort by most recent
      const sortedItems = [...parsedItems].sort((a, b) => {
        const timeA = a.addedAt || 0;
        const timeB = b.addedAt || 0;
        return timeB - timeA;
      });

      setGroceryItems(sortedItems); // update state
    } catch (error) {
      console.log("Error loading grocery list:", error);
      Alert.alert("Error", "Could not load grocery list.");
    }
  };

  // remove item from list
  const removeItem = async (itemId) => {
    try {
      const storageKey = getUserGroceryKey();

      if (!storageKey) return;

      const updatedItems = groceryItems.filter((item) => item.id !== itemId);
      setGroceryItems(updatedItems); // update UI
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems)); // save
    } catch (error) {
      console.log("Error removing grocery item:", error);
      Alert.alert("Error", "Could not remove item.");
    }
  };

  // confirm removal popup
  const confirmRemove = (item) => {
    Alert.alert(
      "Remove Item",
      `Remove ${item.name} from your grocery list?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: () => removeItem(item.id),
        },
      ]
    );
  };

  // render each grocery item
  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemTextWrap}>
        <Text style={styles.itemName}>{item.name}</Text>
        {!!item.measure && <Text style={styles.itemMeasure}>{item.measure}</Text>}
      </View>

      {/* remove button */}
      <TouchableOpacity
        style={styles.removeListButton}
        onPress={() => confirmRemove(item)}
      >
        <Text style={styles.removeListButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    // safe area wrapper
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      <View style={styles.container}>
        {/* screen title */}
        <Text style={styles.title}>My Grocery List</Text>

        {/* empty state */}
        {groceryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Your grocery list is empty.</Text>
            <Text style={styles.emptySubtext}>
              Add ingredients from a recipe to see them here.
            </Text>
          </View>
        ) : (
          // grocery list
          <FlatList
            data={groceryItems}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// styles for UI
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F6E9DB",
  },
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB",
    paddingTop: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2B2B2B",
    textAlign: "center",
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    width: "100%",
    maxWidth: 720,
    alignSelf: "center",
  },
  itemCard: {
    backgroundColor: "#FFF7F1",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  itemTextWrap: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#2b2b2b",
  },
  itemMeasure: {
    marginTop: 4,
    fontSize: 14,
    color: "#8a7a7a",
  },
  removeListButton: {
    backgroundColor: "#f8d7d7",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  removeListButtonText: {
    color: "#b84d4d",
    fontWeight: "bold",
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#666",
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
  },
});