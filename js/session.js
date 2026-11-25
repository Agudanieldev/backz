import { supabase, getSessionProfile, money, signOut } from "./supabase.js";

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value;
}

// Shared session guard for the secondary dashboard pages
// (forex, crypto, stock, real-estate).
window.addEventListener("DOMContentLoaded", async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    window.location.replace("index.html");
    return;
  }

  const profile = await getSessionProfile();

  if (!profile) {
    await signOut();
    return;
  }

  setText("msg", profile.email || session.user.email);
  setText("greet", `Welcome back, ${profile.firstname || "Trader"}`);
  setText("activedeposit", money(profile.active_deposit));
  setText("profit", money(profile.profit));
  setText("realplan", profile.realplan);
  setText("totalPropertiesOwned", profile.total_properties_owned);
  setText("totalbalance", money(profile.total_balance));

  document.querySelectorAll("[data-admin-link]").forEach((link) => {
    link.style.display = profile.role === "admin" ? "" : "none";
  });

  const logout = document.getElementById("signoutbutton");
  if (logout) {
    logout.addEventListener("click", async (event) => {
      event.preventDefault();
      await signOut();
    });
  }
});
