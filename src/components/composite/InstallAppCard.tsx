import { Check, Download } from "lucide-react";
import { cn } from "@/lib/cn";
import { usePwa } from "@/lib/pwa";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface InstallAppCardProps {
  className?: string;
}

/** Persistent install entry point on the profile page. */
export function InstallAppCard({ className }: InstallAppCardProps) {
  const { installed, canInstall, isIos, promptInstall } = usePwa();

  return (
    <Card className={cn("p-5", className)}>
      <div className="flex items-start gap-3">
        <img
          src="/icons/icon-192.png"
          alt=""
          width={40}
          height={40}
          className="h-10 w-10 shrink-0 rounded-xl drop-shadow-sm"
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-sm font-bold tracking-tight text-text-primary">
            Install app
          </h2>
          <p className="mt-1 text-[0.6875rem] leading-relaxed text-text-tertiary">
            {installed
              ? "TradeZanga is installed on this device."
              : isIos
                ? "Tap the Share button, then choose Add to Home Screen."
                : canInstall
                  ? "Add the portal to your home screen and open it like a native app."
                  : "Use your browser menu and choose Install app or Add to Home Screen."}
          </p>

          {installed ? (
            <p className="mt-2 inline-flex items-center gap-1 text-[0.625rem] font-semibold text-primary-ink">
              <Check className="h-3.5 w-3.5" />
              Installed
            </p>
          ) : canInstall ? (
            <Button
              size="sm"
              className="mt-3"
              onClick={() => void promptInstall()}
              leftIcon={<Download className="h-3.5 w-3.5" />}
            >
              Install app
            </Button>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
