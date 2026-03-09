import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import HomeScreen from "./src/screens/HomeScreen";
import DishIntroScreen from "./src/screens/DishIntroScreen";
import IngredientScreen from "./src/screens/IngredientScreen";
import CookingScreen from "./src/screens/CookingScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>

        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DishIntro" component={DishIntroScreen} />
        <Stack.Screen name="Ingredients" component={IngredientScreen} />
        <Stack.Screen name="Cooking" component={CookingScreen} />

      </Stack.Navigator>
    </NavigationContainer>
  );
}