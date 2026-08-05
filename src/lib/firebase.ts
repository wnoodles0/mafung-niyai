import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics, isSupported, Analytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyB_WhkAqPMhzDycK4wFyjpBNrau8yif-34",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "my-auth-app-107d1.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "my-auth-app-107d1",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "my-auth-app-107d1.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "533855890531",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:533855890531:web:d81ac4d3ac450615c55c56",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-H5VC414T7G",
};

// Check if Firebase is configured
export const isFirebaseConfigured = true;

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize SDKs
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);

// Client-side Analytics initialization
export let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  });
}

export default app;
