// Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCPvegSUDeJKKEyY46dbzd_2W3fnE0hDyg",
  authDomain: "apix-company.firebaseapp.com",
  projectId: "apix-company",
  storageBucket: "apix-company.firebasestorage.app",
  messagingSenderId: "440995997284",
  appId: "1:440995997284:web:f9922138cf62fab3eee171",
  measurementId: "G-ZJ3KYR0YH0"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();

const db = getFirestore(app);

export {
  app,
  auth,
  googleProvider,
  db
};