
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCBazl-txJZADiWOQyrv9y66Vq75BrTWXM",
    authDomain: "sitoded1.firebaseapp.com",
    projectId: "sitoded1",
    storageBucket: "sitoded1.appspot.com",
    messagingSenderId: "1018889038803",
    appId: "1:1018889038803:web:9175b4b7f97625a1d2dd26",
    measurementId: "G-M2CD1QCDPL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
const analytics = getAnalytics(app);