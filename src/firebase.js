// src/firebase.js
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail, 
  setPersistence, 
  browserLocalPersistence 
} from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDpdS8FgbNqWmTtlRLBw7onOVdK2rW7bgE",
  authDomain: "rtce-4df05.firebaseapp.com",
  projectId: "rtce-4df05",
  storageBucket: "rtce-4df05.appspot.com",
  messagingSenderId: "634860330071",
  appId: "1:634860330071:web:fcd4187460a85517005712",
  measurementId: "G-2M9J12VWRM"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Set persistence to LOCAL
const initializeAuthPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
    console.log('Auth persistence set to LOCAL');
  } catch (err) {
    console.error('Failed to set persistence:', err);
  }
};

initializeAuthPersistence();

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

export { 
  auth, 
  db, 
  googleProvider, 
  githubProvider, 
  signInWithRedirect, 
  getRedirectResult, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail 
};