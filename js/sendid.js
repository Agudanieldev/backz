const firebaseConfig = {
  apiKey: "AIzaSyAVYnmzJvPlFWOjXiJDFChXZ8zAzQp1Ufw",
  authDomain: "oceandwell-01.firebaseapp.com",
  projectId: "oceandwell-01",
  storageBucket: "oceandwell-01.appspot.com",
  messagingSenderId: "288421578797",
  appId: "1:288421578797:web:5c1a7abf0b7e133b5190a4",
  measurementId: "G-LFHVNGR715"
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
  }, 3000);

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
