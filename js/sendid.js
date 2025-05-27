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

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get a reference to the Firestore database
const db = firebase.firestore();

document.getElementById("WithdrawalRequests").addEventListener("submit", submitForm);

function submitForm(e) {
  e.preventDefault();

  var name = getElementVal("name");
  var walletId = getElementVal("walletId");
  var amount = getElementVal("amount");
  var emailId = getElementVal("emailId");

  saveMessages(name, emailId, walletId, amount);

  //   Enable alert
  document.querySelector(".alert").style.display = "block";

  //   Remove the alert
  setTimeout(() => {
    document.querySelector(".alert").style.display = "none";
  }, 5000);

  //   Reset the form
  document.getElementById("WithdrawalRequests").reset();
}

const saveMessages = (name, emailId, walletId, amount) => {
  // Add a document to the "WithdrawalRequests" collection
  db.collection("WithdrawalRequests").add({
    name: name,
    email: emailId,
    Wallet: walletId,
    amount: amount,
  })
  .then((docRef) => {
    console.log("Document written with ID: ", docRef.id);
  })
  .catch((error) => {
    console.error("Error adding document: ", error);
  });
};

const getElementVal = (id) => {
  return document.getElementById(id).value;
};
