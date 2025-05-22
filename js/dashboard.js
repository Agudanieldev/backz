import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

window.addEventListener("DOMContentLoaded", async () => {
  const creds = JSON.parse(sessionStorage.getItem("user-creds"));
  if (!creds) {
    window.location.href = "index.html";
    return;
  }

  try {
    const ref = doc(db, "UserAuthList", creds.uid);
    const docSnap = await getDoc(ref);
    if (docSnap.exists()) {
      const userData = docSnap.data();
      console.log("Fetched user data:", userData);

      // Update DOM here
      document.getElementById("userName").textContent = `${userData.firstname} ${userData.lastname}`;
      // Populate dashboard stats etc...
    } else {
      console.error("User data not found.");
    }
  } catch (err) {
    console.error("Failed to fetch user data:", err.message);
  }
});
