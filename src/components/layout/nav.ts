import {
  LayoutDashboard,
  ShieldCheck,
  UserRound,
  Users,
  Wallet,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  section: "Overview" | "Admin" | "Account";
  adminOnly?: boolean;
  userOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
    section: "Overview",
    userOnly: true,
  },
  {
    to: "/invest",
    label: "Investment Packages",
    icon: Wallet,
    section: "Overview",
    userOnly: true,
  },
  {
    to: "/tools",
    label: "Tools",
    icon: Wrench,
    section: "Overview",
    userOnly: true,
  },
  {
    to: "/admin",
    label: "Admin Panel",
    icon: ShieldCheck,
    section: "Admin",
    adminOnly: true,
  },
  {
    to: "/admin/users",
    label: "Users",
    icon: Users,
    section: "Admin",
    adminOnly: true,
  },
  {
    to: "/profile",
    label: "Profile",
    icon: UserRound,
    section: "Account",
  },
];

export const NAV_SECTIONS = ["Overview", "Admin", "Account"] as const;
