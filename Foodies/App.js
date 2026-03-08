import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from "react";
import { StyleSheet } from "react-native";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import GroceryListScreen from "./src/screens/GroceryListScreen";



export default function App() {
  const ProtectedTab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator(); 


  function ProtectedLayout(){
  return (
    <NavigationContainer>
      <ProtectedTab.Navigator>
          <ProtectedTab.Screen name="Home"
          component= {HomeScreen}/>
        
          <ProtectedTab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{ headerShown: true, title: 'My Profile' }} // Show header for Profile
          />

        <ProtectedTab.Screen 
            name="Grocery" 
            component={GroceryListScreen} 
            options={{ headerShown: true, title: 'My Grocery List' }} // Show header for Profile
        />

      </ProtectedTab.Navigator>
    </NavigationContainer>
  );
}

return(
<NavigationContainer>
  <Stack.Navigator>

  </Stack.Navigator>
</NavigationContainer>
);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});