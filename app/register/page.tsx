"use client";

import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Mail,
  Phone,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { useActionState, useEffect, useState } from "react";

import {
  registerEmployee,
  type RegisterState,
} from "@/app/actions/auth";

const initialState: RegisterState = {
  success: false,
  message: "",
};

type Department = {
  id: string;
  name: string;
};

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState(
    registerEmployee,
    initialState
  );

  const [departments, setDepartments] = useState<
    Department[]
  >([]);

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  useEffect(() => {
    fetch("/api/departments")
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setDepartments(data);
        }
      })
      .catch((error) => {
        console.error(
          "Failed to load departments:",
          error
        );
      });
  }, []);

  if (state.success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#05070b] px-4 py-10 text-white">
        <div className="w-full max-w-md rounded-3xl border border-white/[0.08] bg-white/[0.025] p-8 text-center shadow-2xl shadow-black/30">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-400/20 bg-emerald-400/10">
            <CheckCircle2
              size={30}
              className="text-emerald-400"
            />
          </div>

          <h1 className="mt-6 text-2xl font-semibold">
            Account created
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Your ASSETFLOW employee account has been
            created successfully.
          </p>

          <p className="mt-2 text-xs text-slate-600">
            You can now sign in using your registered
            email address and password.
          </p>

          <Link
            href="/login"
            className="mt-7 inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            Continue to Sign In
            <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#05070b] px-4 py-8 text-white sm:px-6">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* BRAND PANEL */}
        <section className="hidden lg:block">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/10 bg-cyan-400/[0.04] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
              ASSETFLOW
            </span>
          </div>

          <h1 className="max-w-xl text-5xl font-bold tracking-tight">
            Join the
            <span className="text-cyan-400">
              {" "}
              enterprise
            </span>
            asset platform.
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-500">
            Create your employee account and access
            ASSETFLOW for asset custody, return requests,
            licenses, notifications, and operational
            workflows.
          </p>

          <div className="mt-8 space-y-3">
            <Feature
              icon={ShieldCheck}
              text="Secure role-based access"
            />

            <Feature
              icon={KeyRound}
              text="Protected employee authentication"
            />

            <Feature
              icon={Building2}
              text="Connected to your organization"
            />
          </div>
        </section>

        {/* FORM */}
        <section className="mx-auto w-full max-w-xl rounded-3xl border border-white/[0.08] bg-white/[0.025] p-6 shadow-2xl shadow-black/30 sm:p-8">
          <div className="mb-8">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.05]">
              <UserRound
                size={19}
                className="text-cyan-400"
              />
            </div>

            <h2 className="text-2xl font-semibold">
              Create employee account
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Register your employee identity to access
              ASSETFLOW.
            </p>
          </div>

          {state.message && !state.success && (
            <div className="mb-6 rounded-xl border border-red-400/15 bg-red-400/[0.05] px-4 py-3 text-xs text-red-300">
              {state.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* NAME */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First name"
                name="firstName"
                placeholder="Anish"
                error={state.errors?.firstName?.[0]}
              />

              <Field
                label="Last name"
                name="lastName"
                placeholder="Kumar"
                error={state.errors?.lastName?.[0]}
              />
            </div>

            {/* EMPLOYEE ID + EMAIL */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Employee ID"
                name="employeeCode"
                placeholder="EMP-1007"
                error={state.errors?.employeeCode?.[0]}
              />

              <Field
                label="Email"
                name="email"
                type="email"
                placeholder="employee@company.com"
                error={state.errors?.email?.[0]}
              />
            </div>

            {/* PHONE + JOB */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Phone"
                name="phone"
                type="tel"
                placeholder="+91 9876543210"
              />

              <Field
                label="Job title"
                name="jobTitle"
                placeholder="Software Engineer"
              />
            </div>

            {/* DEPARTMENT */}
            <div>
              <label
                htmlFor="departmentId"
                className="mb-2 block text-xs font-medium text-slate-300"
              >
                Department
              </label>

              <select
                id="departmentId"
                name="departmentId"
                defaultValue=""
                className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 text-sm text-slate-200 outline-none transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
              >
                <option value="" disabled>
                  Select department
                </option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                    className="bg-[#0b111b]"
                  >
                    {department.name}
                  </option>
                ))}
              </select>

              {state.errors?.departmentId?.[0] && (
                <p className="mt-1.5 text-[11px] text-red-400">
                  {state.errors.departmentId[0]}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <PasswordField
              label="Password"
              name="password"
              valueVisible={showPassword}
              onToggle={() =>
                setShowPassword((value) => !value)
              }
              error={state.errors?.password?.[0]}
            />

            {/* CONFIRM PASSWORD */}
            <PasswordField
              label="Confirm password"
              name="confirmPassword"
              valueVisible={showConfirmPassword}
              onToggle={() =>
                setShowConfirmPassword((value) => !value)
              }
              error={
                state.errors?.confirmPassword?.[0]
              }
            />

            {/* ROLE INFO */}
            <div className="rounded-xl border border-cyan-400/10 bg-cyan-400/[0.035] px-4 py-3">
              <div className="flex items-start gap-3">
                <ShieldCheck
                  size={16}
                  className="mt-0.5 shrink-0 text-cyan-400"
                />

                <div>
                  <p className="text-xs font-medium text-cyan-200">
                    Employee access
                  </p>

                  <p className="mt-1 text-[11px] leading-5 text-slate-500">
                    New registrations receive standard
                    employee access. Administrative roles
                    are managed by authorized administrators.
                  </p>
                </div>
              </div>
            </div>

            {/* SUBMIT */}
            <button
              type="submit"
              disabled={pending}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending
                ? "Creating account..."
                : "Create Employee Account"}

              {!pending && <ArrowRight size={16} />}
            </button>
          </form>

          <div className="mt-7 border-t border-white/[0.06] pt-6 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?
            </p>

            <Link
              href="/login"
              className="mt-1 inline-block text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
            >
              Sign in to ASSETFLOW
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function Feature({
  icon: Icon,
  text,
}: {
  icon: typeof ShieldCheck;
  text: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <Icon size={15} className="text-cyan-400" />
      </div>

      <span className="text-xs text-slate-400">
        {text}
      </span>
    </div>
  );
}

function Field({
  label,
  name,
  placeholder,
  type = "text",
  error,
}: {
  label: string;
  name: string;
  placeholder: string;
  type?: string;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-medium text-slate-300"
      >
        {label}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
      />

      {error && (
        <p className="mt-1.5 text-[11px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}

function PasswordField({
  label,
  name,
  valueVisible,
  onToggle,
  error,
}: {
  label: string;
  name: string;
  valueVisible: boolean;
  onToggle: () => void;
  error?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-xs font-medium text-slate-300"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={valueVisible ? "text" : "password"}
          placeholder="••••••••"
          className="h-11 w-full rounded-xl border border-white/[0.08] bg-black/30 px-3 pr-11 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/10"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-slate-600 transition hover:text-slate-300"
          aria-label={
            valueVisible
              ? "Hide password"
              : "Show password"
          }
        >
          {valueVisible ? (
            <EyeOff size={16} />
          ) : (
            <Eye size={16} />
          )}
        </button>
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}