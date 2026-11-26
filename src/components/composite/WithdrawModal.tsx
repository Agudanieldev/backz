import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

interface WithdrawModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function WithdrawModal({ open, onClose, onSaved }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [wallet, setWallet] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) return;
    setAmount("");
    setWallet("");
    setError("");
    setSuccess("");
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);
    if (!(value > 0)) {
      setError("Enter a valid withdrawal amount.");
      return;
    }

    if (!wallet.trim()) {
      setError("Enter your wallet address.");
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from("transactions").insert({
      type: "withdraw",
      amount: value,
      wallet_address: wallet.trim(),
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAmount("");
    setWallet("");
    setSuccess("Withdrawal request sent. An admin will review it shortly.");
    await onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request a withdrawal"
      description="Withdrawals are reviewed by an admin before they are paid out to your wallet."
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          label="Amount (USD)"
          type="number"
          min={1}
          step="0.01"
          placeholder="200"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          autoFocus
        />

        <Input
          label="Bitcoin wallet address"
          placeholder="bc1..."
          value={wallet}
          onChange={(event) => setWallet(event.target.value)}
          required
        />

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" size="lg" fullWidth loading={saving}>
          Send withdrawal request
        </Button>
      </form>
    </Modal>
  );
}
