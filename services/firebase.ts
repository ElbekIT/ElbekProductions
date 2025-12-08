import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, set, query, orderByChild, equalTo, get } from "firebase/database";
import { Order, OrderFormState } from "../types";

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
const db = getDatabase(app);
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

// Database Functions
export const saveOrderToDb = async (userId: string, orderData: OrderFormState) => {
  try {
    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    
    const order: Order = {
      ...orderData,
      id: newOrderRef.key as string,
      userId,
      createdAt: Date.now(),
      status: 'sent'
    };

    await set(newOrderRef, order);
    return true;
  } catch (error) {
    console.error("Error saving order:", error);
    return false;
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = ref(db, 'orders');
    const userOrdersQuery = query(ordersRef, orderByChild('userId'), equalTo(userId));
    const snapshot = await get(userOrdersQuery);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.values(data).sort((a: any, b: any) => b.createdAt - a.createdAt) as Order[];
    }
    return [];
  } catch (error) {
    console.error("Error fetching orders:", error);
    return [];
  }
};
