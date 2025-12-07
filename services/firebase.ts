import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAGSvG6gqUz198-Y7NMLKq8dnYRmLPE7-o",
  authDomain: "darian-electronics.firebaseapp.com",
  databaseURL: "https://darian-electronics-default-rtdb.firebaseio.com",
  projectId: "darian-electronics",
  storageBucket: "darian-electronics.firebasestorage.app",
  messagingSenderId: "439635255126",
  appId: "1:439635255126:web:e666b5bde36eaaf3ac40f7",
  measurementId: "G-LXS4VHCQZ7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error("Login failed:", error);
    throw error;
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Logout failed:", error);
  }
};