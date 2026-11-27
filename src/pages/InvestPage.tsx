import { useState, type FormEvent } from "react";
import { Building2, ChartCandlestick, Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { supabase } from "@/lib/supabase";
import { WalletAddress } from "@/components/composite/WalletAddress";
import { OtherPaymentMethods } from "@/components/composite/OtherPaymentMethods";
import { PageHeader } from "@/components/composite/PageHeader";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type PackageType = "real" | "digital";

interface Plan {
  name: string;
  location: string;
  price: string;
  badge?: string;
  featured?: boolean;
  features: string[];
  cta: string;
}

const REAL_ESTATE_PLANS: Plan[] = [
  {
    name: "Silver",
    location: "Cleveland, OH",
    price: "$500 – $5,000",
    features: [
      "Target Returns: 15% – 30%",
      "Entry-Level Investment Property",
      "Located in an Emerging Rental Market",
      "Low Maintenance, Single-Family Unit",
    ],
    cta: "Invest",
  },
  {
    name: "Gold",
    location: "Austin, TX",
    price: "$5,000 – $15,000",
    badge: "Hot",
    featured: true,
    features: [
      "Target Returns: 30% – 55%",
      "Mid-Tier Multifamily Investment",
      "High Demand Rental Zone",
      "Appreciation-Driven Growth Area",
    ],
    cta: "Invest",
  },
  {
    name: "Diamond",
    location: "Manhattan, NY",
    price: "$15,000 – $50,000",
    features: [
      "Target Returns: 55% – 85%",
      "Premium Commercial Property Holdings",
      "Class-A Assets in Core Manhattan Districts",
      "Institutional Grade Investment Opportunity",
    ],
    cta: "Invest",
  },
  {
    name: "Platinum",
    location: "Seattle, WA",
    price: "$50,000 – $350,000",
    features: [
      "Target Returns: 85% – 130%+",
      "High-Yield Urban Property Portfolio",
      "Prime Location with Tech Industry Spillover",
      "Eligible for Short-Term Rental Income",
    ],
    cta: "Invest",
  },
];

const DIGITAL_PLANS: Plan[] = [
  {
    name: "Silver",
    location: "Digital package",
    price: "$500 – $5,000",
    features: [
      "Basic Market Analysis Tools",
      "100% Guaranteed Profit (Min 42hrs)",
      "Access to Educational Materials",
      "Essential Trading Platform Features",
    ],
    cta: "Deposit",
  },
  {
    name: "Gold",
    location: "Digital package",
    price: "$6,000 – $15,000",
    badge: "Hot",
    featured: true,
    features: [
      "Advance Market Analysis Tools",
      "300% Guaranteed Profit (Min 72hrs)",
      "Exclusive Trading Education",
      "Advance Trading Platform Features",
    ],
    cta: "Deposit",
  },
  {
    name: "Platinum",
    location: "Digital package",
    price: "$16,000 – $50,000",
    features: [
      "Advance Market Analysis Tools",
      "500% Guaranteed Profit (Min 120hrs)",
      "Exclusive Trading Seminars",
      "Fully Customizable Trading Platform",
    ],
    cta: "Deposit",
  },
  {
    name: "Huge Volume",
    location: "Custom allocation",
    price: "Custom",
    features: [
      "Advance Market Analysis Tools",
      "500% Guaranteed Profit (Min 120hrs)",
      "Exclusive Trading Seminars",
      "Fully Customizable Trading Platform",
    ],
    cta: "Deposit",
  },
];

const PACKAGE_TABS = [
  { id: "real", label: "Real Estate", icon: Building2 },
  { id: "digital", label: "Digital Trading", icon: ChartCandlestick },
] as const;

const TYPE_COPY: Record<
  PackageType,
  { title: string; subtitle: string; description: string }
> = {
  real: {
    title: "Real Estate Packages",
    subtitle: "Property-backed",
    description: "Property-backed allocations across US markets.",
  },
  digital: {
    title: "Digital Trading Packages",
    subtitle: "Trading capital",
    description: "Trading allocations with tooling and education included.",
  },
};

function PlanCard({
  plan,
  type,
  onSelect,
}: {
  plan: Plan;
  type: PackageType;
  onSelect: (plan: Plan) => void;
}) {
  const isDigital = type === "digital";

  return (
    <Card
      className={cn(
        "relative flex flex-col overflow-hidden p-0 transition-shadow hover:shadow-md",
        plan.featured && "border-primary/40 ring-1 ring-primary/20",
      )}
    >
      <div className="bg-gradient-to-br from-action via-action to-primary p-4 text-action-foreground">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/15 text-white">
            {isDigital ? (
              <ChartCandlestick className="h-4 w-4" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </span>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold tracking-tight">
              {plan.name}
            </h3>
            <p className="truncate text-[0.625rem] uppercase tracking-wider text-action-foreground/85">
              {plan.location}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between gap-2">
          <p
            translate="no"
            className="tabular-nums text-lg font-extrabold tracking-tight"
          >
            {plan.price}
          </p>
          {plan.badge && (
            <span className="rounded-full bg-white px-2 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-action">
              {plan.badge}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <ul className="flex-1 space-y-2">
          {plan.features.map((feature) => (
            <li
              key={feature}
              className="flex gap-2 text-[0.6875rem] leading-relaxed text-text-tertiary"
            >
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button
          className="mt-4"
          fullWidth
          variant={plan.featured ? "primary" : "secondary"}
          onClick={() => onSelect(plan)}
        >
          {plan.cta}
        </Button>
      </div>
    </Card>
  );
}

export default function InvestPage() {
  const [type, setType] = useState<PackageType>("real");
  const [selected, setSelected] = useState<Plan | null>(null);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [saving, setSaving] = useState(false);

  const plans = type === "real" ? REAL_ESTATE_PLANS : DIGITAL_PLANS;
  const copy = TYPE_COPY[type];
  const isDigital = type === "digital";
  const HeaderIcon = isDigital ? ChartCandlestick : Building2;

  function closeModal() {
    setSelected(null);
    setAmount("");
    setError("");
    setSuccess("");
  }

  function selectPlan(plan: Plan) {
    setAmount("");
    setError("");
    setSuccess("");
    setSelected(plan);
  }

  async function handleInvest(event: FormEvent) {
    event.preventDefault();
    if (!selected) return;

    setError("");
    setSuccess("");

    const value = Number(amount);
    if (!(value > 0)) {
      setError("Enter a valid amount.");
      return;
    }

    setSaving(true);
    const { error: insertError } = await supabase.from("transactions").insert({
      type: "deposit",
      amount: value,
      investment_type: type,
      package: selected.name,
    });
    setSaving(false);

    if (insertError) {
      setError(insertError.message);
      return;
    }

    setAmount("");
    setSuccess(
      "Investment request sent to the admin. Your package will be activated after review.",
    );
  }

  return (
    <>
      <PageHeader title="Investment Packages" />

      <div
        role="tablist"
        aria-label="Package types"
        className="mb-4 grid grid-cols-2 gap-1 rounded-xl border border-border-soft bg-surface p-1"
      >
        {PACKAGE_TABS.map((tab) => {
          const Icon = tab.icon;
          const active = type === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setType(tab.id)}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                active
                  ? "bg-action text-action-foreground shadow-xs"
                  : "text-text-tertiary hover:bg-surface-subtle hover:text-text-primary",
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-action via-action to-primary p-5 text-action-foreground shadow-sm sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-white">
              <HeaderIcon className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold tracking-tight">
                {copy.title}
              </h2>
              <p className="mt-0.5 text-[0.6875rem] text-action-foreground/85">
                {copy.description}
              </p>
            </div>
          </div>

          <Badge variant="neutral" className="bg-white text-action">
            {copy.subtitle}
          </Badge>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            type={type}
            onSelect={selectPlan}
          />
        ))}
      </div>

      <Modal
        open={Boolean(selected)}
        onClose={closeModal}
        title={selected ? `${selected.name} — ${selected.location}` : ""}
        description={
          selected
            ? `${selected.price}. Send your deposit to the Bitcoin address below, then enter the amount you sent.`
            : undefined
        }
        footer={
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="secondary" onClick={closeModal} fullWidth>
              Close
            </Button>
            <Button
              type="submit"
              form="invest-request-form"
              loading={saving}
              fullWidth
            >
              Invest
            </Button>
          </div>
        }
      >
        <WalletAddress />
        <form
          id="invest-request-form"
          onSubmit={handleInvest}
          className="mt-4 space-y-3"
        >
          <Input
            label="Amount sent (USD)"
            type="number"
            min={1}
            step="0.01"
            placeholder="500"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            hint="Enter the amount you sent to the wallet address above."
            required
          />

          {error && <Alert variant="error">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}
        </form>

        <OtherPaymentMethods
          className="mt-4"
          onChatAdmin={closeModal}
        />
        <p className="mt-3 text-[0.625rem] leading-relaxed text-text-muted">
          Deposits are reviewed by an admin before your package is activated.
        </p>
      </Modal>
    </>
  );
}
