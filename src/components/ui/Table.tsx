import type { ReactNode, ThHTMLAttributes, TdHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

interface TableProps {
  children: ReactNode;
  minWidth?: number;
  className?: string;
}

export function Table({ children, minWidth = 620, className }: TableProps) {
  return (
    <div className={cn("overflow-x-auto rounded-xl border border-border-soft", className)}>
      <table className="w-full text-left" style={{ minWidth }}>
        {children}
      </table>
    </div>
  );
}

export function Th({ className, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      className={cn(
        "whitespace-nowrap border-b border-border-soft bg-notice px-3 py-2.5 text-[0.625rem] font-semibold uppercase tracking-wider text-text-muted",
        className,
      )}
      {...props}
    />
  );
}

export function Td({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td
      className={cn(
        "border-b border-border-faint px-3 py-3 align-middle text-xs text-text-tertiary",
        className,
      )}
      {...props}
    />
  );
}
