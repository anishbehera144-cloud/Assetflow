"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Loader2,
  Mail,
  Phone,
  Save,
  User,
} from "lucide-react";

import {
  createEmployee,
  type CreateEmployeeState,
} from "@/actions/assets";

type DepartmentOption = {
  id: string;
  name: string;
  code: string;
};

type EmployeeFormProps = {
  departments: DepartmentOption[];
};

const initialState: CreateEmployeeState = {
  success: false,
  message: "",
};

export function EmployeeForm({
  departments,
}: EmployeeFormProps) {
  const router = useRouter();

  const [state, action, pending] = useActionState(
    createEmployee,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const timer = window.setTimeout(() => {
        router.push("/employees");
        router.refresh();
      }, 700);

      return () => window.clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">

        {/* BACK */}
        <button
          type="button"
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
              <User className="h-5 w-5 text-blue-300" />
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                People
              </p>

              <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                New Employee
              </h1>
            </div>

          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-500">
            Add a new employee to the ASSETFLOW directory and
            associate them with their department.
          </p>
        </div>

        {/* SUCCESS */}
        {state.success && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.07] px-5 py-4">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />

            <div>
              <p className="font-medium text-emerald-200">
                Employee created successfully
              </p>

              <p className="mt-1 text-sm text-emerald-300/70">
                Redirecting to the employee directory...
              </p>
            </div>
          </div>
        )}

        {/* ERROR */}
        {!state.success && state.message && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-5 py-4 text-sm text-red-300">
            {state.message}
          </div>
        )}

        <form action={action} className="space-y-6">

          {/* BASIC INFORMATION */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-400/20 bg-blue-400/10">
                <User className="h-4 w-4 text-blue-300" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Basic Information
                </h2>

                <p className="text-xs text-slate-600">
                  Identity and employee directory details
                </p>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* EMPLOYEE CODE */}
              <div>
                <label
                  htmlFor="employeeCode"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Employee Code
                  <span className="ml-1 text-orange-300">*</span>
                </label>

                <input
                  id="employeeCode"
                  name="employeeCode"
                  required
                  placeholder="EMP-1007"
                  autoComplete="off"
                  className={`h-11 w-full rounded-xl border bg-black/20 px-4 text-sm text-white uppercase outline-none transition placeholder:text-slate-700 focus:ring-2 focus:ring-orange-400/10 ${
                    state.errors?.employeeCode
                      ? "border-red-400/40 focus:border-red-400/60"
                      : "border-white/10 focus:border-orange-400/50"
                  }`}
                />

                {state.errors?.employeeCode && (
                  <p className="mt-2 text-xs text-red-400">
                    {state.errors.employeeCode[0]}
                  </p>
                )}

                {!state.errors?.employeeCode && (
                  <p className="mt-2 text-xs text-slate-600">
                    A unique identifier such as EMP-1007.
                  </p>
                )}
              </div>

              {/* FIRST NAME */}
              <div>
                <label
                  htmlFor="firstName"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  First Name
                  <span className="ml-1 text-orange-300">*</span>
                </label>

                <input
                  id="firstName"
                  name="firstName"
                  required
                  placeholder="Rahul"
                  autoComplete="given-name"
                  className={`h-11 w-full rounded-xl border bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:ring-2 focus:ring-orange-400/10 ${
                    state.errors?.firstName
                      ? "border-red-400/40 focus:border-red-400/60"
                      : "border-white/10 focus:border-orange-400/50"
                  }`}
                />

                {state.errors?.firstName && (
                  <p className="mt-2 text-xs text-red-400">
                    {state.errors.firstName[0]}
                  </p>
                )}
              </div>

              {/* LAST NAME */}
              <div>
                <label
                  htmlFor="lastName"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Last Name
                  <span className="ml-1 text-orange-300">*</span>
                </label>

                <input
                  id="lastName"
                  name="lastName"
                  required
                  placeholder="Sharma"
                  autoComplete="family-name"
                  className={`h-11 w-full rounded-xl border bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:ring-2 focus:ring-orange-400/10 ${
                    state.errors?.lastName
                      ? "border-red-400/40 focus:border-red-400/60"
                      : "border-white/10 focus:border-orange-400/50"
                  }`}
                />

                {state.errors?.lastName && (
                  <p className="mt-2 text-xs text-red-400">
                    {state.errors.lastName[0]}
                  </p>
                )}
              </div>

              {/* JOB TITLE */}
              <div>
                <label
                  htmlFor="jobTitle"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Job Title
                </label>

                <input
                  id="jobTitle"
                  name="jobTitle"
                  placeholder="Software Engineer"
                  autoComplete="organization-title"
                  className={`h-11 w-full rounded-xl border bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:ring-2 focus:ring-orange-400/10 ${
                    state.errors?.jobTitle
                      ? "border-red-400/40 focus:border-red-400/60"
                      : "border-white/10 focus:border-orange-400/50"
                  }`}
                />

                {state.errors?.jobTitle && (
                  <p className="mt-2 text-xs text-red-400">
                    {state.errors.jobTitle[0]}
                  </p>
                )}
              </div>

            </div>
          </section>

          {/* CONTACT */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-purple-400/20 bg-purple-400/10">
                <Mail className="h-4 w-4 text-purple-300" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Contact Information
                </h2>

                <p className="text-xs text-slate-600">
                  Employee communication details
                </p>
              </div>

            </div>

            <div className="grid gap-5 sm:grid-cols-2">

              {/* EMAIL */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Work Email
                  <span className="ml-1 text-orange-300">*</span>
                </label>

                <div className="relative">
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    placeholder="rahul@company.com"
                    autoComplete="email"
                    className={`h-11 w-full rounded-xl border bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:ring-2 focus:ring-orange-400/10 ${
                      state.errors?.email
                        ? "border-red-400/40 focus:border-red-400/60"
                        : "border-white/10 focus:border-orange-400/50"
                    }`}
                  />
                </div>

                {state.errors?.email && (
                  <p className="mt-2 text-xs text-red-400">
                    {state.errors.email[0]}
                  </p>
                )}
              </div>

              {/* PHONE */}
              <div>
                <label
                  htmlFor="phone"
                  className="mb-2 block text-sm font-medium text-slate-200"
                >
                  Phone Number
                </label>

                <div className="relative">
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                    className={`h-11 w-full rounded-xl border bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-700 focus:ring-2 focus:ring-orange-400/10 ${
                      state.errors?.phone
                        ? "border-red-400/40 focus:border-red-400/60"
                        : "border-white/10 focus:border-orange-400/50"
                    }`}
                  />
                </div>

                {state.errors?.phone && (
                  <p className="mt-2 text-xs text-red-400">
                    {state.errors.phone[0]}
                  </p>
                )}
              </div>

            </div>
          </section>

          {/* ORGANIZATION */}
          <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-7">

            <div className="mb-6 flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10">
                <Building2 className="h-4 w-4 text-orange-300" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Organization
                </h2>

                <p className="text-xs text-slate-600">
                  Department assignment
                </p>
              </div>

            </div>

            <div>
              <label
                htmlFor="departmentId"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Department
              </label>

              <select
                id="departmentId"
                name="departmentId"
                defaultValue=""
                className={`h-11 w-full rounded-xl border bg-black/20 px-3 text-sm text-slate-200 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/10 ${
                  state.errors?.departmentId
                    ? "border-red-400/40"
                    : "border-white/10"
                }`}
              >
                <option value="">
                  No department assigned
                </option>

                {departments.map((department) => (
                  <option
                    key={department.id}
                    value={department.id}
                  >
                    {department.name} ({department.code})
                  </option>
                ))}
              </select>

              {state.errors?.departmentId && (
                <p className="mt-2 text-xs text-red-400">
                  {state.errors.departmentId[0]}
                </p>
              )}
            </div>
          </section>

          {/* ACTIONS */}
          <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">

            <button
              type="button"
              onClick={() => router.back()}
              disabled={pending}
              className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03] px-5 text-sm font-medium text-slate-300 transition hover:bg-white/[0.07] hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={pending || state.success}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-orange-400 px-6 text-sm font-semibold text-slate-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating Employee...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Create Employee
                </>
              )}
            </button>

          </div>

        </form>

        {/* INFO */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-blue-300" />

          <p className="text-xs leading-5 text-slate-600">
            Creating an employee only adds them to the asset
            directory. Portal authentication can be linked later
            through the user and role management workflow.
          </p>
        </div>

      </div>
    </div>
  );
}