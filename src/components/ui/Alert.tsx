import type { ReactNode } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/cn";

type AlertVariant = "success" | "error" | "warning" | "info";

const styles: Record<
  AlertVariant,
  { box: string; icon: LucideIcon }
> = {
  success: { box: "bg-emerald-50 text-emerald-700", icon: CheckCircle2 },
  error: { box: "bg-red-50 text-red-600", icon: AlertCircle },
  warning: { box: "bg-amber-50 text-amber-700", icon: TriangleAlert },
  info: { box: "bg-primary-muted text-primary-ink", icon: Info },
};

interface AlertProps {
  variant?: AlertVariant;
  className?: string;
  children: ReactNode;
}

export function Alert({ variant = "info", className, children }: AlertProps) {
  const { box, icon: Icon } = styles[variant];

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-2 rounded-lg p-3 text-xs leading-relaxed",
        box,
        className,
      )}
    >
      <Icon className="mt-px h-4 w-4 shrink-0" />
      <span>{children}</span>
    </div>
  );
}
