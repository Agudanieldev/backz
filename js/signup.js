import { supabase } from "./supabase.js";

const form = document.getElementById("MainForm");
const firstName = document.getElementById("firstnameInp");
const lastName = document.getElementById("lastnameInp");
const emailInput = document.getElementById("emailInp");
const passwordInput = document.getElementById("passwordInp");
const confirmInput = document.getElementById("confirmInp");
const preloader = document.getElementById("preloader");
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

  const first = firstName.value.trim();
  const last = lastName.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!first || !last || !email || !password) {
    showModal("Please fill in every field.");
    return;
  }

  if (password.length < 6) {
    showModal("Password must be at least 6 characters.");
    return;
  }

  if (password !== confirmInput.value) {
    showModal("Passwords do not match.");
    return;
  }

  preloader.style.display = "block";

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { firstname: first, lastname: last },
    },
  });

  preloader.style.display = "none";

  if (error) {
    const message = /rate limit/i.test(error.message)
      ? "Signup emails are temporarily rate limited. Please try again in a few minutes."
      : error.message;
    showModal(message);
    return;
  }

  if (data.session) {
    window.location.replace("home.html");
    return;
  }

  showModal("Account created. Check your email to confirm it, then log in.");
  form.reset();
});
