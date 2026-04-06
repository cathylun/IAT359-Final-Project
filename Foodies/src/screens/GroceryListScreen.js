import { useEffect, useCallback, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  View,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { firebase_auth } from "../firebaseConfig";

export default function GroceryListScreen() {
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

      const savedItems = await AsyncStorage.getItem(storageKey);
      const parsedItems = savedItems ? JSON.parse(savedItems) : [];

      const sortedItems = [...parsedItems].sort((a, b) => {
        const timeA = a.addedAt || 0;
        const timeB = b.addedAt || 0;
        return timeB - timeA;
      });

      setGroceryItems(sortedItems);
    } catch (error) {
      console.log("Error loading grocery list:", error);
      Alert.alert("Error", "Could not load grocery list.");
    }
  };

  const removeItem = async (itemId) => {
    try {
      const storageKey = getUserGroceryKey();

      if (!storageKey) return;

      const updatedItems = groceryItems.filter((item) => item.id !== itemId);
      setGroceryItems(updatedItems);
      await AsyncStorage.setItem(storageKey, JSON.stringify(updatedItems));
    } catch (error) {
      console.log("Error removing grocery item:", error);
      Alert.alert("Error", "Could not remove item.");
    }
  };

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

  const renderItem = ({ item }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemTextWrap}>
        <Text style={styles.itemName}>{item.name}</Text>
        {!!item.measure && <Text style={styles.itemMeasure}>{item.measure}</Text>}
      </View>

      <TouchableOpacity
        style={styles.removeListButton}
        onPress={() => confirmRemove(item)}
      >
        <Text style={styles.removeListButtonText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Grocery List</Text>

      {groceryItems.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Your grocery list is empty.</Text>
          <Text style={styles.emptySubtext}>
            Add ingredients from a recipe to see them here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={groceryItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB",
    paddingTop: 20,
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2B2B2B",
    textAlign: "center",
    marginBottom: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
  },

  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
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