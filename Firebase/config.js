// config.js
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-app.js';
import { getAuth, GoogleAuthProvider } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js';


const firebaseConfig = {
  apiKey: "AIzaSyB5rM-Z_YxL6mpPb5qX3S7A-ykBshAA_Ro",
  authDomain: "dev-85f8d.firebaseapp.com",
  projectId: "dev-85f8d",
  storageBucket: "dev-85f8d.firebasestorage.app",
  messagingSenderId: "884673937857",
  appId: "1:884673937857:web:97943fdefae91ccfe36f40",
  measurementId: "G-4CR2VG9QTK"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
console.log('Firebase app initialized:', app.name);
export const googleProvider = new GoogleAuthProvider();     
export const db = getFirestore(app);
console.log('Firestore instance created:', db);
