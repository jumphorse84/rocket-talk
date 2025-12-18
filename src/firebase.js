// ---- Firebase Imports ----
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ---- Firebase Configuration ----
const firebaseConfig = typeof window !== 'undefined' && window.__firebase_config
    ? JSON.parse(window.__firebase_config)
    : { apiKey: "mock", authDomain: "mock", projectId: "mock", storageBucket: "mock", messagingSenderId: "mock", appId: "mock" };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const appId = typeof window !== 'undefined' && window.__app_id ? window.__app_id : 'default-app-id';
export const PUBLIC_CHAT_ID = "public_chat";
