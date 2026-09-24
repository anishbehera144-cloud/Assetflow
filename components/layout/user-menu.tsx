"use client";

import { useState } from "react";
import {
  ChevronDown,
  LogOut,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { logout } from "@/app/actions/auth";

type UserMenuProps = {
  name: string;
  email: string;
  role: string;
};

const roleLabels: Record<string, string> = {
  ADMIN: "Administrator",
  IT_MANAGER: "IT Manager",
  IT_STAFF: "IT Staff",
  EMPLOYEE: "Employee",
  AUDITOR: "Auditor",
};

export function UserMenu({
  name,
  email,
  role,
}: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  async function handleLogout() {
    setLoggingOut(true);

    try {
      await logout();
    } finally {
      setLoggingOut(false);
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-white/[0.02] px-2 py-1.5 transition hover:border-white/[0.12] hover:bg-white/[0.04]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/15 bg-cyan-400/[0.06] text-[10px] font-bold text-cyan-300">
          {initials || "U"}
        </div>

        <div className="hidden text-left sm:block">
          <p className="max-w-[130px] truncate text-[11px] font-medium text-slate-200">
            {name}
          </p>

          <p className="text-[9px] uppercase tracking-[0.08em] text-slate-600">
            {roleLabels[role] ?? role}
          </p>
        </div>

        <ChevronDown
          size={13}
          className={`text-slate-600 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label="Close user menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />

          <div
            role="menu"
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-72 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f16] shadow-2xl shadow-black/40"
          >
            {/* User information */}
            <div className="border-b border-white/[0.06] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06] text-xs font-bold text-cyan-300">
                  {initials || "U"}
                </div>

                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-white">
                    {name}
                  </p>

                  <p className="mt-0.5 truncate text-[10px] text-slate-500">
                    {email}
                  </p>
                </div>
              </div>
            </div>

            {/* Account status */}
            <div className="border-b border-white/[0.06] p-3">
              <div className="flex items-center gap-3 rounded-xl bg-white/[0.025] px-3 py-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-400/10 bg-emerald-400/[0.04]">
                  <ShieldCheck
                    size={14}
                    className="text-emerald-400"
                  />
                </div>

                <div className="min-w-0">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-600">
                    Access level
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-slate-300">
                    {roleLabels[role] ?? role}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="p-2">
              <button
                type="button"
                disabled
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs text-slate-600"
              >
                <UserRound size={14} />
                Profile
                <span className="ml-auto text-[9px] uppercase tracking-wider">
                  Soon
                </span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                disabled={loggingOut}
                className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-medium text-red-300 transition hover:bg-red-400/[0.06] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <LogOut size={14} />

                {loggingOut
                  ? "Signing out..."
                  : "Sign out"}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}