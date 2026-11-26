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

const depositForm = $("depositForm");
const withdrawForm = $("withdrawForm");
const depositNotice = $("depositNotice");
const withdrawNotice = $("withdrawNotice");
const transactionsBody = $("transactionsBody");

function renderProfile(profile) {
  $("greet").textContent = `Welcome back, ${profile.firstname || "Trader"}`;
  $("msg").textContent = profile.email || "";
  $("userRole").textContent = profile.role === "admin" ? "Admin" : "Investor";

  $("activedeposit").textContent = money(profile.active_deposit);
  $("profit").textContent = money(profile.profit);
  $("realplan").textContent = profile.realplan;
  $("totalPropertiesOwned").textContent = profile.total_properties_owned;
  $("totalbalance").textContent = money(profile.total_balance);

  document.querySelectorAll("[data-admin-link]").forEach((link) => {
    link.style.display = profile.role === "admin" ? "" : "none";
  });
}

function renderTransactions(transactions) {
  if (!transactions.length) {
    transactionsBody.innerHTML = `
      <tr>
        <td colspan="5" class="empty">No requests yet. Submit a deposit or withdrawal above.</td>
      </tr>`;
    return;
  }

  transactionsBody.innerHTML = transactions
    .map(
      (tx) => `
      <tr>
        <td>${formatDate(tx.created_at)}</td>
        <td class="capitalize">${esc(tx.type)}</td>
        <td>$${money(tx.amount)}</td>
        <td class="wallet-cell">${esc(tx.wallet_address || "—")}</td>
        <td><span class="badge ${esc(tx.status)}">${esc(tx.status)}</span></td>
      </tr>`
    )
    .join("");
}

async function loadTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error(error.message);
    return;
  }

  renderTransactions(data || []);
}

async function createTransaction(payload) {
  const { error } = await supabase.from("transactions").insert(payload);
  if (error) throw error;
}

depositForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const amount = Number($("depositAmount").value);

  if (!(amount > 0)) {
    notice(depositNotice, "Enter a valid deposit amount.", "error");
    return;
  }

  try {
    await createTransaction({ type: "deposit", amount });
    depositForm.reset();
    notice(depositNotice, "Deposit request sent. An admin will review it shortly.");
    await loadTransactions();
  } catch (error) {
    notice(depositNotice, error.message, "error");
  }
});

withdrawForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const amount = Number($("withdrawAmount").value);
  const wallet = $("withdrawWallet").value.trim();

  if (!(amount > 0)) {
    notice(withdrawNotice, "Enter a valid withdrawal amount.", "error");
    return;
  }

  if (!wallet) {
    notice(withdrawNotice, "Enter your wallet address.", "error");
    return;
  }

  try {
    await createTransaction({
      type: "withdraw",
      amount,
      wallet_address: wallet,
    });
    withdrawForm.reset();
    notice(withdrawNotice, "Withdrawal request sent. An admin will review it shortly.");
    await loadTransactions();
  } catch (error) {
    notice(withdrawNotice, error.message, "error");
  }
});

$("refreshTransactions").addEventListener("click", async () => {
  await loadTransactions();
  notice($("transactionsNotice"), "Transactions refreshed.");
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

  renderProfile(profile);
  await loadTransactions();
}

init();
