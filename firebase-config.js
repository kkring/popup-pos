// firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyDqCrJqBCqhfKTCTNoTUBo1wvRWtVoY9Pg",
  authDomain: "popup-pos-8d5a2.firebaseapp.com",
  databaseURL: "https://popup-pos-8d5a2-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "popup-pos-8d5a2",
  storageBucket: "popup-pos-8d5a2.firebasestorage.app",
  messagingSenderId: "1074191091119",
  appId: "1:1074191091119:web:8e77358cccbd7bc280db5a"
};

export const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
