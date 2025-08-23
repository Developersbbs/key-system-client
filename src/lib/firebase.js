import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// IMPORTANT: Replace with your actual Firebase project configuration.
const firebaseConfig = {
  apiKey: "AIzaSyDooYI07Tmnq6diKXJJgyz5-HxuwPK3ss8",
  authDomain: "key-system-fb460.firebaseapp.com",
  projectId: "key-system-fb460",
  storageBucket: "key-system-fb460.firebasestorage.app",
  messagingSenderId: "318235277273",
  appId: "1:318235277273:web:f15643170f1586b76c0bc8"
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Use named exports for services
export { auth, db };