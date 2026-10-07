"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  Mail,
  Star,
  Activity,
  Lock,
  Music,
  FileText,
  Settings,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "active" | "upcoming";
}

const NAV_ITEMS: NavItem[] = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
    status: "active",
  },
  {
    name: "Projects",
    href: "/dashboard/projects",
    icon: FolderKanban,
    status: "active",
  },
  {
    name: "Messages",
    href: "/dashboard/messages",
    icon: Mail,
    status: "upcoming",
  },
  {
    name: "Reviews",
    href: "/dashboard/reviews",
    icon: Star,
    status: "upcoming",
  },
  {
    name: "Telemetry",
    href: "/dashboard/telemetry",
    icon: Activity,
    status: "upcoming",
  },
  {
    name: "Vault",
    href: "/dashboard/vault",
    icon: Lock,
    status: "upcoming",
  },
  {
    name: "Music",
    href: "/dashboard/music",
    icon: Music,
    status: "upcoming",
  },
  {
    name: "Notes",
    href: "/dashboard/notes",
    icon: FileText,
    status: "upcoming",
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
    status: "upcoming",
  },
];

export function DashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      <div className="px-3 pb-2 text-[10px] font-mono uppercase tracking-wider text-zinc-500">
        Control Plane Modules
      </div>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isCurrent = pathname === item.href;
        const isUpcoming = item.status === "upcoming";

        if (isUpcoming) {
          return (
            <div
              key={item.name}
              className="group flex items-center justify-between px-3 py-2 text-xs font-mono text-zinc-600 rounded-md cursor-not-allowed select-none transition-colors"
              title={`${item.name} module will be available in Phase 3C.3+`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className="w-4 h-4 text-zinc-700" />
                <span>{item.name}</span>
              </div>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-600 uppercase">
                Upcoming
              </span>
            </div>
          );
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center justify-between px-3 py-2 text-xs font-mono rounded-md transition-colors ${
              isCurrent
                ? "bg-zinc-900 text-white font-medium border border-zinc-800"
                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Icon className={`w-4 h-4 ${isCurrent ? "text-emerald-400" : "text-zinc-500"}`} />
              <span>{item.name}</span>
            </div>
            {isCurrent && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
