import { TradingViewWidget } from "@/components/composite/TradingViewWidget";
import { Card } from "@/components/ui/Card";
import { forexChart, forexCrossRates, forexMarketQuotes } from "@/lib/widgets";

export default function ForexTools() {
  return (
    <div className="space-y-4">
      <Card className="p-3 sm:p-4">
        <TradingViewWidget
          widget="advanced-chart"
          config={forexChart}
          className="h-[420px] sm:h-[540px]"
        />
      </Card>

      <Card className="p-3 sm:p-4">
        <h2 className="mb-2 text-xs font-bold tracking-tight text-text-primary">
          Cross rates
        </h2>
        <TradingViewWidget
          widget="forex-cross-rates"
          config={forexCrossRates}
          className="h-[400px]"
        />
      </Card>

      <Card className="p-3 sm:p-4">
        <h2 className="mb-2 text-xs font-bold tracking-tight text-text-primary">
          Market quotes
        </h2>
        <TradingViewWidget
          widget="market-quotes"
          config={forexMarketQuotes}
          className="h-[440px]"
        />
      </Card>
    </div>
  );
}
