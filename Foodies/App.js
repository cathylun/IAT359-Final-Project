import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StyleSheet } from "react-native";
import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { firebase_auth } from "./src/firebaseConfig";
import SignInScreen from "./src/screens/SignInScreen";
import CreateAccountScreen from "./src/screens/CreateAccountScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import GroceryListScreen from "./src/screens/GroceryListScreen";
import DishIntroScreen from "./src/screens/DishIntroScreen";
import IngredientScreen from "./src/screens/IngredientScreen";
import CookingScreen from "./src/screens/CookingScreen";
import CameraScreen from "./src/screens/CameraScreen";
import CookedDishesScreen from "./src/screens/CookedDishesScreen";
import { Ionicons } from "@expo/vector-icons";

const ProtectedTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function ProtectedLayout({ photos }) {
  return (
    <ProtectedTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "#FFF7F1",
          borderTopWidth: 0,
          height: 82,
          paddingTop: 10,
          paddingBottom: 12,
        },
        tabBarIcon: ({ focused, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "book" : "book-outline";
          } else if (route.name === "Grocery") {
            iconName = focused ? "cart" : "cart-outline";
          }

          return (
            <Ionicons
              name={iconName}
              size={28}
              color={focused ? "#F48F92" : "#9D9D9D"}
            />
          );
        },
      })}
    >
      <ProtectedTab.Screen name="Home" component={HomeScreen} />

      <ProtectedTab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} photos={photos} />}
      </ProtectedTab.Screen>

      <ProtectedTab.Screen
        name="Grocery"
        component={GroceryListScreen}
      />
    </ProtectedTab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState([]);

  const addPhoto = (photo) => {
    setPhotos((prev) => [...prev, photo]);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase_auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {user ? (
          <>
            <Stack.Screen name="ProtectedArea" options={{ headerShown: false }}>
              {(props) => <ProtectedLayout {...props} photos={photos} />}
            </Stack.Screen>
            <Stack.Screen name="DishIntro" component={DishIntroScreen} />
            <Stack.Screen name="Ingredients" component={IngredientScreen} />
            <Stack.Screen name="Cooking" component={CookingScreen} />
            <Stack.Screen name="CookedDishes" component={CookedDishesScreen} />
            <Stack.Screen name="Camera">
              {(props) => <CameraScreen {...props} addPhoto={addPhoto} />}
            </Stack.Screen>
          </>
        ) : (
          <>
            <Stack.Screen
              name="SignIn"
              component={SignInScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="CreateAccount"
              component={CreateAccountScreen}
              options={{ headerShown: false }}
            />
          </>
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