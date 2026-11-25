import { supabase } from "./supabase.js";

const forms = document.querySelectorAll("#WithdrawalRequests");

forms.forEach((form) => {
  const alertBox = form.querySelector(".alert");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const amount = Number(form.querySelector("#amount")?.value);
    const wallet = form.querySelector("#walletId")?.value.trim();

    if (!(amount > 0) || !wallet) {
      if (alertBox) {
        alertBox.textContent = "Enter a valid amount and wallet address.";
        alertBox.style.display = "block";
      }
      return;
    }

    const { error } = await supabase.from("transactions").insert({
      type: "withdraw",
      amount,
      wallet_address: wallet,
    });

    if (alertBox) {
      alertBox.textContent = error
        ? error.message
        : "Your withdrawal request has been sent successfully.";
      alertBox.style.display = "block";
      setTimeout(() => {
        alertBox.style.display = "none";
      }, 6000);
    }

    if (!error) form.reset();
  });
});
