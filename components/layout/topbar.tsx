import {
  Plus,
  Menu,
} from "lucide-react";

import Link from "next/link";

import { getSession } from "@/lib/auth";
import { UserMenu } from "@/components/layout/user-menu";
import { NotificationCenter } from "@/components/layout/notification-center";
import { GlobalSearch } from "@/components/layout/global-search";

export async function Topbar() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 flex h-[76px] items-center border-b border-white/[0.08] bg-[#080b12]/90 px-4 backdrop-blur-xl sm:px-6 lg:ml-[260px] lg:px-8">
      {/* Mobile menu */}
      <button
        type="button"
        className="mr-3 flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] text-slate-400 transition hover:bg-white/[0.05] hover:text-white lg:hidden"
        aria-label="Open navigation"
      >
        <Menu size={19} />
      </button>

      {/* Global Search */}
      <GlobalSearch />

      <div className="ml-auto flex items-center gap-2">
        {/* Add Asset */}
        <Link
          href="/assets/new"
          className="hidden h-10 items-center gap-2 rounded-xl bg-cyan-400 px-4 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 sm:flex"
        >
          <Plus size={16} />
          Add Asset
        </Link>

        {/* Notifications */}
        <NotificationCenter />

        {/* Divider */}
        <div className="mx-1 hidden h-7 w-px bg-white/[0.08] sm:block" />

        {/* Authenticated User */}
        {session ? (
          <UserMenu
            name={session.name}
            email={session.email}
            role={session.role}
          />
        ) : (
          <Link
            href="/login"
            className="rounded-xl border border-white/[0.07] px-3 py-2 text-xs text-slate-400 transition hover:bg-white/[0.04] hover:text-white"
          >
            Sign in
          </Link>
        )}
      </div>
    </header>
  );
}