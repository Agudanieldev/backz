import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Inbox, Mail, RefreshCw, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { currency, formatDate, fullName } from "@/lib/format";
import { investmentTypeLabel } from "@/lib/investmentPlans";
import type { ContactMessage, Profile, Transaction } from "@/lib/types";
import { PageHeader } from "@/components/composite/PageHeader";
import { StatCard } from "@/components/composite/StatCard";
import { EmptyState } from "@/components/composite/EmptyState";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Pagination } from "@/components/ui/Pagination";
import { Table, Td, Th } from "@/components/ui/Table";

type Notice = { variant: "success" | "error"; message: string } | null;
type Decision = "approved" | "rejected";

const DEFAULT_PAGE_SIZE = 10;

function requestTypeLabel(tx: Transaction) {
  return tx.investment_type || tx.package ? "investment" : tx.type;
}

export default function AdminPage() {
  const navigate = useNavigate();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [approvedTransactions, setApprovedTransactions] = useState<
    Pick<Transaction, "type" | "amount">[]
  >([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [requests, setRequests] = useState<Transaction[]>([]);
  const [requestsTotal, setRequestsTotal] = useState(0);
  const [requestsPage, setRequestsPage] = useState(1);
  const [requestsPageSize, setRequestsPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [requestsError, setRequestsError] = useState("");
  const [pendingCount, setPendingCount] = useState(0);

  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [messagesTotal, setMessagesTotal] = useState(0);
  const [messagesPage, setMessagesPage] = useState(1);
  const [messagesPageSize, setMessagesPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [messagesError, setMessagesError] = useState("");

  const [notice, setNotice] = useState<Notice>(null);
  const [saving, setSaving] = useState<{
    id: number;
    decision: Decision;
  } | null>(null);

  const requestsRequest = useRef(0);
  const messagesRequest = useRef(0);

  const loading = statsLoading || requestsLoading || messagesLoading;
  const loadError = statsError || requestsError || messagesError;

  const loadStats = useCallback(async () => {
    setStatsLoading(true);

    const [profilesResult, approvedResult] = await Promise.all([
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("transactions")
        .select("type, amount")
        .eq("status", "approved"),
    ]);

    const failed = profilesResult.error ?? approvedResult.error;
    if (failed) {
      setStatsError(failed.message);
    } else {
      setStatsError("");
    }

    setProfiles((profilesResult.data ?? []) as Profile[]);
    setApprovedTransactions(
      (approvedResult.data ?? []) as Pick<Transaction, "type" | "amount">[],
    );
    setStatsLoading(false);
  }, []);

  const loadRequests = useCallback(async () => {
    const requestId = ++requestsRequest.current;
    setRequestsLoading(true);
    const from = (requestsPage - 1) * requestsPageSize;
    const to = from + requestsPageSize - 1;

    const [listResult, pendingResult] = await Promise.all([
      supabase
        .from("transactions")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(from, to),
      supabase
        .from("transactions")
        .select("id", { count: "exact", head: true })
        .eq("status", "pending"),
    ]);

    if (requestId !== requestsRequest.current) return;

    const failed = listResult.error ?? pendingResult.error;
    if (failed) {
      setRequestsError(failed.message);
      setRequestsLoading(false);
      return;
    }

    setRequestsError("");
    setPendingCount(pendingResult.count ?? 0);

    // Keep reviewed requests visible; only the page range needs clamping.
    const total = listResult.count ?? 0;
    setRequestsTotal(total);

    const lastPage = Math.max(1, Math.ceil(total / requestsPageSize));
    if (requestsPage > lastPage) {
      setRequests([]);
      setRequestsPage(lastPage);
      return;
    }

    setRequests((listResult.data ?? []) as Transaction[]);
    setRequestsLoading(false);
  }, [requestsPage, requestsPageSize]);

  const loadMessages = useCallback(async () => {
    const requestId = ++messagesRequest.current;
    setMessagesLoading(true);
    const from = (messagesPage - 1) * messagesPageSize;
    const to = from + messagesPageSize - 1;

    const { data, error, count } = await supabase
      .from("contact_messages")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (requestId !== messagesRequest.current) return;

    if (error) {
      setMessagesError(error.message);
      setMessagesLoading(false);
      return;
    }

    setMessagesError("");
    const total = count ?? 0;
    setMessagesTotal(total);

    const lastPage = Math.max(1, Math.ceil(total / messagesPageSize));
    if (messagesPage > lastPage) {
      setMessages([]);
      setMessagesPage(lastPage);
      return;
    }

    setMessages((data ?? []) as ContactMessage[]);
    setMessagesLoading(false);
  }, [messagesPage, messagesPageSize]);

  useEffect(() => {
    void loadStats();
  }, [loadStats]);

  useEffect(() => {
    void loadRequests();
  }, [loadRequests]);

  useEffect(() => {
    void loadMessages();
  }, [loadMessages]);

  const refreshAll = useCallback(
    () => Promise.all([loadStats(), loadRequests(), loadMessages()]),
    [loadStats, loadRequests, loadMessages],
  );

  async function review(id: number, decision: Decision) {
    const tx = requests.find((entry) => entry.id === id);
    const client = tx
      ? profiles.find((profile) => profile.id === tx.user_id)
      : undefined;
    const name = fullName(client ?? null);

    setNotice(null);
    setSaving({ id, decision });

    const { error } = await supabase.rpc("review_transaction", {
      p_transaction_id: id,
      p_decision: decision,
    });

    setSaving(null);

    if (error) {
      setNotice({ variant: "error", message: error.message });
      return;
    }

    setNotice({
      variant: "success",
      message:
        decision === "approved"
          ? `${name}'s request approved and balances updated.`
          : `${name}'s request was rejected.`,
    });
    await Promise.all([loadStats(), loadRequests()]);
  }

  const approvedDeposits = approvedTransactions
    .filter((tx) => tx.type === "deposit")
    .reduce((total, tx) => total + Number(tx.amount), 0);
  const approvedWithdrawals = approvedTransactions
    .filter((tx) => tx.type === "withdraw")
    .reduce((total, tx) => total + Number(tx.amount), 0);

  const totals = profiles.reduce(
    (accumulator, profile) => ({
      balance: accumulator.balance + Number(profile.total_balance ?? 0),
      deposits: accumulator.deposits + Number(profile.active_deposit ?? 0),
      profit: accumulator.profit + Number(profile.profit ?? 0),
      properties:
        accumulator.properties + Number(profile.total_properties_owned ?? 0),
    }),
    { balance: 0, deposits: 0, profit: 0, properties: 0 },
  );

  const profilesById = new Map(profiles.map((profile) => [profile.id, profile]));

  return (
    <>
      <PageHeader
        title="Admin panel"
        action={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate("/admin/users")}
              leftIcon={<Users className="h-3.5 w-3.5" />}
            >
              Users
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void refreshAll()}
              loading={loading}
              leftIcon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              Refresh
            </Button>
          </div>
        }
      />

      {loadError && (
        <Alert variant="error" className="mb-3">
          {loadError}
        </Alert>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total users"
          value={String(profiles.length)}
          hint="Registered accounts"
        />
        <StatCard
          label="Pending requests"
          value={String(pendingCount)}
          hint="Waiting for review"
        />
        <StatCard
          label="Total balance"
          value={currency(totals.balance)}
          hint="Across all users"
        />
        <StatCard
          label="Properties owned"
          value={`+${totals.properties}`}
          hint="Across all users"
        />
        <StatCard
          label="Active deposits"
          value={currency(totals.deposits)}
          hint="Sum of user deposits"
        />
        <StatCard
          label="Total profit"
          value={currency(totals.profit)}
          hint="Sum of user profit"
        />
        <StatCard
          label="Approved deposits"
          value={currency(approvedDeposits)}
          hint="Total approved value"
        />
        <StatCard
          label="Approved withdrawals"
          value={currency(approvedWithdrawals)}
          hint="Total paid out value"
        />
      </div>

      <Card className="mt-4 p-5">
        <h2 className="text-sm font-bold tracking-tight text-text-primary">
          Requests
        </h2>
        <p className="mt-1 text-[0.6875rem] text-text-tertiary">
          All deposit and withdrawal requests, including reviewed ones.
        </p>

        {notice && (
          <Alert variant={notice.variant} className="mt-3">
            {notice.message}
          </Alert>
        )}

        <div className="mt-3">
          {requestsLoading && !requests.length ? (
            <p className="py-8 text-center text-xs text-text-muted">
              Loading requests…
            </p>
          ) : requests.length ? (
            <>
              <div className="space-y-2 sm:hidden">
                {requests.map((tx) => {
                  const user = profilesById.get(tx.user_id);
                  const isPending = tx.status === "pending";
                  return (
                    <div
                      key={tx.id}
                      className="rounded-xl border border-border-soft p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-text-primary">
                            {fullName(user ?? null)}
                          </p>
                          <p className="mt-0.5 text-[0.625rem] capitalize text-text-muted">
                            {formatDate(tx.created_at)} · {requestTypeLabel(tx)}
                          </p>
                          <p className="mt-0.5 text-[0.625rem] text-text-muted">
                            {investmentTypeLabel(tx.investment_type)}
                            {tx.package ? ` · ${tx.package}` : ""}
                          </p>
                        </div>
                        <div className="shrink-0 text-right">
                          <p
                            translate="no"
                            className="tabular-nums text-sm font-bold text-text-primary"
                          >
                            {currency(tx.amount)}
                          </p>
                          <div className="mt-1">
                            <StatusBadge status={tx.status} />
                          </div>
                        </div>
                      </div>

                      {tx.wallet_address && (
                        <p className="mt-2 truncate font-mono text-[0.625rem] text-text-muted">
                          {tx.wallet_address}
                        </p>
                      )}

                      {isPending && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <Button
                            size="sm"
                            onClick={() => void review(tx.id, "approved")}
                            loading={
                              saving?.id === tx.id &&
                              saving.decision === "approved"
                            }
                            disabled={saving !== null}
                          >
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="danger"
                            onClick={() => void review(tx.id, "rejected")}
                            loading={
                              saving?.id === tx.id &&
                              saving.decision === "rejected"
                            }
                            disabled={saving !== null}
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="hidden sm:block">
                <Table minWidth={900}>
                  <thead>
                    <tr>
                      <Th>Date</Th>
                      <Th>User</Th>
                      <Th>Type</Th>
                      <Th>Amount</Th>
                      <Th>Investment type</Th>
                      <Th>Package</Th>
                      <Th>Wallet</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((tx) => {
                      const user = profilesById.get(tx.user_id);
                      const isPending = tx.status === "pending";
                      return (
                        <tr key={tx.id} className="last:[&>td]:border-b-0">
                          <Td className="whitespace-nowrap">
                            {formatDate(tx.created_at)}
                          </Td>
                          <Td className="whitespace-nowrap font-medium text-text-secondary">
                            {fullName(user ?? null)}
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
                          <Td className="max-w-[160px]">
                            <span
                              translate="no"
                              className="block truncate font-mono text-[0.625rem]"
                            >
                              {tx.wallet_address || "—"}
                            </span>
                          </Td>
                          <Td>
                            <StatusBadge status={tx.status} />
                          </Td>
                          <Td>
                            {isPending ? (
                              <div className="flex flex-wrap gap-1.5">
                                <Button
                                  size="sm"
                                  onClick={() => void review(tx.id, "approved")}
                                  loading={
                                    saving?.id === tx.id &&
                                    saving.decision === "approved"
                                  }
                                  disabled={saving !== null}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="danger"
                                  onClick={() => void review(tx.id, "rejected")}
                                  loading={
                                    saving?.id === tx.id &&
                                    saving.decision === "rejected"
                                  }
                                  disabled={saving !== null}
                                >
                                  Reject
                                </Button>
                              </div>
                            ) : (
                              <span className="text-[0.625rem] text-text-muted">
                                Reviewed
                              </span>
                            )}
                          </Td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>
            </>
          ) : (
            <EmptyState
              icon={Inbox}
              title="No requests yet"
              description="Deposit and withdrawal requests will appear here."
            />
          )}

          <Pagination
            page={requestsPage}
            pageSize={requestsPageSize}
            total={requestsTotal}
            onPageChange={setRequestsPage}
            onPageSizeChange={(size) => {
              setRequestsPageSize(size);
              setRequestsPage(1);
            }}
            label="requests"
          />
        </div>
      </Card>

      <Card className="mt-4 p-5">
        <h2 className="text-sm font-bold tracking-tight text-text-primary">
          Contact messages
        </h2>

        <div className="mt-3">
          {messagesLoading && !messages.length ? (
            <p className="py-8 text-center text-xs text-text-muted">
              Loading messages…
            </p>
          ) : messages.length ? (
            <Table minWidth={720}>
              <thead>
                <tr>
                  <Th>Date</Th>
                  <Th>Name</Th>
                  <Th>Contact</Th>
                  <Th>Subject</Th>
                  <Th>Message</Th>
                </tr>
              </thead>
              <tbody>
                {messages.map((entry) => (
                  <tr key={entry.id} className="last:[&>td]:border-b-0">
                    <Td className="whitespace-nowrap">
                      {formatDate(entry.created_at)}
                    </Td>
                    <Td className="whitespace-nowrap font-medium text-text-secondary">
                      {entry.name || "—"}
                    </Td>
                    <Td>
                      <span className="block text-[0.625rem] text-text-secondary">
                        {entry.email || "—"}
                      </span>
                      {entry.phone && (
                        <span className="block text-[0.625rem] text-text-muted">
                          {entry.phone}
                        </span>
                      )}
                    </Td>
                    <Td className="max-w-[160px]">
                      <span className="block truncate">
                        {entry.subject || "—"}
                      </span>
                    </Td>
                    <Td className="max-w-[320px] whitespace-normal">
                      <span
                        className="line-clamp-2 block text-[0.6875rem] leading-relaxed"
                        title={entry.message ?? ""}
                      >
                        {entry.message || "—"}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <EmptyState
              icon={Mail}
              title="No contact messages yet"
              description="Messages from the marketing site will appear here."
            />
          )}

          <Pagination
            page={messagesPage}
            pageSize={messagesPageSize}
            total={messagesTotal}
            onPageChange={setMessagesPage}
            onPageSizeChange={(size) => {
              setMessagesPageSize(size);
              setMessagesPage(1);
            }}
            label="messages"
          />
        </div>
      </Card>
    </>
  );
}
