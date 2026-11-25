import {
  supabase,
  getSessionProfile,
  money,
  formatDate,
  esc,
  notice,
  signOut,
} from "./supabase.js";

const $ = (id) => document.getElementById(id);

const requestsBody = $("requestsBody");
const usersBody = $("usersBody");
const messagesBody = $("messagesBody");
const adminNotice = $("adminNotice");

let profiles = [];
let transactions = [];
let messages = [];

function profileById(id) {
  return profiles.find((profile) => profile.id === id);
}

function renderStats() {
  const pending = transactions.filter((tx) => tx.status === "pending").length;
  const approvedDeposits = transactions
    .filter((tx) => tx.type === "deposit" && tx.status === "approved")
    .reduce((total, tx) => total + Number(tx.amount), 0);
  const held = profiles.reduce(
    (total, profile) => total + Number(profile.total_balance),
    0
  );

  $("totalUsers").textContent = profiles.length;
  $("pendingRequests").textContent = pending;
  $("approvedDeposits").textContent = `$${money(approvedDeposits)}`;
  $("totalHeld").textContent = `$${money(held)}`;
}

function renderRequests() {
  const pending = transactions.filter((tx) => tx.status === "pending");

  if (!pending.length) {
    requestsBody.innerHTML = `
      <tr><td colspan="6" class="empty">No pending requests. You are all caught up.</td></tr>`;
    return;
  }

  requestsBody.innerHTML = pending
    .map((tx) => {
      const user = profileById(tx.user_id);
      const name = user
        ? `${user.firstname || ""} ${user.lastname || ""}`.trim() || user.email
        : "Unknown user";

      return `
        <tr>
          <td>${formatDate(tx.created_at)}</td>
          <td>${esc(name)}</td>
          <td class="capitalize">${esc(tx.type)}</td>
          <td>$${money(tx.amount)}</td>
          <td class="wallet-cell">${esc(tx.wallet_address || "—")}</td>
          <td class="actions">
            <button class="btn btn-sm btn-primary" data-id="${tx.id}" data-decision="approved">Approve</button>
            <button class="btn btn-sm btn-danger" data-id="${tx.id}" data-decision="rejected">Reject</button>
          </td>
        </tr>`;
    })
    .join("");
}

function renderUsers() {
  if (!profiles.length) {
    usersBody.innerHTML = `<tr><td colspan="7" class="empty">No users yet.</td></tr>`;
    return;
  }

  usersBody.innerHTML = profiles
    .map((profile) => {
      const name =
        `${profile.firstname || ""} ${profile.lastname || ""}`.trim() || "—";
      return `
        <tr>
          <td>${esc(name)}</td>
          <td>${esc(profile.email || "—")}</td>
          <td><span class="badge ${profile.role === "admin" ? "approved" : "neutral"}">${esc(profile.role)}</span></td>
          <td>$${money(profile.total_balance)}</td>
          <td>$${money(profile.active_deposit)}</td>
          <td>$${money(profile.profit)}</td>
          <td>${formatDate(profile.created_at)}</td>
        </tr>`;
    })
    .join("");
}

function renderMessages() {
  if (!messages.length) {
    messagesBody.innerHTML = `<tr><td colspan="6" class="empty">No contact messages yet.</td></tr>`;
    return;
  }

  messagesBody.innerHTML = messages
    .map((entry) => {
      const message = entry.message || "";
      const preview =
        message.length > 140 ? `${message.slice(0, 140)}…` : message;

      return `
        <tr>
          <td>${formatDate(entry.created_at)}</td>
          <td>${esc(entry.name)}</td>
          <td>${esc(entry.email)}</td>
          <td>${esc(entry.phone || "—")}</td>
          <td>${esc(entry.subject || "—")}</td>
          <td class="message-cell" title="${esc(message)}">${esc(preview)}</td>
        </tr>`;
    })
    .join("");
}

function renderAll() {
  renderStats();
  renderRequests();
  renderUsers();
  renderMessages();
}

async function loadData() {
  const [profilesResult, transactionsResult, messagesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("transactions")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("contact_messages")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  if (profilesResult.error) console.error(profilesResult.error.message);
  if (transactionsResult.error) console.error(transactionsResult.error.message);
  if (messagesResult.error) console.error(messagesResult.error.message);

  profiles = profilesResult.data || [];
  transactions = transactionsResult.data || [];
  messages = messagesResult.data || [];
  renderAll();
}

requestsBody.addEventListener("click", async (event) => {
  const button = event.target.closest("button[data-id]");
  if (!button) return;

  const id = Number(button.dataset.id);
  const decision = button.dataset.decision;

  button.disabled = true;
  button.textContent = "Saving…";

  const { error } = await supabase.rpc("review_transaction", {
    p_transaction_id: id,
    p_decision: decision,
  });

  if (error) {
    notice(adminNotice, error.message, "error");
    await loadData();
    return;
  }

  notice(
    adminNotice,
    decision === "approved"
      ? "Request approved and balances updated."
      : "Request rejected."
  );
  await loadData();
});

$("refreshAdmin").addEventListener("click", async () => {
  await loadData();
  notice(adminNotice, "Dashboard refreshed.");
});

document.querySelectorAll("#signoutbutton").forEach((button) => {
  button.addEventListener("click", async (event) => {
    event.preventDefault();
    await signOut();
  });
});

async function init() {
  const profile = await getSessionProfile();

  if (!profile) {
    await supabase.auth.signOut();
    window.location.replace("index.html");
    return;
  }

  if (profile.role !== "admin") {
    window.location.replace("home.html");
    return;
  }

  $("msg").textContent = profile.email || "";
  $("adminName").textContent = `${profile.firstname || "Admin"} ${profile.lastname || ""}`.trim();

  await loadData();
}

init();
