import { supabase } from "./supabase.js";

const emailInput = document.getElementById("emailInp");
const passwordInput = document.getElementById("passwordInp");
const form = document.getElementById("MainForm");
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

async function redirectToDashboard(user) {
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  window.location.replace(profile?.role === "admin" ? "admin.html" : "home.html");
}

window.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirectToDashboard(session.user);
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email || !password) {
    showModal("Please enter both email and password.");
    return;
  }

  preloader.style.display = "block";

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    const messages = {
      "Invalid login credentials": "Invalid email or password.",
      "Email not confirmed": "Please confirm your email address before logging in.",
      "Too many requests": "Too many attempts. Please try again later.",
    };
    showModal(messages[error.message] || error.message);
    preloader.style.display = "none";
    return;
  }

  await redirectToDashboard(data.user);
});
