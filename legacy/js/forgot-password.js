import { supabase } from "./supabase.js";

const form = document.getElementById("MainForm");
const emailInput = document.getElementById("emailInp");
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

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  if (!email) {
    showModal("Please enter your email.");
    return;
  }

  const redirectTo = new URL("reset.html", window.location.href).href;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    showModal(error.message);
    return;
  }

  showModal("If that email is registered, a password reset link is on its way.");
});
