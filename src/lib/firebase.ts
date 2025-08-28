// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";

// Your web app's Firebase configuration is loaded from .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
// Check if the app is already initialized to prevent errors
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

// Connect to emulators in development (opcional)
if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
  // Solo conectar si no está ya conectado
  try {
    // connectFirestoreEmulator(db, 'localhost', 8080);
    // connectAuthEmulator(auth, 'http://localhost:9099');
  } catch (error) {
    // Emulators already connected
  }
}

export { app, db, auth };

// Utilidades comunes para Firestore
export const collections = {
  users: 'users',
  posts: 'posts',
  categories: 'categories',
  races: 'races',
  pilots: 'pilots',
  teams: 'teams',
  comments: 'comments'
} as const;
