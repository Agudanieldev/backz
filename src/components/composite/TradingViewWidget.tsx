import { useEffect, useRef } from "react";
import { cn } from "@/lib/cn";
import { useTheme, type Theme } from "@/lib/theme";

interface TradingViewWidgetProps {
  /** Embed name, e.g. "crypto-coins-heatmap". */
  widget: string;
  config: Record<string, unknown>;
  className?: string;
}

/**
 * Mounts a TradingView embed widget. The embed script reads its options
 * from the script's own text content, so the script is created after mount.
 * Re-keyed by theme so the chart reloads with the matching palette.
 */
export function TradingViewWidget({
  widget,
  config,
  className,
}: TradingViewWidgetProps) {
  const { theme } = useTheme();

  return (
    <div className="overflow-hidden rounded-xl">
      <TradingViewMount
        key={theme}
        widget={widget}
        config={config}
        theme={theme}
        className={className}
      />
      <p className="mt-1.5 px-1 text-right text-[0.625rem] text-text-muted">
        <a
          href="https://www.tradingview.com/"
          rel="noopener nofollow"
          target="_blank"
          className="hover:text-primary hover:underline"
        >
          Track all markets on TradingView
        </a>
      </p>
    </div>
  );
}

function TradingViewMount({
  widget,
  config,
  theme,
  className,
}: {
  widget: string;
  config: Record<string, unknown>;
  theme: Theme;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const serialized = JSON.stringify(config);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // React StrictMode mounts effects twice in development. Only build the
    // widget once per container so a half-loaded embed is never discarded.
    if (container.dataset.mounted === "true") return;
    container.dataset.mounted = "true";

    const mount = document.createElement("div");
    mount.className = "tradingview-widget-container__widget h-full w-full";
    container.appendChild(mount);

    // TradingView falls back to 150px when height is a percentage, so hand it
    // the pixel height the card actually occupies.
    const height = Math.round(container.getBoundingClientRect().height) || 480;

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.async = true;
    script.src = `https://s3.tradingview.com/external-embedding/embed-widget-${widget}.js`;
    script.innerHTML = JSON.stringify({
      ...(JSON.parse(serialized) as Record<string, unknown>),
      colorTheme: theme,
      theme,
      width: "100%",
      height,
    });
    container.appendChild(script);
  }, [widget, serialized, theme]);

  return (
    <div
      ref={containerRef}
      className={cn("tradingview-widget-container", className)}
    />
  );
}
