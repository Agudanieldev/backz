import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant =
  | "pending"
  | "approved"
  | "rejected"
  | "brand"
  | "neutral";

const variants: Record<BadgeVariant, string> = {
  pending: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-red-50 text-red-600",
  brand: "bg-primary-muted text-primary-ink",
  neutral: "bg-surface-subtle text-text-secondary",
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: ReactNode;
}

export function Badge({ variant = "neutral", className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[0.625rem] font-semibold capitalize tracking-wide",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

const statusVariant: Record<string, BadgeVariant> = {
  pending: "pending",
  approved: "approved",
  rejected: "rejected",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <Badge variant={statusVariant[status] ?? "neutral"}>{status}</Badge>
  );
}
