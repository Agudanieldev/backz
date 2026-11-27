import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Inbox,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { currency, formatDate, money } from "@/lib/format";
import { investmentTypeLabel, requestTypeLabel } from "@/lib/investmentPlans";
import type { Transaction } from "@/lib/types";
import { PageHeader } from "@/components/composite/PageHeader";
import { StatCard } from "@/components/composite/StatCard";
import { EmptyState } from "@/components/composite/EmptyState";
import { DepositModal } from "@/components/composite/DepositModal";
import { WithdrawModal } from "@/components/composite/WithdrawModal";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Table, Td, Th } from "@/components/ui/Table";
import { StatusBadge } from "@/components/ui/Badge";

type ModalKind = "deposit" | "withdraw" | null;

const DEFAULT_PAGE_SIZE = 5;

export default function DashboardPage() {
  const { profile, refreshProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const welcomeRequested = Boolean(
    (location.state as { welcome?: boolean } | null)?.welcome,
  );
  const [showWelcome, setShowWelcome] = useState(welcomeRequested);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [transactionsTotal, setTransactionsTotal] = useState(0);
  const [transactionsPage, setTransactionsPage] = useState(1);
  const [transactionsPageSize, setTransactionsPageSize] = useState(
    DEFAULT_PAGE_SIZE,
  );
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [modal, setModal] = useState<ModalKind>(null);
  const transactionsRequest = useRef(0);

  // Read the one-shot welcome state once, then clear it so refreshes and
  // back-navigation do not replay the greeting.
  useEffect(() => {
    if (!welcomeRequested) return;
    navigate(location.pathname, { replace: true, state: null });
  }, [welcomeRequested, navigate, location.pathname]);

  useEffect(() => {
    if (!showWelcome) return;
    const timer = window.setTimeout(() => setShowWelcome(false), 6000);
    return () => window.clearTimeout(timer);
  }, [showWelcome]);

  const loadTransactions = useCallback(async () => {
    const requestId = ++transactionsRequest.current;
    setTransactionsLoading(true);
    const from = (transactionsPage - 1) * transactionsPageSize;
    const to = from + transactionsPageSize - 1;

    const { data, error, count } = await supabase
      .from("transactions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (requestId !== transactionsRequest.current) return;

    if (error) {
      setTransactionsError(error.message);
      setTransactionsLoading(false);
      return;
    }

    setTransactionsError("");
    const total = count ?? 0;
    setTransactionsTotal(total);

    // A newly submitted request (or shrinking data) can leave the page out of range.
    const lastPage = Math.max(1, Math.ceil(total / transactionsPageSize));
    if (transactionsPage > lastPage) {
      setTransactions([]);
      setTransactionsPage(lastPage);
      return;
    }

    setTransactions((data ?? []) as Transaction[]);
    setTransactionsLoading(false);
  }, [transactionsPage, transactionsPageSize]);

  useEffect(() => {
    void loadTransactions();
  }, [loadTransactions]);

  const handleSaved = useCallback(async () => {
    setTransactionsPage(1);
    await Promise.all([loadTransactions(), refreshProfile()]);
  }, [loadTransactions, refreshProfile]);

  return (
    <>
      <PageHeader title="Dashboard" />

      {showWelcome && (
        <div className="da-fade-in mb-4 rounded-xl border border-primary/20 bg-primary-muted px-4 py-3 text-sm font-semibold text-primary-ink">
          Welcome,{" "}
          <span translate="no">{profile?.firstname || "Trader"}</span>
        </div>
      )}

      <Card className="border-primary/30 bg-gradient-to-br from-action via-action to-primary p-5 text-action-foreground shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-semibold uppercase tracking-wider text-action-foreground/70">
              Total balance
            </p>
            <p
              translate="no"
              className="tabular-nums mt-1 break-words text-3xl font-extrabold tracking-tight sm:text-4xl"
            >
              ${money(profile?.total_balance)}
            </p>
            <p className="mt-1 text-[0.6875rem] text-action-foreground/70">
              Available across your deposits and profit
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:flex">
            <Button
              onClick={() => setModal("deposit")}
              leftIcon={<ArrowDownToLine className="h-4 w-4" />}
              className="bg-action-foreground text-action hover:bg-action-foreground/90"
            >
              Deposit
            </Button>
            <Button
              onClick={() => setModal("withdraw")}
              leftIcon={<ArrowUpFromLine className="h-4 w-4" />}
              className="border border-action-foreground/30 bg-transparent text-action-foreground hover:bg-action-foreground/10"
            >
              Withdraw
            </Button>
          </div>
        </div>
      </Card>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Active deposit"
          value={currency(profile?.active_deposit)}
          hint="Currently working for you"
        />
        <StatCard
          label="Profit"
          value={currency(profile?.profit)}
          hint="Total earned profit"
        />
        <StatCard
          label="Investment plan"
          value={profile?.realplan || "None"}
          hint="Your current package"
        />
        <StatCard
          label="Properties owned"
          value={`+${profile?.total_properties_owned ?? 0}`}
          hint="Assets in your portfolio"
        />
      </div>

      <Card className="mt-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold tracking-tight text-text-primary">
              My requests
            </h2>
            <p className="mt-1 text-[0.6875rem] text-text-tertiary">
              Deposits and withdrawals you have submitted.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              void Promise.all([loadTransactions(), refreshProfile()]);
            }}
            loading={transactionsLoading}
            leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
          >
            Refresh
          </Button>
        </div>

        <div className="mt-3">
          {transactionsError && (
            <Alert variant="error" className="mb-3">
              {transactionsError}
            </Alert>
          )}

          {transactionsLoading && !transactions.length ? (
            <p className="py-8 text-center text-xs text-text-muted">
              Loading your requests…
            </p>
          ) : transactions.length ? (
            <>
              <ul className="space-y-2 sm:hidden">
                {transactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border-faint px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-semibold capitalize text-text-secondary">
                        {requestTypeLabel(tx)}
                      </p>
                      <p className="mt-0.5 text-[0.625rem] text-text-muted">
                        {formatDate(tx.created_at)}
                      </p>
                      <p className="mt-0.5 text-[0.625rem] text-text-muted">
                        {investmentTypeLabel(tx.investment_type)}
                        {tx.package ? ` · ${tx.package}` : ""}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p
                        translate="no"
                        className="tabular-nums text-xs font-semibold text-text-primary"
                      >
                        {currency(tx.amount)}
                      </p>
                      <div className="mt-1">
                        <StatusBadge status={tx.status} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="hidden sm:block">
                <Table minWidth={640}>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>Type</Th>
                      <Th>Amount</Th>
                      <Th>Investment type</Th>
                      <Th>Package</Th>
                      <Th>Status</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="last:[&>td]:border-b-0">
                        <Td className="whitespace-nowrap">
                          {formatDate(tx.created_at)}
                        </Td>
                        <Td className="capitalize">{requestTypeLabel(tx)}</Td>
                        <Td
                          translate="no"
                          className="tabular-nums whitespace-nowrap font-semibold text-text-primary"
                        >
                          {currency(tx.amount)}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {investmentTypeLabel(tx.investment_type)}
                        </Td>
                        <Td className="whitespace-nowrap">
                          {tx.package || "—"}
                        </Td>
                        <Td>
                          <StatusBadge status={tx.status} />
                        </Td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No requests yet"
              description="Use the deposit or withdraw button above to get started."
            />
          )}

          <Pagination
            page={transactionsPage}
            pageSize={transactionsPageSize}
            total={transactionsTotal}
            onPageChange={setTransactionsPage}
            onPageSizeChange={(size) => {
              setTransactionsPageSize(size);
              setTransactionsPage(1);
            }}
            label="requests"
          />
        </div>

        <p className="mt-3 text-[0.625rem] leading-relaxed text-text-muted">
          Balances update when an admin approves a request.
        </p>
      </Card>

      <DepositModal
        open={modal === "deposit"}
        onClose={() => setModal(null)}
        onSaved={handleSaved}
      />
      <WithdrawModal
        open={modal === "withdraw"}
        onClose={() => setModal(null)}
        onSaved={handleSaved}
      />
    </>
  );
}
