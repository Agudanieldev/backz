import { TradingViewWidget } from "@/components/composite/TradingViewWidget";
import { Card } from "@/components/ui/Card";
import {
  cryptoHeatmap,
  cryptoScreener,
  cryptoSymbolOverview,
} from "@/lib/widgets";

export default function CryptoTools() {
  return (
    <div className="space-y-4">
      <Card className="p-3 sm:p-4">
        <TradingViewWidget
          widget="crypto-coins-heatmap"
          config={cryptoHeatmap}
          className="h-[400px] sm:h-[520px]"
        />
      </Card>

      <Card className="p-3 sm:p-4">
        <h2 className="mb-2 text-xs font-bold tracking-tight text-text-primary">
          Major coins
        </h2>
        <TradingViewWidget
          widget="symbol-overview"
          config={cryptoSymbolOverview}
          className="h-[420px] sm:h-[500px]"
        />
      </Card>

      <Card className="p-3 sm:p-4">
        <h2 className="mb-2 text-xs font-bold tracking-tight text-text-primary">
          Market screener
        </h2>
        <TradingViewWidget
          widget="screener"
          config={cryptoScreener}
          className="h-[440px] sm:h-[520px]"
        />
      </Card>
    </div>
  );
}
