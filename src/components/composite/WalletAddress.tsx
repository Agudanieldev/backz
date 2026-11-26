import { useEffect, useRef, useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { WALLET_ADDRESS } from "@/lib/types";
import { Button } from "@/components/ui/Button";

interface WalletAddressProps {
  address?: string;
  className?: string;
}

export function WalletAddress({
  address = WALLET_ADDRESS,
  className,
}: WalletAddressProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 1700);
    } catch (error) {
      console.error("Unable to copy:", error);
    }
  }

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-dashed border-border bg-field px-3 py-2",
        className,
      )}
    >
      <code
        translate="no"
        className="min-w-0 flex-1 break-all font-mono text-[0.6875rem] leading-relaxed text-text-soft"
      >
        {address}
      </code>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleCopy}
        leftIcon={
          copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-600" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )
        }
        className="shrink-0"
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}
