import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getStorage } from "firebase/storage"
import { getFirestore } from "firebase/firestore"

// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDBAzldeR4sCYbqAuMrLcGCrvv0R2Tadw4",
    authDomain: "react-chat-b47f8.firebaseapp.com",
    projectId: "react-chat-b47f8",
    storageBucket: "react-chat-b47f8.appspot.com",
    messagingSenderId: "1013248210890",
    appId: "1:1013248210890:web:aac9d9a14239fa7f378133"
};


export const app = initializeApp(firebaseConfig)
export const auth = getAuth()
export const storage = getStorage();
export const db = getFirestore();