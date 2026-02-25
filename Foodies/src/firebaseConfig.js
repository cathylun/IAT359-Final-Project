// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import "firebase/firestore";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD-n6e1uDY65IgTyCIV1XK-Pjvs6Fvdbcg",
  authDomain: "foodies-12b1c.firebaseapp.com",
  projectId: "foodies-12b1c",
  storageBucket: "foodies-12b1c.firebasestorage.app",
  messagingSenderId: "812810355672",
  appId: "1:812810355672:web:ca16ce5b324627ff60e8ad",
  measurementId: "G-8NBLYF3J6X"
};

// Initialize Firebase
export const firebase_app = initializeApp(firebaseConfig);
// get the firestore database object
export const db = getFirestore(firebase_app);
