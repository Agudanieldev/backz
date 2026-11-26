export function money(value: number | string | null | undefined) {
  return Number(value ?? 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function currency(value: number | string | null | undefined) {
  return `$${money(value)}`;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function fullName(
  profile: { firstname?: string | null; lastname?: string | null; email?: string | null } | null,
) {
  if (!profile) return "Trader";
  const name = `${profile.firstname ?? ""} ${profile.lastname ?? ""}`.trim();
  return name || profile.email || "Trader";
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
