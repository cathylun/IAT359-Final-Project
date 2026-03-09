
Copy

import { StyleSheet, Text, SafeAreaView } from "react-native";

export default function GroceryListScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>My Grocery List</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24 },
});