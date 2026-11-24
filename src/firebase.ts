import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC9hKfzdo7OkKVv8bgs6E0fhsG4JVEn1tM",
  authDomain: "careaudit-saude.firebaseapp.com",
  projectId: "careaudit-saude",
  storageBucket: "careaudit-saude.firebasestorage.app",
  messagingSenderId: "148960367308",
  appId: "1:148960367308:web:3d12793cbe20ad50aaa869",
  measurementId: "G-XDNR9H4EZ0"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
