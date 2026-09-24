"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  Boxes,
  Building2,
  ClipboardList,
  Command,
  FileKey2,
  LayoutDashboard,
  LifeBuoy,
  Search,
  Settings,
  UserRound,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type CommandItem = {
  label: string;
  description: string;
  href: string;
  keywords: string[];
  icon: React.ElementType;
  section: string;
};

const commandItems: CommandItem[] = [
  {
    label: "Dashboard",
    description: "Overview and asset analytics",
    href: "/dashboard",
    keywords: ["home", "overview", "analytics", "kpi"],
    icon: LayoutDashboard,
    section: "Navigation",
  },
  {
    label: "Assets",
    description: "Browse and manage company assets",
    href: "/assets",
    keywords: [
      "hardware",
      "laptop",
      "monitor",
      "device",
      "inventory",
    ],
    icon: Boxes,
    section: "Navigation",
  },
  {
    label: "Employees",
    description: "Manage employees and departments",
    href: "/employees",
    keywords: [
      "staff",
      "people",
      "users",
      "department",
    ],
    icon: Users,
    section: "Navigation",
  },
  {
    label: "Allocations",
    description: "Track assigned assets",
    href: "/allocations",
    keywords: [
      "assignment",
      "checkout",
      "custody",
    ],
    icon: ClipboardList,
    section: "Navigation",
  },
  {
    label: "Return Requests",
    description: "Review asset return requests",
    href: "/return-requests",
    keywords: [
      "returns",
      "checkin",
      "request",
    ],
    icon: ClipboardList,
    section: "Navigation",
  },
  {
    label: "Maintenance",
    description: "Track repairs and servicing",
    href: "/maintenance",
    keywords: [
      "repair",
      "service",
      "maintenance",
      "issue",
    ],
    icon: Wrench,
    section: "Navigation",
  },
  {
    label: "Licenses",
    description: "Manage software licenses and seats",
    href: "/licenses",
    keywords: [
      "software",
      "license",
      "seats",
      "renewal",
    ],
    icon: FileKey2,
    section: "Navigation",
  },
  {
    label: "Reports",
    description: "Business intelligence and reports",
    href: "/reports",
    keywords: [
      "analytics",
      "charts",
      "statistics",
      "data",
    ],
    icon: BarChart3,
    section: "Insights",
  },
  {
    label: "Audit Logs",
    description: "Review system activity",
    href: "/audit",
    keywords: [
      "activity",
      "history",
      "events",
      "logs",
    ],
    icon: Activity,
    section: "Insights",
  },
  {
    label: "Settings",
    description: "Configure ASSETFLOW",
    href: "/settings",
    keywords: [
      "configuration",
      "preferences",
      "system",
    ],
    icon: Settings,
    section: "System",
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] =
    useState(0);

  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen(true);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyboard
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboard
      );
    };
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setSelectedIndex(0);
      return;
    }

    const timer = window.setTimeout(() => {
      document
        .getElementById("assetflow-command-search")
        ?.focus();
    }, 50);

    return () => {
      window.clearTimeout(timer);
    };
  }, [open]);

  const filteredItems = useMemo(() => {
    const normalizedQuery =
      query.trim().toLowerCase();

    if (!normalizedQuery) {
      return commandItems;
    }

    return commandItems.filter((item) => {
      const searchableText = [
        item.label,
        item.description,
        ...item.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(
        normalizedQuery
      );
    });
  }, [query]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  function handleKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.min(
          current + 1,
          Math.max(filteredItems.length - 1, 0)
        )
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.max(current - 1, 0)
      );
    }

    if (
      event.key === "Enter" &&
      filteredItems[selectedIndex]
    ) {
      window.location.href =
        filteredItems[selectedIndex].href;
    }
  }

  const sections = [
    "Navigation",
    "Insights",
    "System",
  ];

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-40 hidden items-center gap-2 rounded-xl border border-white/[0.08] bg-[#0b0f17]/90 px-3 py-2 text-[11px] text-slate-500 shadow-2xl backdrop-blur-xl transition hover:border-cyan-400/20 hover:text-slate-300 lg:flex"
        title="Open command palette"
      >
        <Command size={13} />

        <span>Quick Navigate</span>

        <kbd className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] text-slate-600">
          Ctrl K
        </kbd>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-start justify-center px-4 pt-[12vh] sm:px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.button
              type="button"
              aria-label="Close command palette"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-black/70 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Palette */}
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="ASSETFLOW command palette"
              className="relative z-10 w-full max-w-2xl overflow-hidden rounded-2xl border border-white/[0.09] bg-[#090d14] shadow-[0_30px_100px_rgba(0,0,0,0.65)]"
              initial={{
                opacity: 0,
                y: -20,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: -10,
                scale: 0.99,
              }}
              transition={{
                duration: 0.18,
              }}
            >
              {/* Search */}
              <div className="flex items-center gap-3 border-b border-white/[0.07] px-4">
                <Search
                  size={18}
                  className="shrink-0 text-cyan-400"
                />

                <input
                  id="assetflow-command-search"
                  value={query}
                  onChange={(event) =>
                    setQuery(event.target.value)
                  }
                  onKeyDown={handleKeyDown}
                  placeholder="Search ASSETFLOW..."
                  autoComplete="off"
                  className="h-14 min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-600"
                />

                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-600 transition hover:bg-white/[0.05] hover:text-white"
                >
                  <X size={15} />
                </button>
              </div>

              {/* Results */}
              <div className="max-h-[55vh] overflow-y-auto p-2">
                {filteredItems.length > 0 ? (
                  sections.map((section) => {
                    const sectionItems =
                      filteredItems.filter(
                        (item) =>
                          item.section === section
                      );

                    if (!sectionItems.length) {
                      return null;
                    }

                    return (
                      <div
                        key={section}
                        className="mb-3 last:mb-0"
                      >
                        <div className="px-3 py-2 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-700">
                          {section}
                        </div>

                        <div className="space-y-0.5">
                          {sectionItems.map(
                            (item) => {
                              const absoluteIndex =
                                filteredItems.indexOf(
                                  item
                                );

                              const Icon =
                                item.icon;

                              const selected =
                                absoluteIndex ===
                                selectedIndex;

                              return (
                                <Link
                                  key={item.href}
                                  href={item.href}
                                  onClick={() =>
                                    setOpen(false)
                                  }
                                  className={`group flex items-center gap-3 rounded-xl px-3 py-3 transition ${
                                    selected
                                      ? "bg-cyan-400/[0.07]"
                                      : "hover:bg-white/[0.035]"
                                  }`}
                                >
                                  <div
                                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition ${
                                      selected
                                        ? "border-cyan-400/20 bg-cyan-400/[0.08] text-cyan-400"
                                        : "border-white/[0.06] bg-white/[0.025] text-slate-600 group-hover:text-slate-300"
                                    }`}
                                  >
                                    <Icon
                                      size={16}
                                    />
                                  </div>

                                  <div className="min-w-0 flex-1">
                                    <p
                                      className={`text-xs font-medium ${
                                        selected
                                          ? "text-white"
                                          : "text-slate-300"
                                      }`}
                                    >
                                      {item.label}
                                    </p>

                                    <p className="mt-0.5 truncate text-[10px] text-slate-700">
                                      {
                                        item.description
                                      }
                                    </p>
                                  </div>

                                  {selected && (
                                    <span className="text-[9px] text-cyan-400/60">
                                      Enter
                                    </span>
                                  )}
                                </Link>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="px-6 py-12 text-center">
                    <Search
                      size={24}
                      className="mx-auto text-slate-700"
                    />

                    <p className="mt-3 text-sm font-medium text-white">
                      No results found
                    </p>

                    <p className="mt-1 text-xs text-slate-600">
                      Try searching for an asset,
                      employee, license, report, or
                      setting.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between border-t border-white/[0.06] px-4 py-3">
                <div className="flex items-center gap-3 text-[9px] text-slate-700">
                  <span>
                    ↑↓ Navigate
                  </span>

                  <span>
                    ↵ Open
                  </span>

                  <span>
                    Esc Close
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-slate-700">
                  <Command size={10} />
                  ASSETFLOW
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}