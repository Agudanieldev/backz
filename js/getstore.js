

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAVYnmzJvPlFWOjXiJDFChXZ8zAzQp1Ufw",
  authDomain: "oceandwell-01.firebaseapp.com",
  databaseURL: "https://oceandwell-01-default-rtdb.firebaseio.com",
  projectId: "oceandwell-01",
  storageBucket: "oceandwell-01.appspot.com",
  messagingSenderId: "288421578797",
  appId: "1:288421578797:web:5c1a7abf0b7e133b5190a4",
  measurementId: "G-LFHVNGR715"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore();