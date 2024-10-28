// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore"; // Import Firestore
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC66qUYRR1-j9mVmBIqhYQUTQqlGW0zebM",
  authDomain: "modul5-vue.firebaseapp.com",
  databaseURL: "https://modul5-vue-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "modul5-vue",
  storageBucket: "modul5-vue.appspot.com",
  messagingSenderId: "334126464104",
  appId: "1:334126464104:web:ac404caf2745a923a08fdd",
  measurementId: "G-HE1WMGN6D6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app); // Initialize Firestore
const storage = getStorage(app);

console.log("Firebase app initialized:", app);
console.log("Analytics initialized:", analytics);
console.log("Firestore initialized:", db);

export {db, analytics, storage}