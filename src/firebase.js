// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  browserLocalPersistence,
  setPersistence,
} from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDpdS8FgbNqWmTtlRLBw7onOVdK2rW7bgE",
  authDomain: "rtce-4df05.firebaseapp.com",
  projectId: "rtce-4df05",
  storageBucket: "rtce-4df05.firebasestorage.app",
  messagingSenderId: "634860330071",
  appId: "1:634860330071:web:fcd4187460a85517005712",
  measurementId: "G-2M9J12VWRM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

googleProvider.setCustomParameters({ prompt: "select_account" });

setPersistence(auth, browserLocalPersistence)
  .then(() => console.log("Auth persistence set to LOCAL"))
  .catch((err) => console.error("Persistence error:", err));

export {
  auth,
  googleProvider,
  githubProvider,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  analytics,
};