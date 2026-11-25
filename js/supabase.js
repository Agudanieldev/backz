import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";

export const SUPABASE_URL = "https://wxtzvhobhvczzejbtxrx.supabase.co";
export const SUPABASE_KEY = "sb_publishable_cnqR6qJnTGRrLFl_p2gl7Q_Km_hCXXo";

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

export function money(value) {
  return Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[char]));
}

export function notice(element, message, type = "success") {
  if (!element) return;
  element.textContent = message;
  element.className = `notice ${type}`;
  element.style.display = "block";
  clearTimeout(element._hideTimer);
  element._hideTimer = setTimeout(() => {
    element.style.display = "none";
  }, 6000);
}

export async function getSessionProfile() {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) return null;

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", session.user.id)
    .single();

  if (error) {
    console.error("Could not load profile:", error.message);
    return null;
  }

  return profile;
}

export async function signOut() {
  await supabase.auth.signOut();
  window.location.replace("index.html");
}
