"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Loader2,
  UserPlus,
} from "lucide-react";

import {
  allocateAsset,
  type AllocateAssetState,
} from "@/actions/assets";

type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  department: {
    name: string;
  } | null;
};

type AssetAllocationFormProps = {
  assetId: string;
  assetTag: string;
  model: string | null;
  employees: Employee[];
};

const initialState: AllocateAssetState = {
  success: false,
  message: "",
};

export function AssetAllocationForm({
  assetId,
  assetTag,
  model,
  employees,
}: AssetAllocationFormProps) {
  const router = useRouter();

  const allocateAssetWithId =
    allocateAsset.bind(null, assetId);

  const [state, formAction, pending] = useActionState(
    allocateAssetWithId,
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push(`/assets/${assetId}`);
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [state.success, assetId, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Success / Error */}
      {state.message && (
        <div
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            state.success
              ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
              : "border-red-400/20 bg-red-400/10 text-red-300"
          }`}
        >
          {state.success ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          )}

          <span>{state.message}</span>
        </div>
      )}

      {/* Asset summary */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <UserPlus className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-600">
              Asset
            </p>

            <h2 className="mt-1 text-lg font-medium text-white">
              {assetTag}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {model || "No model specified"}
            </p>
          </div>
        </div>
      </section>

      {/* Employee */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <SectionHeading
          number="01"
          title="Assign Employee"
          description="Select the employee who will take custody of this asset."
        />

        <div className="mt-6">
          <label
            htmlFor="employeeId"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            Employee
            <span className="ml-1 text-cyan-400">*</span>
          </label>

          <select
            id="employeeId"
            name="employeeId"
            required
            className={`h-12 w-full rounded-xl border bg-[#0a0d13] px-3.5 text-sm text-slate-300 outline-none transition focus:border-cyan-400/40 ${
              state.errors?.employeeId
                ? "border-red-400/40"
                : "border-white/10"
            }`}
          >
            <option value="">
              Select an employee
            </option>

            {employees.map((employee) => (
              <option
                key={employee.id}
                value={employee.id}
              >
                {employee.firstName} {employee.lastName} —{" "}
                {employee.employeeCode}
                {employee.department
                  ? ` · ${employee.department.name}`
                  : ""}
              </option>
            ))}
          </select>

          {state.errors?.employeeId?.[0] && (
            <p className="mt-1.5 text-xs text-red-400">
              {state.errors.employeeId[0]}
            </p>
          )}
        </div>
      </section>

      {/* Condition */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <SectionHeading
          number="02"
          title="Checkout Condition"
          description="Record the physical condition when the asset is issued."
        />

        <div className="mt-6">
          <label
            htmlFor="conditionAtCheckout"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            Condition
          </label>

          <select
            id="conditionAtCheckout"
            name="conditionAtCheckout"
            className="h-11 w-full rounded-xl border border-white/10 bg-[#0a0d13] px-3.5 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
          >
            <option value="">
              Select condition
            </option>
            <option value="EXCELLENT">
              Excellent
            </option>
            <option value="GOOD">
              Good
            </option>
            <option value="FAIR">
              Fair
            </option>
            <option value="DAMAGED">
              Damaged
            </option>
          </select>
        </div>
      </section>

      {/* Notes */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <SectionHeading
          number="03"
          title="Allocation Notes"
          description="Add optional information about this assignment."
        />

        <div className="mt-6">
          <label
            htmlFor="notes"
            className="mb-2 block text-xs font-medium text-slate-400"
          >
            Notes
          </label>

          <textarea
            id="notes"
            name="notes"
            rows={5}
            placeholder="Example: Issued with charger, carrying case and docking adapter."
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
          />
        </div>
      </section>

      {/* Lifecycle preview */}
      <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.035] p-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-300" />

          <p className="text-xs text-slate-400">
            This allocation will transition the asset from{" "}
            <span className="font-medium text-slate-200">
              Available
            </span>{" "}
            to{" "}
            <span className="font-medium text-cyan-300">
              Assigned
            </span>
            .
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() =>
            router.push(`/assets/${assetId}`)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending || state.success}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Assigning...
            </>
          ) : state.success ? (
            <>
              <Check className="h-4 w-4" />
              Assigned
            </>
          ) : (
            <>
              <UserPlus className="h-4 w-4" />
              Assign Asset
            </>
          )}
        </button>
      </div>
    </form>
  );
}

function SectionHeading({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-400/10 text-xs font-semibold text-cyan-300">
        {number}
      </div>

      <div>
        <h2 className="font-medium text-white">
          {title}
        </h2>

        <p className="mt-1 text-xs text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}