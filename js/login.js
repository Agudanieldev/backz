


      import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
      import { getFirestore, doc, getDoc} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
      import { getAuth, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
    
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
    
      // Initialize Firebase
      const app = initializeApp(firebaseConfig);
      const db = getFirestore();
      const auth = getAuth(app);
      // const dbref = ref(db);

      let EmailInp = document.getElementById('emailInp');
      let PassInp = document.getElementById('passwordInp');
      let MainForm = document.getElementById('MainForm');
      let Preloader = document.getElementById('preloader');




      let SignInUser = evt => {
        evt.preventDefault();

        console.log("Login started...");
        // Show preloader
        Preloader.style.display = 'block';

        signInWithEmailAndPassword(auth, EmailInp.value, PassInp.value)
            .then(async (userCredential) => {
                var ref = doc(db, "UserAuthList", userCredential.user.uid);
                const docSnap = await getDoc(ref);

                if (docSnap.exists()) {
                    sessionStorage.setItem("user-info", JSON.stringify({
                        firstname: docSnap.data().firstname,
                        lastname: docSnap.data().lastname,
                        active_deposit: docSnap.data().active_deposit,
                        profit: docSnap.data().profit,
                        total_balance: docSnap.data().total_balance
                    }));
                    sessionStorage.setItem("user-creds", JSON.stringify(userCredential.user));
                    // Hide preloader
                    Preloader.style.display = 'none';
                    window.location.href = "home.html";
                }
            })
            .catch((error) => {
                alert(error.message);
                console.error(error.message);
                console.error(error.code);
                // Hide preloader
                Preloader.style.display = 'none';
            });
    };

    MainForm.addEventListener('submit', SignInUser);