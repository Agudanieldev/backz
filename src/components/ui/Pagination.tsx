import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./Button";
import { Select } from "./Select";

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  label?: string;
  pageSizeOptions?: number[];
}

export function Pagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  label = "items",
  pageSizeOptions = [10, 20, 50],
}: PaginationProps) {
  if (total === 0) return null;

  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const current = Math.min(Math.max(1, page), pageCount);
  const first = (current - 1) * pageSize + 1;
  const last = Math.min(total, current * pageSize);

  return (
    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
      <p className="text-[0.6875rem] text-text-tertiary">
        Showing {first}–{last} of {total} {label}
      </p>

      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 text-[0.6875rem] text-text-tertiary">
          Rows
          <div className="w-[74px]">
            <Select
              size="sm"
              ariaLabel="Rows per page"
              value={String(pageSize)}
              onChange={(next) => onPageSizeChange(Number(next))}
              options={pageSizeOptions.map((size) => ({
                value: String(size),
                label: String(size),
              }))}
            />
          </div>
        </div>

        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(current - 1)}
          disabled={current <= 1}
          aria-label={`Previous ${label} page`}
          className="w-8 px-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-[0.6875rem] font-medium text-text-tertiary">
          {current} / {pageCount}
        </span>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => onPageChange(current + 1)}
          disabled={current >= pageCount}
          aria-label={`Next ${label} page`}
          className="w-8 px-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
