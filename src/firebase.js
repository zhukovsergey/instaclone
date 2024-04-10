// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "insta-7ab58.firebaseapp.com",
  projectId: "insta-7ab58",
  storageBucket: "insta-7ab58.appspot.com",
  messagingSenderId: "1079731743307",
  appId: "1:1079731743307:web:5b79c0f4bae421a028fbce",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
