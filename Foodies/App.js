// Navigation libraries for stack and tab navigation
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

// React hooks
import { useEffect, useState, useRef } from "react";

// Firebase auth listener
import { onAuthStateChanged } from "firebase/auth";

// Icons
import { Ionicons } from "@expo/vector-icons";

// Safe area handling for different devices
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

// Firebase config
import { firebase_auth } from "./src/firebaseConfig";

// Screens (auth + main app)
import SignInScreen from "./src/screens/SignInScreen";
import CreateAccountScreen from "./src/screens/CreateAccountScreen";
import HomeScreen from "./src/screens/HomeScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import GroceryListScreen from "./src/screens/GroceryListScreen";
import DiaryEntryScreen from "./src/screens/DiaryEntryScreen";

// Notifications setup
import * as Notifications from "expo-notifications";
import {
  requestNotificationPermission,
  setupAndroidChannel,
} from "./src/notifications";

// Additional feature screens
import DishIntroScreen from "./src/screens/DishIntroScreen";
import IngredientScreen from "./src/screens/IngredientScreen";
import CookingScreen from "./src/screens/CookingScreen";
import CameraScreen from "./src/screens/CameraScreen";
import ReminderSettingScreen from "./src/screens/ReminderSettingScreen";
import CookedDishesScreen from "./src/screens/CookedDishesScreen";

// Create navigators
const ProtectedTab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom tab layout for logged-in users
function ProtectedLayout({ photos }) {
  const insets = useSafeAreaInsets(); // get device safe area

  return (
    <ProtectedTab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // hide header
        tabBarShowLabel: false, // hide labels
        tabBarStyle: {
          backgroundColor: "#FFF7F1",
          borderTopWidth: 0,
          height: 50 + insets.bottom, // adjust for safe area
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 2),
        },
        tabBarIcon: ({ focused }) => {
          let iconName;

          // choose icon based on route
          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Profile") {
            iconName = focused ? "person" : "person-outline";
          } else if (route.name === "Grocery") {
            iconName = focused ? "cart" : "cart-outline";
          }

          // render icon
          return (
            <Ionicons
              name={iconName}
              size={26}
              color={focused ? "#F48F92" : "#9D9D9D"}
            />
          );
        },
      })}
    >
      {/* Main tabs */}
      <ProtectedTab.Screen name="Home" component={HomeScreen} />
      <ProtectedTab.Screen name="Profile">
        {(props) => <ProfileScreen {...props} photos={photos} />}
      </ProtectedTab.Screen>
      <ProtectedTab.Screen name="Grocery" component={GroceryListScreen} />
    </ProtectedTab.Navigator>
  );
}

// Root navigator controlling auth vs app flow
function RootNavigator() {
  const [user, setUser] = useState(null); // current user
  const [loading, setLoading] = useState(true); // loading state

  const notificationResponseListener = useRef(); // notification listener ref

  const [photos, setPhotos] = useState([]); // stored photos

  // add photo to state
  const addPhoto = (photo) => {
    setPhotos((prev) => [...prev, photo]);
  };

  // setup notifications
  useEffect(() => {
    async function initNotifications() {
      const granted = await requestNotificationPermission(); // ask permission
      if (!granted) return;
      await setupAndroidChannel(); // setup Android notifications
    }

    initNotifications();

    // listen for notification taps
    notificationResponseListener.current =
      Notifications.addNotificationResponseReceivedListener((response) => {
        const data = response.notification.request.content.data;
        console.log("Notification tapped:", data);
      });

    // cleanup listener
    return () => {
      notificationResponseListener.current?.remove();
    };
  }, []);

  // listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(firebase_auth, (user) => {
      setUser(user); // update user
      setLoading(false); // stop loading
    });

    return unsubscribe; // cleanup
  }, []);

  // prevent render while loading
  if (loading) return null;

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          animation: "none", // disable animations
          headerShown: false, // hide headers
        }}
      >
        {user ? (
          <>
            {/* Protected (logged-in) screens */}
            <Stack.Screen name="ProtectedArea">
              {(props) => <ProtectedLayout {...props} photos={photos} />}
            </Stack.Screen>
            <Stack.Screen name="DishIntro" component={DishIntroScreen} />
            <Stack.Screen name="Ingredients" component={IngredientScreen} />
            <Stack.Screen name="Cooking" component={CookingScreen} />
            <Stack.Screen name="CookedDishes" component={CookedDishesScreen} />
            <Stack.Screen name="Camera">
              {(props) => <CameraScreen {...props} addPhoto={addPhoto} />}
            </Stack.Screen>
            <Stack.Screen name="DiaryEntry">
              {(props) => <DiaryEntryScreen {...props} />}
            </Stack.Screen>
            <Stack.Screen
              name="ReminderSetting"
              component={ReminderSettingScreen}
            />
          </>
        ) : (
          <>
            {/* Auth screens */}
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen
              name="CreateAccount"
              component={CreateAccountScreen}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Root app component
export default function App() {
  return (
    <SafeAreaProvider>
      {/* Wrap app with safe area support */}
      <RootNavigator />
    </SafeAreaProvider>
  );
}