import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyB1KIzGCvifH-lzNzOtY0F__AL6PU7_B_Y",
  authDomain: "elbekproductions.firebaseapp.com",
  databaseURL: "https://elbekproductions-default-rtdb.firebaseio.com",
  projectId: "elbekproductions",
  storageBucket: "elbekproductions.firebasestorage.app",
  messagingSenderId: "467619718063",
  appId: "1:467619718063:web:f370881cffbb396899c55a",
  measurementId: "G-Y46P6R2H8V"
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