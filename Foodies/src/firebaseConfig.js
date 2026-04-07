import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

import AsyncStorage from "@react-native-async-storage/async-storage";

// Your Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyD-n6e1uDY65IgTyCIV1XK-Pjvs6Fvdbcg",
  authDomain: "foodies-12b1c.firebaseapp.com",
  projectId: "foodies-12b1c",
  storageBucket: "foodies-12b1c.firebasestorage.app",
  messagingSenderId: "812810355672",
  appId: "1:812810355672:web:ca16ce5b324627ff60e8ad",
};

// Initialize app
export const firebase_app = initializeApp(firebaseConfig);

// Firestore
export const db = getFirestore(firebase_app);

export const firebase_auth = initializeAuth(firebase_app, {
  persistence: getReactNativePersistence(AsyncStorage),
});
