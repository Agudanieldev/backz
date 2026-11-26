import { TradingViewWidget } from "@/components/composite/TradingViewWidget";
import { Card } from "@/components/ui/Card";
import {
  stockForexHeatmap,
  stockHeatmap,
  stockHotlists,
} from "@/lib/widgets";

export default function StockTools() {
  return (
    <div className="space-y-4">
      <Card className="p-3 sm:p-4">
        <TradingViewWidget
          widget="stock-heatmap"
          config={stockHeatmap}
          className="h-[400px] sm:h-[520px]"
        />
      </Card>

      <Card className="p-3 sm:p-4">
        <h2 className="mb-2 text-xs font-bold tracking-tight text-text-primary">
          Currency heatmap
        </h2>
        <TradingViewWidget
          widget="forex-heat-map"
          config={stockForexHeatmap}
          className="h-[400px]"
        />
      </Card>

      <Card className="p-3 sm:p-4">
        <h2 className="mb-2 text-xs font-bold tracking-tight text-text-primary">
          Hot US stocks
        </h2>
        <TradingViewWidget
          widget="hotlists"
          config={stockHotlists}
          className="h-[440px]"
        />
      </Card>
    </div>
  );
}
