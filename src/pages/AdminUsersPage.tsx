import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  Users,
} from "lucide-react";
import {
  createColumnHelper,
  createPaginatedRowModel,
  rowPaginationFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { supabase } from "@/lib/supabase";
import { currency, formatDate, fullName } from "@/lib/format";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import type { Profile } from "@/lib/types";
import { PageHeader } from "@/components/composite/PageHeader";
import { EditUserModal } from "@/components/composite/EditUserModal";
import { EmptyState } from "@/components/composite/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Table, Td, Th } from "@/components/ui/Table";
import { Input } from "@/components/ui/Input";

const features = tableFeatures({
  rowPaginationFeature,
  paginatedRowModel: createPaginatedRowModel(),
});

const columnHelper = createColumnHelper<typeof features, Profile>();

const columns = columnHelper.columns([
  columnHelper.accessor((row) => fullName(row), {
    id: "name",
    header: "Name",
    cell: (info) => (
      <span className="whitespace-nowrap font-medium text-text-secondary">
        {info.getValue()}
      </span>
    ),
  }),
  columnHelper.accessor("email", {
    header: "Email",
    cell: (info) => (
      <span className="whitespace-nowrap">{info.getValue() || "—"}</span>
    ),
  }),
  columnHelper.accessor("role", {
    header: "Role",
    cell: (info) => (
      <Badge variant={info.getValue() === "admin" ? "brand" : "neutral"}>
        {info.getValue() || "user"}
      </Badge>
    ),
  }),
  columnHelper.accessor("total_balance", {
    header: "Balance",
    cell: (info) => (
      <span translate="no" className="tabular-nums whitespace-nowrap">
        {currency(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("active_deposit", {
    header: "Deposit",
    cell: (info) => (
      <span translate="no" className="tabular-nums whitespace-nowrap">
        {currency(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("profit", {
    header: "Profit",
    cell: (info) => (
      <span translate="no" className="tabular-nums whitespace-nowrap">
        {currency(info.getValue())}
      </span>
    ),
  }),
  columnHelper.accessor("created_at", {
    header: "Joined",
    cell: (info) => (
      <span className="whitespace-nowrap">{formatDate(info.getValue())}</span>
    ),
  }),
]);

export default function AdminUsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebouncedValue(query, 400);
  const searching = query !== debouncedQuery;
  const [selected, setSelected] = useState<Profile | null>(null);

  const loadProfiles = useCallback(async () => {
    setLoading(true);
    const { data, error: loadError } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (loadError) {
      setError(loadError.message);
    } else {
      setProfiles((data ?? []) as Profile[]);
      setError("");
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadProfiles();
  }, [loadProfiles]);

  const filtered = useMemo(() => {
    const search = debouncedQuery.trim().toLowerCase();
    if (!search) return profiles;

    return profiles.filter((profile) =>
      `${fullName(profile)} ${profile.email ?? ""}`
        .toLowerCase()
        .includes(search),
    );
  }, [profiles, debouncedQuery]);

  const table = useTable({
    features,
    columns,
    data: filtered,
    autoResetPageIndex: false,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
  });

  const { pageIndex, pageSize } = table.state.pagination;
  const total = table.getRowCount();
  const pageCount = Math.max(1, table.getPageCount());
  const firstRow = total === 0 ? 0 : pageIndex * pageSize + 1;
  const lastRow = Math.min(total, (pageIndex + 1) * pageSize);
  const rows = table.getRowModel().rows;

  function handleSaved(updated: Profile) {
    setProfiles((current) =>
      current.map((profile) => (profile.id === updated.id ? updated : profile)),
    );
    setSelected(null);
    setNotice(`${fullName(updated)} updated.`);
  }

  return (
    <>
      <PageHeader
        title="Users"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => void loadProfiles()}
            loading={loading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        }
      />

      {notice && (
        <Alert variant="success" className="mb-3">
          {notice}
        </Alert>
      )}

      {error && (
        <Alert variant="error" className="mb-3">
          {error}
        </Alert>
      )}

      <Card className="p-4 sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.6875rem] text-text-tertiary">
            {searching
              ? "Searching…"
              : `${total} user${total === 1 ? "" : "s"} in total`}
          </p>
          <div className="w-full sm:w-64">
            <Input
              icon={Search}
              placeholder="Search by name or email"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                table.setPageIndex(0);
              }}
            />
          </div>
        </div>

        {loading && !profiles.length ? (
          <p className="py-10 text-center text-xs text-text-muted">
            Loading users…
          </p>
        ) : rows.length ? (
          <Table minWidth={820}>
            <thead>
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <Th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <table.FlexRender header={header} />
                      )}
                    </Th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => setSelected(row.original)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setSelected(row.original);
                    }
                  }}
                  tabIndex={0}
                  title="Edit user"
                  className="cursor-pointer transition-colors hover:bg-notice focus-visible:bg-notice focus-visible:outline-none last:[&>td]:border-b-0"
                >
                  {row.getAllCells().map((cell) => (
                    <Td key={cell.id}>
                      <table.FlexRender cell={cell} />
                    </Td>
                  ))}
                </tr>
              ))}
            </tbody>
          </Table>
        ) : (
          <EmptyState
            icon={debouncedQuery ? Search : Users}
            title={debouncedQuery ? "No matching users" : "No users yet"}
            description={
              debouncedQuery ? "Try a different name or email." : undefined
            }
          />
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <p className="text-[0.6875rem] text-text-tertiary">
            Showing {firstRow}–{lastRow} of {total}
          </p>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[0.6875rem] text-text-tertiary">
              Rows
              <div className="w-[74px]">
                <Select
                  size="sm"
                  ariaLabel="Rows per page"
                  value={String(pageSize)}
                  onChange={(next) => {
                    table.setPageSize(Number(next));
                    table.setPageIndex(0);
                  }}
                  options={[5, 10, 20, 50].map((size) => ({
                    value: String(size),
                    label: String(size),
                  }))}
                />
              </div>
            </div>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="Previous page"
              className="w-8 px-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-[0.6875rem] font-medium text-text-tertiary">
              {pageIndex + 1} / {pageCount}
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="Next page"
              className="w-8 px-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <EditUserModal
        user={selected}
        onClose={() => setSelected(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
