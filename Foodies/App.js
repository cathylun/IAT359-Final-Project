import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebase_auth } from "./src/firebaseConfig";
import SignInScreen from "./src/screens/SignInScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import GroceryListScreen from "./src/screens/GroceryListScreen";



import DishIntroScreen from "./src/screens/DishIntroScreen";
import IngredientScreen from "./src/screens/IngredientScreen";
import CookingScreen from "./src/screens/CookingScreen";


  const ProtectedTab = createBottomTabNavigator();
  const Stack = createNativeStackNavigator(); 

  function ProtectedLayout(){
  return (
      <ProtectedTab.Navigator>
          <ProtectedTab.Screen name="Home"
          component= {HomeScreen}/>
        
          <ProtectedTab.Screen 
            name="Profile" 
            component={ProfileScreen} 
            options={{title: 'My Profile' }} 
          />

        <ProtectedTab.Screen 
            name="Grocery" 
            component={GroceryListScreen} 
            options={{title: 'My Grocery List' }} 
        />

      </ProtectedTab.Navigator>
  );
}

export default function App() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
     const unsubscribe = onAuthStateChanged(firebase_auth, (user) => {
      console.log("user", user);
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return null;


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        {user ? (
          <Stack.Screen
            name="ProtectedArea"
            component={ProtectedLayout}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen name="SignIn" component={SignInScreen} />
          
        )}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="DishIntro" component={DishIntroScreen} />
        <Stack.Screen name="Ingredients" component={IngredientScreen} />
        <Stack.Screen name="Cooking" component={CookingScreen} />
        
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
