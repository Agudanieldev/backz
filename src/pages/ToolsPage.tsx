import { useSearchParams } from "react-router-dom";
import { ArrowLeftRight, Bitcoin, CandlestickChart } from "lucide-react";
import { cn } from "@/lib/cn";
import { PageHeader } from "@/components/composite/PageHeader";
import CryptoTools from "./tools/CryptoTools";
import ForexTools from "./tools/ForexTools";
import StockTools from "./tools/StockTools";

const TABS = [
  { id: "forex", label: "Forex", icon: ArrowLeftRight },
  { id: "crypto", label: "Crypto", icon: Bitcoin },
  { id: "stocks", label: "Stocks", icon: CandlestickChart },
] as const;

type TabId = (typeof TABS)[number]["id"];

const TAB_IDS = TABS.map((tab) => tab.id);

function isTabId(value: string | null): value is TabId {
  return value !== null && (TAB_IDS as string[]).includes(value);
}

export default function ToolsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const requested = searchParams.get("tab");
  const active: TabId = isTabId(requested) ? requested : "forex";
  const activeTab = TABS.find((tab) => tab.id === active) ?? TABS[0];

  function selectTab(id: TabId) {
    setSearchParams({ tab: id }, { replace: true });
  }

  return (
    <>
      <PageHeader title="Tools" />

      <div
        role="tablist"
        aria-label="Trading tools"
        className="mb-4 grid grid-cols-3 gap-1 rounded-xl border border-border-soft bg-surface p-1"
      >
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = active === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => selectTab(tab.id)}
              className={cn(
                "flex cursor-pointer items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                selected
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

      <div role="tabpanel" aria-label={activeTab.label}>
        {active === "forex" && <ForexTools />}
        {active === "crypto" && <CryptoTools />}
        {active === "stocks" && <StockTools />}
      </div>
    </>
  );
}
