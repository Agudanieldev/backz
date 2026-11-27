import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { OtherPaymentMethods } from "./OtherPaymentMethods";
import { WalletAddress } from "./WalletAddress";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function DepositModal({ open, onClose, onSaved }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) return;
    setAmount("");
    setError("");
    setSuccess("");
  }, [open]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);
    if (!(value > 0)) {
      setError("Enter a valid deposit amount.");
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase
      .from("transactions")
      .insert({ type: "deposit", amount: value });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAmount("");
    setSuccess("Deposit request sent. An admin will review it shortly.");
    await onSaved();
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Request a deposit"
      description="Send your deposit to the Bitcoin address below, then submit the amount you sent."
    >
      <WalletAddress />

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        <Input
          label="Amount (USD)"
          type="number"
          min={1}
          step="0.01"
          placeholder="500"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
          required
          autoFocus
        />

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" size="lg" fullWidth loading={saving}>
          Send deposit request
        </Button>
      </form>

      <OtherPaymentMethods className="mt-4" onChatAdmin={onClose} />

      <p className="mt-3 text-[0.625rem] leading-relaxed text-text-muted">
        Deposits are reviewed by an admin before your balance is updated.
      </p>
    </Modal>
  );
}
