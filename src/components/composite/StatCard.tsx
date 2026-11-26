import { cn } from "@/lib/cn";
import { Card } from "@/components/ui/Card";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

export function StatCard({ label, value, hint, className }: StatCardProps) {
  return (
    <Card className={cn("p-4", className)}>
      <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted">
        {label}
      </p>
      <p
        translate="no"
        className="tabular-nums mt-2 break-words text-lg font-bold tracking-tight text-text-primary"
      >
        {value}
      </p>
      {hint && <p className="mt-1 text-[0.625rem] text-text-tertiary">{hint}</p>}
    </Card>
  );
}
