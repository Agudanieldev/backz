import { Download, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePwa } from "@/lib/pwa";
import { Button } from "@/components/ui/Button";

interface InstallAppBannerProps {
  variant?: "inline" | "sidebar";
  className?: string;
}

/**
 * Dismissible install prompt. The mobile version sits above the page content;
 * the desktop version is a compact card in the sidebar footer.
 */
export function InstallAppBanner({
  variant = "inline",
  className,
}: InstallAppBannerProps) {
  const { installed, canInstall, isIos, dismissed, promptInstall, dismiss } =
    usePwa();

  if (installed || dismissed) return null;
  if (!canInstall && !isIos) return null;

  const icon = (
    <img
      src="/icons/icon-192.png"
      alt=""
      width={36}
      height={36}
      className="h-9 w-9 shrink-0 rounded-lg drop-shadow-sm"
    />
  );

  const dismissButton = (
    <button
      type="button"
      onClick={dismiss}
      aria-label="Dismiss install prompt"
      className="-mr-1 -mt-1 flex h-6 w-6 shrink-0 cursor-pointer items-center justify-center rounded-lg text-primary-ink/70 transition-colors hover:bg-surface/60 hover:text-primary-ink"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );

  if (variant === "sidebar") {
    return (
      <div
        className={cn(
          "rounded-xl border border-primary/20 bg-primary-muted p-3",
          className,
        )}
      >
        <div className="flex items-start gap-2">
          {icon}
          <div className="min-w-0 flex-1">
            <p className="text-[0.6875rem] font-bold text-primary-ink">
              Install TradeZanga
            </p>
            <p className="mt-0.5 text-[0.625rem] leading-relaxed text-text-secondary">
              {isIos
                ? "Share → Add to Home Screen."
                : "Open the portal like an app."}
            </p>
          </div>
          {dismissButton}
        </div>

        {canInstall && (
          <Button
            size="sm"
            fullWidth
            className="mt-2"
            onClick={() => void promptInstall()}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Install
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "mb-4 flex items-start gap-3 rounded-xl border border-primary/20 bg-primary-muted px-4 py-3",
        className,
      )}
    >
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-xs font-bold text-primary-ink">Install TradeZanga</p>
        <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-text-secondary">
          {isIos
            ? "Tap the Share button, then choose Add to Home Screen."
            : "Add the client portal to your home screen and open it like an app."}
        </p>
        {canInstall && (
          <Button
            size="sm"
            className="mt-2"
            onClick={() => void promptInstall()}
            leftIcon={<Download className="h-3.5 w-3.5" />}
          >
            Install app
          </Button>
        )}
      </div>
      {dismissButton}
    </div>
  );
}
