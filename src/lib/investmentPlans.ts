import type { InvestmentType } from "./types";

export const INVESTMENT_TYPE_OPTIONS: {
  value: InvestmentType;
  label: string;
}[] = [
  { value: "real", label: "Real Estate" },
  { value: "digital", label: "Digital" },
];

export const INVESTMENT_PACKAGES: Record<InvestmentType, string[]> = {
  real: ["Silver", "Gold", "Diamond", "Platinum"],
  digital: ["Silver", "Gold", "Platinum", "Huge Volume"],
};

const INVESTMENT_TYPE_LABELS: Record<string, string> = {
  real: "Real Estate",
  digital: "Digital",
};

export function investmentTypeLabel(value: string | null | undefined) {
  if (!value) return "—";
  return INVESTMENT_TYPE_LABELS[value] ?? value;
}

export function isInvestmentType(value: string): value is InvestmentType {
  return value === "real" || value === "digital";
}
