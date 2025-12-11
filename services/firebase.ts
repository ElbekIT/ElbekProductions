
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import { getDatabase, ref, push, set, query, limitToLast, get, update, increment, remove } from "firebase/database";
import { Order, OrderFormState, BanStatus, User, FullUserData } from "../types";

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

// --- GOOGLE AUTH ---
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
    localStorage.removeItem('telegram_user_session'); // Clear Telegram session
  } catch (error) {
    console.error("Logout failed:", error);
  }
};

// --- TELEGRAM AUTH (CUSTOM) ---

export const registerTelegramUser = async (telegramId: string, nickname: string): Promise<User> => {
  const uid = `tg_${telegramId}`;
  const user: User = {
    uid,
    displayName: nickname,
    email: null,
    photoURL: null,
    telegramId: telegramId,
    authMethod: 'telegram'
  };

  try {
    // Save to DB so Admin can see them
    const userRef = ref(db, `users/${uid}/profile`);
    await update(userRef, {
      displayName: nickname,
      email: 'Telegram User',
      photoURL: '',
      lastLogin: Date.now(),
      telegramId: telegramId,
      authMethod: 'telegram'
    });
    
    // Save session locally
    localStorage.setItem('telegram_user_session', JSON.stringify(user));
    return user;
  } catch (e) {
    console.error("Failed to register Telegram user", e);
    throw e;
  }
};

export const getTelegramSession = (): User | null => {
  const session = localStorage.getItem('telegram_user_session');
  if (session) {
    return JSON.parse(session);
  }
  return null;
};

// --- USER SYNC & PROFILE ---

export const syncUserProfile = async (user: User) => {
  if (!user.uid) return;
  try {
    const userRef = ref(db, `users/${user.uid}/profile`);
    // Only update basic fields
    const snapshot = await get(userRef);
    const existingData = snapshot.val() || {};

    await update(userRef, {
      displayName: user.displayName || 'Unknown',
      email: user.email || (user.authMethod === 'telegram' ? 'Telegram User' : 'No Email'),
      photoURL: user.photoURL || '',
      lastLogin: Date.now(),
      telegramId: existingData.telegramId || user.telegramId || null,
      authMethod: user.authMethod
    });
  } catch (e) {
    console.error("Failed to sync user profile", e);
  }
};

export const getUserProfile = async (userId: string): Promise<{ telegramId?: string }> => {
  try {
    const userRef = ref(db, `users/${userId}/profile`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {};
  } catch (error) {
    console.error("Error fetching user profile:", error);
    return {};
  }
};

export const updateUserTelegramId = async (userId: string, telegramId: string) => {
  try {
    const userRef = ref(db, `users/${userId}/profile`);
    await update(userRef, { telegramId });
    return true;
  } catch (error) {
    console.error("Error updating telegram ID:", error);
    return false;
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

export const incrementBanStrikes = async (userId: string): Promise<boolean> => {
  try {
    const securityRef = ref(db, `users/${userId}/security`);
    const snapshot = await get(securityRef);
    let attempts = 0;
    
    if (snapshot.exists()) {
      attempts = snapshot.val().attempts || 0;
    }

    attempts += 1;

    // Ban if 3 strikes
    if (attempts >= 3) {
      await update(securityRef, {
        attempts,
        isBanned: true,
        reason: "Location Verification Failed 3 times (System Auto-Ban)",
        bannedAt: Date.now()
      });
      console.log(`🚫 BANNED USER (AUTO): ${userId}`);
      return true; // Is Banned
    } else {
      await update(securityRef, { attempts });
      return false; // Not Banned yet
    }
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
    console.log(`🚫 BANNED USER: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error banning user:", error);
    return false;
  }
};

export const unbanUser = async (userId: string) => {
  try {
    const securityRef = ref(db, `users/${userId}/security`);
    // Reset security status
    await set(securityRef, {
      isBanned: false,
      attempts: 0,
      reason: null,
      bannedAt: null
    });
    console.log(`✅ UNBANNED USER: ${userId}`);
    return true;
  } catch (error) {
    console.error("Error unbanning user:", error);
    return false;
  }
};

// --- ADMIN FEATURES ---

export const getAllUsersFromDb = async (): Promise<FullUserData[]> => {
  try {
    const usersRef = ref(db, 'users');
    const snapshot = await get(usersRef);
    
    if (snapshot.exists()) {
      const data = snapshot.val();
      // data is object { uid1: { profile: {...}, security: {...} }, uid2: ... }
      const usersArray: FullUserData[] = Object.entries(data).map(([uid, val]: [string, any]) => ({
        uid,
        profile: val.profile || { displayName: 'Unknown', email: 'Unknown', photoURL: '', lastLogin: 0 },
        security: val.security || { isBanned: false, attempts: 0 }
      }));
      return usersArray.sort((a, b) => (b.profile.lastLogin || 0) - (a.profile.lastLogin || 0));
    }
    return [];
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
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

// NEW: Deliver finished work
export const deliverOrderResult = async (orderId: string, imageUrl: string, description: string) => {
  try {
    const orderRef = ref(db, `orders/${orderId}`);
    await update(orderRef, { 
      status: 'completed',
      resultImage: imageUrl,
      resultDescription: description
    });
    console.log("✅ Order delivered successfully");
    return true;
  } catch (error) {
    console.error("❌ Error delivering order:", error);
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
