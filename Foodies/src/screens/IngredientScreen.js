import { View, Text, ScrollView, TouchableOpacity } from "react-native";

export default function IngredientScreen({ route, navigation }) {

  const { recipe } = route.params;
  const ingredients = recipe.ingredients || [];

  return (
    <ScrollView style={{ padding: 20 }}>

      <Text style={{ fontSize: 22, fontWeight: "bold" }}>
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
        style={{
          marginTop: 30,
          backgroundColor: "#007AFF",
          padding: 15,
          borderRadius: 10
        }}
        onPress={() => navigation.navigate("Cooking", { recipe })}
      >
        <Text style={{ color: "white", textAlign: "center" }}>
          Start Cooking
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}