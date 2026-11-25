import { supabase } from "./supabase.js";

const form = document.getElementById("ResetForm");
const passwordInput = document.getElementById("passwordInp");
const confirmInput = document.getElementById("confirmInp");
const modal = document.getElementById("modal");
const modalMessage = document.getElementById("modal-message");
const modalClose = document.getElementById("modal-close");

const showModal = (message) => {
  modalMessage.textContent = message;
  modal.style.display = "flex";
};

modalClose.addEventListener("click", () => {
  modal.style.display = "none";
});

window.addEventListener("click", (event) => {
  if (event.target === modal) modal.style.display = "none";
});

(async function checkRecoverySession() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    showModal("Open the password reset link from your email first.");
    form.querySelector("button[type=submit]").disabled = true;
  }
})();

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const password = passwordInput.value;

  if (password.length < 6) {
    showModal("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmInput.value) {
    showModal("Passwords do not match.");
    return;
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    showModal(error.message);
    return;
  }

  showModal("Password updated. Redirecting you to the login page...");
  await supabase.auth.signOut();
  setTimeout(() => {
    window.location.replace("index.html");
  }, 1800);
});
