// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
 apiKey: "AIzaSyBAu-ylWyd9SB8T9l4j6V_hhxQs8jB-ZtI",
  authDomain: "key-systems-client-98765.firebaseapp.com",
  projectId: "key-systems-client-98765",
  storageBucket: "key-systems-client-98765.firebasestorage.app",
  messagingSenderId: "192945908708",
  appId: "1:192945908708:web:5f3ca56b3bc93af035f5f1"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Storage
export const storage = getStorage(app);

// Initialize Firebase Auth (if needed)
export const auth = getAuth(app);

export default app;