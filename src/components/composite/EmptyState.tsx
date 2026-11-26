import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description?: string;
}

export function EmptyState({ icon: Icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border px-4 py-10 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-subtle text-text-muted">
        <Icon className="h-4 w-4" />
      </span>
      <p className="mt-2 text-xs font-semibold text-text-secondary">{title}</p>
      {description && (
        <p className="mt-0.5 text-[0.6875rem] text-text-muted">{description}</p>
      )}
    </div>
  );
}
