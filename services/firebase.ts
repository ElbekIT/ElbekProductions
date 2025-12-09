import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, set, query, limitToLast, get, update, increment } from "firebase/database";
import { Order, OrderFormState, BanStatus } from "../types";

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

// --- BAN SYSTEM ---

export const getUserBanStatus = async (userId: string): Promise<BanStatus> => {
  try {
    const banRef = ref(db, `users/${userId}/security`);
    const snapshot = await get(banRef);
    if (snapshot.exists()) {
      return snapshot.val() as BanStatus;
    }
    return { isBanned: false, attempts: 0 };
  } catch (error) {
    return { isBanned: false, attempts: 0 };
  }
};

export const incrementBanStrikes = async (userId: string) => {
  try {
    const attemptsRef = ref(db, `users/${userId}/security/attempts`);
    await set(attemptsRef, increment(1));
    
    // Check if limit reached
    const status = await getUserBanStatus(userId);
    if (status.attempts >= 3) {
      await banUser(userId, "Fake Location Data");
      return true; // Banned
    }
    return false; // Not banned yet
  } catch (error) {
    console.error("Error incrementing strikes:", error);
    return false;
  }
};

export const banUser = async (userId: string, reason: string) => {
  try {
    const securityRef = ref(db, `users/${userId}/security`);
    await update(securityRef, {
      isBanned: true,
      reason: reason,
      bannedAt: Date.now()
    });
  } catch (error) {
    console.error("Error banning user:", error);
  }
};

// --- ORDER SYSTEM ---

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
    const recentOrdersQuery = query(ordersRef, limitToLast(200));
    const snapshot = await get(recentOrdersQuery);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      const allOrders = Object.values(data) as Order[];
      const userOrders = allOrders.filter(order => order.userId === userId);
      return userOrders.sort((a, b) => b.createdAt - a.createdAt);
    }
    return [];
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    return [];
  }
};