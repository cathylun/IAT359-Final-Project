import { View, Text, ScrollView } from "react-native";

export default function CookingScreen({ route }) {

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

    </ScrollView>
  );
}