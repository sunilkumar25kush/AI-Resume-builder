import {
  BarChart3,
  Bell,
  Briefcase,
  FileSignature,
  FileText,
  LayoutDashboard,
  MessageSquare,
  PenLine,
  Settings,
  ShieldCheck,
  User,
  Wand2,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href?: string;
  icon: LucideIcon;
  soon?: boolean;
  adminOnly?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
}

/** Full app navigation — future modules are listed with `soon` and get enabled as they ship. */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "main",
    label: "Main",
    items: [
      { label: "Dashboard", href: "/", icon: LayoutDashboard },
      { label: "Resume Builder", href: "/resumes", icon: FileText },
      { label: "AI Optimizer", icon: Wand2, soon: true },
    ],
  },
  {
    id: "generators",
    label: "Generators",
    items: [
      { label: "Cover Letter", icon: PenLine, soon: true },
      { label: "LinkedIn Summary", icon: FileSignature, soon: true },
      { label: "Interview Questions", icon: MessageSquare, soon: true },
      { label: "Portfolio", icon: Briefcase, soon: true },
    ],
  },
  {
    id: "analytics",
    label: "Insights",
    items: [{ label: "Analytics", icon: BarChart3, soon: true }],
  },
  {
    id: "account",
    label: "Account",
    items: [
      { label: "Profile", href: "/profile", icon: User },
      { label: "Settings", href: "/settings", icon: Settings },
      { label: "Notifications", href: "/notifications", icon: Bell },
      { label: "Admin Panel", icon: ShieldCheck, soon: true, adminOnly: true },
    ],
  },
];

export const MAIN_NAV = NAV_GROUPS.find((g) => g.id === "main")!;
export const GENERATORS_NAV = NAV_GROUPS.find((g) => g.id === "generators")!;
export const ACCOUNT_NAV = NAV_GROUPS.find((g) => g.id === "account")!;
