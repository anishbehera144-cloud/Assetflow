"use client";
import Link from "next/link";
import { useActionState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Boxes,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import {
  login,
  type LoginState,
} from "@/app/actions/auth";


const initialState: LoginState = {};

export default function LoginPage() {
  const [state, formAction, pending] =
    useActionState(login, initialState);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#05070b] px-4 text-white">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-[-180px] h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-cyan-500/[0.06] blur-[120px]" />

        <div className="absolute bottom-[-200px] right-[-100px] h-[450px] w-[450px] rounded-full bg-blue-500/[0.04] blur-[120px]" />

        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:48px_48px] opacity-30" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Brand */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/15 bg-cyan-400/[0.06] shadow-[0_0_40px_rgba(34,211,238,0.08)]">
            <Boxes
              size={25}
              className="text-cyan-400"
            />
          </div>

          <h1 className="text-2xl font-bold tracking-tight">
            ASSETFLOW
          </h1>

          <p className="mt-2 text-xs text-slate-500">
            Enterprise Asset Management
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl shadow-black/20 backdrop-blur-xl sm:p-8">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white">
              Welcome back
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Sign in to access your asset management workspace.
            </p>
          </div>

          {state.error && (
            <div className="mb-5 rounded-xl border border-red-400/15 bg-red-400/[0.06] px-4 py-3 text-xs text-red-300">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="you@company.com"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={15}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"
                />

                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="Enter your password"
                  className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/20 pl-10 pr-3 text-sm text-white outline-none transition placeholder:text-slate-700 focus:border-cyan-400/30 focus:ring-1 focus:ring-cyan-400/10"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={pending}
              className="group flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/[0.08] text-xs font-semibold text-cyan-300 transition hover:bg-cyan-400/[0.13] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? "Signing in..." : "Sign in"}

              {!pending && (
                <ArrowRight
                  size={14}
                  className="transition-transform group-hover:translate-x-0.5"
                />
              )}
            </button>
          </form>

          {/* Security indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 border-t border-white/[0.05] pt-5">
            <ShieldCheck
              size={13}
              className="text-emerald-400"
            />

            <span className="text-[10px] text-slate-600">
              Secure role-based access
            </span>
          </div>
        </div>
<div className="mt-4 text-center">
  <span>New user? </span>
  <Link
    href="/register"
    className="font-medium text-blue-600 hover:underline"
  >
    Create an account
  </Link>
</div>
        <p className="mt-6 text-center text-[10px] text-slate-700">
          ASSETFLOW Enterprise Asset Management
        </p>
      </motion.div>
    </main>
  );
}

