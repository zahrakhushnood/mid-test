// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from 'firebase/firestore';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyClrRgkjRbvj9ZjPm6jcjh9L90meX0ik1c",
  authDomain: "database-adeda.firebaseapp.com",
  projectId: "database-adeda",
  storageBucket: "database-adeda.firebasestorage.app",
  messagingSenderId: "468499536029",
  appId: "1:468499536029:web:686bafe6b47a488652dc74",
  measurementId: "G-9L5TPDDM1Z"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);
const auth = getAuth(app);
// const provider = new GoogleAuthProvider();
const db = getFirestore(app);
export { db,auth};