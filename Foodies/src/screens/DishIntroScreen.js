import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";

export default function DishIntroScreen({ route, navigation }) {

  const { recipe } = route.params;

  return (
    <View style={styles.container}>

      <Text style={styles.title}>{recipe.title}</Text>

      <Image
        source={{ uri: recipe.image }}
        style={styles.image}
      />

      <Text>
        {recipe.summary
          ? recipe.summary.replace(/<[^>]+>/g, "")
          : "No description available"}
      </Text>
            
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("Ingredients", { recipe })}
      >
        <Text style={styles.buttonText}>Check Ingredients</Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    padding:20,
    backgroundColor: "#F6E9DB"
  },

  title:{
    fontSize:22,
    fontWeight:"bold",
    marginBottom:10
  },

  image:{
    width:"100%",
    height:200,
    marginBottom:20
  },

  button:{
    marginTop:20,
    backgroundColor: "#FB8989",
    padding:15,
    borderRadius:10
  },

  buttonText:{
    color:"white",
    textAlign:"center"
  }

});