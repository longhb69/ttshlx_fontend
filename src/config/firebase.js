// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCwVa072b458H_-neVqPTw1lNXUELM1BLU",
  authDomain: "first-step-3fb21.firebaseapp.com",
  projectId: "first-step-3fb21",
  storageBucket: "first-step-3fb21.firebasestorage.app",
  messagingSenderId: "453156932528",
  appId: "1:453156932528:web:5fd878222bbbc1bf7a6475",
  measurementId: "G-R0KPDFTFD9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app)