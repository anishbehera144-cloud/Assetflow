"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Users,
  ArrowLeftRight,
  RotateCcw,
  Wrench,
  KeyRound,
  BarChart3,
  ClipboardList,
  Settings,
  ChevronRight,
  Boxes,
} from "lucide-react";
import { motion } from "framer-motion";

const navigation = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },
  {
    title: "Asset Management",
    items: [
      {
        label: "Assets",
        href: "/assets",
        icon: Package,
      },
      {
        label: "Employees",
        href: "/employees",
        icon: Users,
      },
      {
        label: "Allocations",
        href: "/allocations",
        icon: ArrowLeftRight,
      },
      {
        label: "Return Requests",
        href: "/return-requests",
        icon: RotateCcw,
      },
      {
        label: "Maintenance",
        href: "/maintenance",
        icon: Wrench,
      },
      {
        label: "Software Licenses",
        href: "/licenses",
        icon: KeyRound,
      },
    ],
  },
  {
    title: "Insights",
    items: [
      {
        label: "Reports",
        href: "/reports",
        icon: BarChart3,
      },
      {
        label: "Audit Logs",
        href: "/audit",
        icon: ClipboardList,
      },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-[260px] border-r border-white/[0.08] bg-[#080b12] lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-[76px] items-center border-b border-white/[0.08] px-6">
        <Link href="/dashboard" className="group flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-cyan-400 text-slate-950 shadow-[0_0_30px_rgba(34,211,238,0.25)]">
            <Boxes size={20} strokeWidth={2.5} />
          </div>

          <div>
            <div className="text-[17px] font-bold tracking-tight text-white">
              ASSET<span className="text-cyan-400">FLOW</span>
            </div>

            <div className="text-[9px] font-medium uppercase tracking-[0.22em] text-slate-500">
              Enterprise
            </div>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3 py-6">
        {navigation.map((section) => (
          <div key={section.title} className="mb-7">
            <div className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
              {section.title}
            </div>

            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;

                const isActive =
                  pathname === item.href ||
                  (item.href !== "/dashboard" &&
                    pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="group relative block"
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-sidebar"
                        className="absolute inset-0 rounded-xl bg-cyan-400/[0.09]"
                        transition={{
                          type: "spring",
                          stiffness: 350,
                          damping: 30,
                        }}
                      />
                    )}

                    <div
                      className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200 ${
                        isActive
                          ? "text-cyan-300"
                          : "text-slate-400 hover:bg-white/[0.035] hover:text-white"
                      }`}
                    >
                      <Icon
                        size={17}
                        strokeWidth={isActive ? 2.2 : 1.8}
                      />

                      <span>{item.label}</span>

                      {isActive && (
                        <ChevronRight
                          size={14}
                          className="ml-auto text-cyan-400"
                        />
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom */}
      <div className="border-t border-white/[0.08] p-3">
        <Link
          href="/settings"
          className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-slate-400 transition hover:bg-white/[0.035] hover:text-white"
        >
          <Settings size={17} />
          <span>Settings</span>
        </Link>

        <div className="mt-2 rounded-xl border border-white/[0.06] bg-white/[0.025] p-3">
          <div className="mb-1 flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.6)]" />
            <span className="text-xs font-medium text-slate-300">
              System Operational
            </span>
          </div>

          <p className="text-[10px] text-slate-600">
            ASSETFLOW v1.0
          </p>
        </div>
      </div>
    </aside>
  );
}