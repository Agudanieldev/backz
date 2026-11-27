import { Headset } from "lucide-react";
import { cn } from "@/lib/cn";
import { openSupportChat } from "@/lib/tawk";
import { Button } from "@/components/ui/Button";

const OTHER_PAYMENT_METHODS = [
  "PayPal",
  "Gift Card",
  "Cash App",
  "Google Pay",
  "Crypto.com",
  "Chime",
  "Venmo",
  "MoneyGram",
  "Western Union",
];

interface OtherPaymentMethodsProps {
  className?: string;
  onChatAdmin?: () => void;
}

export function OtherPaymentMethods({
  className,
  onChatAdmin,
}: OtherPaymentMethodsProps) {
  const supportChatEnabled =
    import.meta.env.VITE_TAWK_EMBED_URL?.trim() !== "off";

  return (
    <div
      className={cn(
        "rounded-lg border border-border-soft bg-notice p-3",
        className,
      )}
    >
      <p className="text-[0.6875rem] font-semibold text-text-primary">
        We also accept other payment options
      </p>

      <ul className="mt-2 flex flex-wrap gap-1.5">
        {OTHER_PAYMENT_METHODS.map((method) => (
          <li
            key={method}
            className="rounded-full border border-border-soft bg-surface px-2 py-0.5 text-[0.625rem] font-medium text-text-secondary"
          >
            {method}
          </li>
        ))}
      </ul>

      <p className="mt-2.5 text-[0.625rem] leading-relaxed text-text-muted">
        To deposit using any of these methods, visit the customer care admin
        chatbot and our team will guide you through the process.
      </p>

      {supportChatEnabled && (
        <Button
          size="sm"
          variant="soft"
          className="mt-2"
          leftIcon={<Headset className="h-3.5 w-3.5" />}
          onClick={() => {
            onChatAdmin?.();
            openSupportChat();
          }}
        >
          Chat Admin
        </Button>
      )}
    </div>
  );
}
