"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Search,
  Command,
  X,
  Laptop,
  User,
  KeyRound,
  ArrowUp,
  ArrowDown,
  CornerDownLeft,
  Loader2,
} from "lucide-react";

import {
  globalSearch,
  type GlobalSearchResult,
} from "@/app/actions/global-search";

type SearchItem = {
  type: "asset" | "employee" | "license";
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  href: string;
};

export function GlobalSearch() {
  const router = useRouter();

  const inputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);

  const [query, setQuery] = useState("");

  const [loading, setLoading] = useState(false);

  const [results, setResults] =
    useState<GlobalSearchResult>({
      assets: [],
      employees: [],
      licenses: [],
    });

  const [selectedIndex, setSelectedIndex] =
    useState(0);

  /*
   * Open search with Ctrl+K / Cmd+K
   */
  useEffect(() => {
    function handleKeyboardShortcut(
      event: KeyboardEvent
    ) {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();

        setOpen(true);

        setTimeout(() => {
          inputRef.current?.focus();
        }, 50);
      }

      if (
        event.key === "Escape" &&
        open
      ) {
        event.preventDefault();
        setOpen(false);
      }
    }

    document.addEventListener(
      "keydown",
      handleKeyboardShortcut
    );

    return () => {
      document.removeEventListener(
        "keydown",
        handleKeyboardShortcut
      );
    };
  }, [open]);

  /*
   * Search database
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const search = query.trim();

    if (!search) {
      setResults({
        assets: [],
        employees: [],
        licenses: [],
      });

      setLoading(false);

      return;
    }

    const timeout = setTimeout(
      async () => {
        try {
          setLoading(true);

          const data =
            await globalSearch(search);

          setResults(data);

          setSelectedIndex(0);
        } catch (error) {
          console.error(
            "GLOBAL_SEARCH_ERROR",
            error
          );

          setResults({
            assets: [],
            employees: [],
            licenses: [],
          });
        } finally {
          setLoading(false);
        }
      },
      250
    );

    return () => {
      clearTimeout(timeout);
    };
  }, [query, open]);

  /*
   * Build unified result list
   */
  const items: SearchItem[] = [
    ...results.assets.map((asset) => ({
      type: "asset" as const,
      id: asset.id,
      title: asset.assetTag,
      subtitle:
        [
          asset.manufacturer,
          asset.model,
        ]
          .filter(Boolean)
          .join(" ") ||
        "Asset",
      meta:
        [
          asset.department,
          asset.status.replaceAll(
            "_",
            " "
          ),
        ]
          .filter(Boolean)
          .join(" · "),
      href: `/assets/${asset.id}`,
    })),

    ...results.employees.map(
      (employee) => ({
        type: "employee" as const,
        id: employee.id,
        title: `${employee.firstName} ${employee.lastName}`,
        subtitle: employee.employeeCode,
        meta:
          [
            employee.department,
            employee.jobTitle,
          ]
            .filter(Boolean)
            .join(" · "),
        href: `/employees/${employee.id}`,
      })
    ),

    ...results.licenses.map(
      (license) => ({
        type: "license" as const,
        id: license.id,
        title: license.name,
        subtitle:
          license.publisher ??
          "Software License",
        meta:
          `${license.totalSeats - license.availableSeats}/${license.totalSeats} seats used · ${license.status}`,
        href: `/licenses/${license.id}`,
      })
    ),
  ];

  function closeSearch() {
    setOpen(false);
    setQuery("");
    setSelectedIndex(0);
  }

  function openItem(item: SearchItem) {
    closeSearch();
    router.push(item.href);
  }

  function handleInputKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key === "Escape") {
      closeSearch();
      return;
    }

    if (
      event.key === "ArrowDown"
    ) {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.min(
          current + 1,
          Math.max(items.length - 1, 0)
        )
      );

      return;
    }

    if (
      event.key === "ArrowUp"
    ) {
      event.preventDefault();

      setSelectedIndex((current) =>
        Math.max(current - 1, 0)
      );

      return;
    }

    if (
      event.key === "Enter" &&
      items[selectedIndex]
    ) {
      event.preventDefault();

      openItem(items[selectedIndex]);
    }
  }

  const hasResults =
    items.length > 0;

  return (
    <>
      {/* Desktop search trigger */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);

          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        }}
        className="relative hidden max-w-md flex-1 text-left md:block"
        aria-label="Open global search"
      >
        <div className="relative">
          <Search
            size={17}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
          />

          <div className="flex h-10 w-full items-center rounded-xl border border-white/[0.07] bg-white/[0.025] pl-10 pr-20 text-sm text-slate-600 transition hover:border-white/[0.12] hover:bg-white/[0.04]">
            Search assets, employees, tags...
          </div>

          <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1 rounded-md border border-white/[0.07] bg-white/[0.035] px-2 py-1 text-[10px] text-slate-600">
            <Command size={11} />

            <span>K</span>
          </div>
        </div>
      </button>

      {/* Mobile search */}
      <button
        type="button"
        onClick={() => {
          setOpen(true);

          setTimeout(() => {
            inputRef.current?.focus();
          }, 50);
        }}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 transition hover:bg-white/[0.05] hover:text-white md:hidden"
        aria-label="Search"
      >
        <Search size={18} />
      </button>

      {/* Search Modal */}
      {open && (
        <div className="fixed inset-0 z-[200]">
          {/* Backdrop */}
          <button
            type="button"
            aria-label="Close search"
            onClick={closeSearch}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          {/* Search panel */}
          <div className="relative mx-auto mt-[9vh] w-[calc(100%-32px)] max-w-2xl overflow-hidden rounded-2xl border border-white/[0.1] bg-[#0b0f17] shadow-2xl shadow-black/60">
            {/* Search input */}
            <div className="flex items-center border-b border-white/[0.08] px-4">
              <Search
                size={20}
                className="shrink-0 text-cyan-400"
              />

              <input
                ref={inputRef}
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                onKeyDown={
                  handleInputKeyDown
                }
                placeholder="Search assets, employees, licenses..."
                className="h-16 flex-1 bg-transparent px-3 text-base text-white outline-none placeholder:text-slate-600"
                autoComplete="off"
              />

              {loading && (
                <Loader2
                  size={18}
                  className="mr-2 animate-spin text-cyan-400"
                />
              )}

              <button
                type="button"
                onClick={closeSearch}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-white/[0.05] hover:text-white"
                aria-label="Close search"
              >
                <X size={17} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[55vh] overflow-y-auto">
              {!query.trim() ? (
                <div className="px-6 py-12 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.07] bg-white/[0.025]">
                    <Search
                      size={21}
                      className="text-slate-600"
                    />
                  </div>

                  <p className="text-sm font-medium text-slate-300">
                    Search ASSETFLOW
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Find assets, employees and
                    software licenses.
                  </p>
                </div>
              ) : loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2
                    size={24}
                    className="animate-spin text-cyan-400"
                  />
                </div>
              ) : !hasResults ? (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-medium text-slate-300">
                    No results found
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    Try an asset tag, employee name,
                    or license name.
                  </p>
                </div>
              ) : (
                <div className="py-2">
                  {items.map(
                    (item, index) => {
                      const selected =
                        index ===
                        selectedIndex;

                      const Icon =
                        item.type ===
                        "asset"
                          ? Laptop
                          : item.type ===
                            "employee"
                          ? User
                          : KeyRound;

                      return (
                        <button
                          key={`${item.type}-${item.id}`}
                          type="button"
                          onMouseEnter={() =>
                            setSelectedIndex(
                              index
                            )
                          }
                          onClick={() =>
                            openItem(item)
                          }
                          className={`flex w-full items-center gap-3 px-4 py-3 text-left transition ${
                            selected
                              ? "bg-cyan-400/[0.08]"
                              : "hover:bg-white/[0.035]"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
                              selected
                                ? "border-cyan-400/20 bg-cyan-400/10 text-cyan-300"
                                : "border-white/[0.07] bg-white/[0.025] text-slate-500"
                            }`}
                          >
                            <Icon
                              size={18}
                            />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p
                              className={`truncate text-sm font-medium ${
                                selected
                                  ? "text-white"
                                  : "text-slate-300"
                              }`}
                            >
                              {item.title}
                            </p>

                            <p className="mt-0.5 truncate text-[11px] text-slate-600">
                              {item.subtitle}
                            </p>

                            <p className="mt-1 truncate text-[10px] text-slate-500">
                              {item.meta}
                            </p>
                          </div>

                          {selected && (
                            <CornerDownLeft
                              size={15}
                              className="shrink-0 text-cyan-400"
                            />
                          )}
                        </button>
                      );
                    }
                  )}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-white/[0.07] px-4 py-2.5 text-[10px] text-slate-600">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowUp size={11} />
                  <ArrowDown size={11} />
                  Navigate
                </span>

                <span className="flex items-center gap-1">
                  <CornerDownLeft
                    size={11}
                  />
                  Open
                </span>
              </div>

              <span>
                Esc to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}