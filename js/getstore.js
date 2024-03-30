

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyB5kLnG8N55b9HYAt16qOSlosJM39KdM1I",
  authDomain: "tradezanga-9a60e.firebaseapp.com",
  projectId: "tradezanga-9a60e",
  storageBucket: "tradezanga-9a60e.appspot.com",
  messagingSenderId: "454930065029",
  appId: "1:454930065029:web:a093586b5bc485c2d36bec",
  measurementId: "G-GEMHM4Z3H9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();