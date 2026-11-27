export type Role = "admin" | "user";

export interface Profile {
  id: string;
  email: string | null;
  firstname: string | null;
  lastname: string | null;
  role: Role | string | null;
  total_balance: number | string | null;
  active_deposit: number | string | null;
  profit: number | string | null;
  realplan: string | null;
  total_properties_owned: number | null;
  created_at: string;
}

export type TransactionType = "deposit" | "withdraw";
export type TransactionStatus = "pending" | "approved" | "rejected";
export type InvestmentType = "real" | "digital";

export interface Transaction {
  id: number;
  user_id: string;
  type: TransactionType | string;
  amount: number | string;
  wallet_address: string | null;
  investment_type: InvestmentType | string | null;
  package: string | null;
  status: TransactionStatus | string;
  created_at: string;
}

export interface ContactMessage {
  id: number;
  name: string | null;
  email: string | null;
  phone: string | null;
  subject: string | null;
  message: string | null;
  created_at: string;
}

export const WALLET_ADDRESS = "bc1q6hc3la940cpeqt9425gsk2c855rah7qjp2kf8c";
