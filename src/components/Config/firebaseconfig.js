import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
    apiKey: "AIzaSyAbrLWMTVv0RFPBGpwPDBrZ44sA2avLwcc",
    authDomain: "task-manager-41b77.firebaseapp.com",
    projectId: "task-manager-41b77",
    storageBucket: "task-manager-41b77.appspot.com",
    messagingSenderId: "466510851578",
    appId: "1:466510851578:web:3b45a8e0ed9bdfc3bdc843"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const provider = new GoogleAuthProvider()
export const db = getFirestore(app)
