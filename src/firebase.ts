// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtxrx-KGT5jWNVLDagdcaMEY_Pp04qWiM",
  authDomain: "trubro-pt.firebaseapp.com",
  projectId: "trubro-pt",
  storageBucket: "trubro-pt.appspot.com",
  messagingSenderId: "323952412810",
  appId: "1:323952412810:web:1e055542363951bc26c573",
  measurementId: "G-V0RR0L8PQZ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = isSupported().then(yes => yes ? getAnalytics(app) : null);
export const auth = getAuth(app);
// Initialize Firestore and export it
export const db = getFirestore(app);