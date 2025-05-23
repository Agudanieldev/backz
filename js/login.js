import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// Firebase config
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
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const EmailInp = document.getElementById('emailInp');
const PassInp = document.getElementById('passwordInp');
const MainForm = document.getElementById('MainForm');
const Preloader = document.getElementById('preloader');
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

// Modal Handling
const showModal = (message) => {
  modalMessage.textContent = message;
  modal.style.display = "flex";
};
modalClose.onclick = () => modal.style.display = "none";
window.onclick = (event) => { if (event.target == modal) modal.style.display = "none"; };

// Prevent logged-in users from accessing login
window.onload = () => {
  if (sessionStorage.getItem("user-creds")) {
    window.location.href = "home.html";
  }
};

// Handle Login
const SignInUser = async (evt) => {
  evt.preventDefault();
  if (!EmailInp.value || !PassInp.value) {
    showModal("Please enter both email and password.");
    return;
  }

  Preloader.style.display = 'block';

  try {
    const userCredential = await signInWithEmailAndPassword(auth, EmailInp.value, PassInp.value);
    const ref = doc(db, "UserAuthList", userCredential.user.uid);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const userData = docSnap.data();
      sessionStorage.setItem("user-info", JSON.stringify(userData));
      sessionStorage.setItem("user-creds", JSON.stringify(userCredential.user));
      window.location.href = "home.html";
    } else {
      showModal("User data not found in database.");
    }

  } catch (error) {
    let msg = "Login failed.";
    switch (error.code) {
      case "auth/user-not-found":
        msg = "No account found with that email."; break;
      case "auth/wrong-password":
        msg = "Incorrect password."; break;
      case "auth/invalid-email":
        msg = "Invalid email."; break;
      case "auth/invalid-credential":
        msg = "Invalid credential."; break;
      case "auth/too-many-requests":
        msg = "Too many failed attempts. Try again later."; break;
      case "auth/network-request-failed":
        msg = "Network error. Please check your connection."; break;
      default:
        msg = error.message; break;
    }
    showModal(msg);
  } finally {
    Preloader.style.display = 'none';
  }
};

MainForm.addEventListener('submit', SignInUser);
