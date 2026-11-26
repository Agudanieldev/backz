import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { fullName } from "@/lib/format";
import type { Profile } from "@/lib/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Select } from "@/components/ui/Select";

const PLAN_OPTIONS = [
  "None",
  "Silver",
  "Gold",
  "Platinum",
  "Diamond",
  "Huge Volume",
];

interface EditUserModalProps {
  user: Profile | null;
  onClose: () => void;
  onSaved: (user: Profile) => void;
}

interface FormState {
  activeDeposit: string;
  profit: string;
  totalBalance: string;
  plan: string;
  properties: string;
}

export function EditUserModal({ user, onClose, onSaved }: EditUserModalProps) {
  const [form, setForm] = useState<FormState>({
    activeDeposit: "0",
    profit: "0",
    totalBalance: "0",
    plan: "None",
    properties: "0",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setError("");
    setForm({
      activeDeposit: String(user.active_deposit ?? 0),
      profit: String(user.profit ?? 0),
      totalBalance: String(user.total_balance ?? 0),
      plan: user.realplan || "None",
      properties: String(user.total_properties_owned ?? 0),
    });
  }, [user]);

  function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setError("");

    const activeDeposit = Number(form.activeDeposit);
    const profit = Number(form.profit);
    const totalBalance = Number(form.totalBalance);
    const properties = Number(form.properties);

    if (
      ![activeDeposit, profit, totalBalance, properties].every(
        (value) => Number.isFinite(value) && value >= 0,
      )
    ) {
      setError("Amounts must be zero or greater.");
      return;
    }

    if (!Number.isInteger(properties)) {
      setError("Properties owned must be a whole number.");
      return;
    }

    setSaving(true);
    const { data, error: updateError } = await supabase
      .from("profiles")
      .update({
        active_deposit: activeDeposit,
        profit,
        total_balance: totalBalance,
        realplan: form.plan,
        total_properties_owned: properties,
      })
      .eq("id", user.id)
      .select("*")
      .single();
    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    onSaved(data as Profile);
  }

  const name = user ? fullName(user) : "Client";
  const planOptions = PLAN_OPTIONS.includes(form.plan)
    ? PLAN_OPTIONS
    : [form.plan, ...PLAN_OPTIONS];

  return (
    <Modal
      open={Boolean(user)}
      onClose={onClose}
      title={name}
      description={user?.email || "Client account"}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Active deposit"
            type="number"
            min={0}
            step="0.01"
            value={form.activeDeposit}
            onChange={(event) => setField("activeDeposit", event.target.value)}
            required
          />
          <Input
            label="Profit"
            type="number"
            min={0}
            step="0.01"
            value={form.profit}
            onChange={(event) => setField("profit", event.target.value)}
            required
          />
          <Input
            label="Total balance"
            type="number"
            min={0}
            step="0.01"
            value={form.totalBalance}
            onChange={(event) => setField("totalBalance", event.target.value)}
            required
          />
          <Input
            label="Properties owned"
            type="number"
            min={0}
            step={1}
            value={form.properties}
            onChange={(event) => setField("properties", event.target.value)}
            required
          />
        </div>

        <Select
          label="Investment plan"
          value={form.plan}
          onChange={(value) => setField("plan", value)}
          options={planOptions.map((plan) => ({ value: plan, label: plan }))}
        />

        {error && <Alert variant="error">{error}</Alert>}

        <div className="grid grid-cols-2 gap-2 pt-1">
          <Button variant="secondary" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button type="submit" fullWidth loading={saving}>
            Save changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
