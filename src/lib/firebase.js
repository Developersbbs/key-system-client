import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace with your actual Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyBAu-ylWyd9SB8T9l4j6V_hhxQs8jB-ZtI",
  authDomain: "key-systems-client-98765.firebaseapp.com",
  projectId: "key-systems-client-98765",
  storageBucket: "key-systems-client-98765.firebasestorage.app",
  messagingSenderId: "192945908708",
  appId: "1:192945908708:web:5f3ca56b3bc93af035f5f1"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Use named exports for services
export { auth, db };