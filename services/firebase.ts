import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, set, query, limitToLast, get, update } from "firebase/database";
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
    console.log("✅ Order saved successfully to DB:", newOrderRef.key);
    return true;
  } catch (error) {
    console.error("❌ Error saving order to DB:", error);
    return false;
  }
};

export const updateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
  try {
    const orderRef = ref(db, `orders/${orderId}`);
    await update(orderRef, { status: newStatus });
    console.log("✅ Order updated:", newStatus);
    return true;
  } catch (error) {
    console.error("❌ Error updating order:", error);
    return false;
  }
};

export const getAllOrders = async (): Promise<Order[]> => {
  try {
    const ordersRef = ref(db, 'orders');
    const recentOrdersQuery = query(ordersRef, limitToLast(200));
    const snapshot = await get(recentOrdersQuery);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const allOrders = Object.values(data) as Order[];
      return allOrders.sort((a, b) => b.createdAt - a.createdAt);
    }
    return [];
  } catch (error) {
    console.error("❌ Error fetching all orders:", error);
    return [];
  }
};

export const getUserOrders = async (userId: string): Promise<Order[]> => {
  try {
    const ordersRef = ref(db, 'orders');
    
    // FETCH ALL STRATEGY
    // We fetch the last 200 orders globally and filter client-side.
    // This avoids "Index not defined" errors in Firebase Rules.
    const recentOrdersQuery = query(ordersRef, limitToLast(200));
    const snapshot = await get(recentOrdersQuery);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // Convert Object { key: val } to Array [val]
      const allOrders = Object.values(data) as Order[];
      
      console.log(`Downloaded ${allOrders.length} total orders. Filtering for user: ${userId}`);

      // Filter manually by userId to ensure accuracy
      const userOrders = allOrders.filter(order => order.userId === userId);
      
      // Sort by date descending (newest first)
      return userOrders.sort((a, b) => b.createdAt - a.createdAt);
    } else {
      console.log("No orders found in database at all.");
    }
    
    return [];
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return [];
  }
};