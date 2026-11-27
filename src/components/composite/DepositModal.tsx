import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import {
  INVESTMENT_PACKAGES,
  INVESTMENT_TYPE_OPTIONS,
  isInvestmentType,
} from "@/lib/investmentPlans";
import type { InvestmentType } from "@/lib/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";
import { OtherPaymentMethods } from "./OtherPaymentMethods";
import { WalletAddress } from "./WalletAddress";

interface DepositModalProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => Promise<void> | void;
}

export function DepositModal({ open, onClose, onSaved }: DepositModalProps) {
  const [amount, setAmount] = useState("");
  const [investmentType, setInvestmentType] = useState<InvestmentType>("real");
  const [packageName, setPackageName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) return;
    setAmount("");
    setInvestmentType("real");
    setPackageName("");
    setError("");
    setSuccess("");
  }, [open]);

  function handleTypeChange(value: string) {
    if (!isInvestmentType(value)) return;
    setInvestmentType(value);
    setPackageName((current) =>
      INVESTMENT_PACKAGES[value].includes(current) ? current : "",
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setSuccess("");

    const value = Number(amount);
    if (!(value > 0)) {
      setError("Enter a valid deposit amount.");
      return;
    }

    if (!packageName) {
      setError("Select the investment package you are depositing for.");
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from("transactions").insert({
      type: "deposit",
      amount: value,
      investment_type: investmentType,
      package: packageName,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAmount("");
    setPackageName("");
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

        <Select
          label="Investment type"
          options={INVESTMENT_TYPE_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
          value={investmentType}
          onChange={handleTypeChange}
        />

        <Select
          label="Package"
          placeholder="Select a package"
          options={INVESTMENT_PACKAGES[investmentType].map((name) => ({
            value: name,
            label: name,
          }))}
          value={packageName}
          onChange={setPackageName}
        />

        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        <Button type="submit" size="lg" fullWidth loading={saving}>
          Send deposit request
        </Button>
      </form>

      <OtherPaymentMethods className="mt-4" onChatAdmin={onClose} />

  
    </Modal>
  );
}
