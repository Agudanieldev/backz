import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-6",
        className,
      )}
    >
      <div className="min-w-0">
        <h1 className="text-xl font-bold tracking-tight text-text-primary sm:text-2xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 text-xs leading-relaxed text-text-tertiary sm:text-sm">
            {description}
          </p>
        )}
      </div>
      {action}
    </header>
  );
}
