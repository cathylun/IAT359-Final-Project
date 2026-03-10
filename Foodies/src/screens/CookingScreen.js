import { View, Text, ScrollView, TouchableOpacity } from "react-native";
export default function CookingScreen({ route, navigation }) {

  const { recipe } = route.params;
  const steps = recipe.analyzedInstructions[0]?.steps || [];

  return (
    <ScrollView style={{padding:20}}>

      <Text style={{fontSize:22,fontWeight:"bold"}}>
        Cooking Steps
      </Text>

      {steps.map((step) => (

        <Text key={step.number} style={{marginTop:15}}>
          Step {step.number}: {step.step}
        </Text>

      ))}
        <TouchableOpacity
        style={{
          marginTop:30,
          backgroundColor:"#FF9500",
          padding:15,
          borderRadius:10
        }}
        onPress={()=>navigation.navigate("Camera")}
      >
        <Text style={{color:"white",textAlign:"center"}}>
          Take Photo
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}