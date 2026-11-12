import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

// Live production Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCgZZT_m4c3Jmg-ZjYWjC0LAx8M1rLybYs",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "twokai-ai-platform.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "twokai-ai-platform",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "twokai-ai-platform.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "929373997039",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:929373997039:web:6e6cc6db01e8ed2024581a"
};

// Initialize Firebase safely
let app: FirebaseApp;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const isFirebaseConfigured = true;

export default app;
