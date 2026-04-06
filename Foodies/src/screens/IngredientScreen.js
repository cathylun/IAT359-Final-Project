import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { StyleSheet } from "react-native";

export default function IngredientScreen({ route, navigation }) {

  const { recipe } = route.params;
  const ingredients = recipe.ingredients || [];

return (
  <View style={styles.container}>
    <ScrollView contentContainerStyle={{ padding: 20 }}>

      <Text style={styles.title}>
        Ingredients
      </Text>

      {ingredients.length === 0 ? (
        <Text>No ingredients available</Text>
      ) : (
        ingredients.map((item) => (
          <Text key={item.id} style={{ marginTop: 10 }}>
            • {item.measure ? item.measure + " " : ""}{item.name}
          </Text>
        ))
      )}

    <TouchableOpacity
      style={styles.button}
      onPress={() => navigation.navigate("Cooking", { recipe })}
    >
      <Text style={styles.buttonText}>
        Start Cooking
      </Text>
    </TouchableOpacity>

    </ScrollView>
  </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6E9DB", 
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
  
  button: {
  marginTop: 30,
  backgroundColor: "#FB8989",
  padding: 15,
  borderRadius: 10,
  },

  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
});

