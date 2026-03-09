import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useState } from "react";
import { Picker } from "@react-native-picker/picker";

export default function HomeScreen({ navigation }) {

  const [cuisine, setCuisine] = useState("Italian");

  const getRecipe = async () => {

    try {

      // STEP 1: search recipe by cuisine
      const searchResponse = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?cuisine=${cuisine}&number=1&apiKey=6d32bba489f444f292a99e602a3f0b79`
      );

      const searchData = await searchResponse.json();

      const recipeId = searchData.results[0].id;

      // STEP 2: get full recipe info
      const infoResponse = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=6d32bba489f444f292a99e602a3f0b79`
      );

      const recipe = await infoResponse.json();

      navigation.navigate("DishIntro", { recipe });

    } catch (error) {
      console.log(error);
    }

  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Foodies</Text>

      <Text style={styles.label}>Select Cuisine</Text>

      <Picker
        selectedValue={cuisine}
        onValueChange={(itemValue) => setCuisine(itemValue)}
        style={{ width: 200 }}
      >
        <Picker.Item label="Italian" value="Italian" />
        <Picker.Item label="Japanese" value="Japanese" />
        <Picker.Item label="Chinese" value="Chinese" />
        <Picker.Item label="Mexican" value="Mexican" />
        <Picker.Item label="Korean" value="Korean" />
      </Picker>

      <TouchableOpacity style={styles.button} onPress={getRecipe}>
        <Text style={styles.buttonText}>Make Food</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },

  title:{
    fontSize:28,
    marginBottom:20
  },

  label:{
    fontSize:16,
    marginTop:10
  },

  button:{
    marginTop:30,
    backgroundColor:"#007AFF",
    padding:15,
    borderRadius:10
  },

  buttonText:{
    color:"white",
    fontWeight:"bold"
  }

});