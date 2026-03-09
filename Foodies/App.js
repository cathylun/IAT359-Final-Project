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

  // useEffect hook to listen for Firebase authentication state changes.
  // This runs once when the component mounts.
  useEffect(() => {
    // onAuthStateChanged sets up a listener.
    // it triggers whenever the user logs in, logs out, or the token refreshes.
    onAuthStateChanged(firebase_auth, (user) => {
      console.log("user", user);

      // if user is found, 'user' is an object. If logged out, 'user' is null.
      // we update the local state to trigger a re-render of the navigation.
      setUser(user);
    });
  }, []);


  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="SignIn">
        {/* conditional rendering (The Auth Flow):
          Check if the 'user' state exists.
        */}
        {user ? (
          // IF LOGGED IN: render the Protected Layout.
          // we hide the header here because the ProtectedLayout has its own headers.
          <Stack.Screen
            name="ProtectedArea"
            component={ProtectedLayout}
            options={{ headerShown: false }}
          />
        ) : (
          // IF NOT LOGGED IN: render the Sign In Screen.
          <Stack.Screen name="SignIn" component={SignInScreen} />
        )}
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