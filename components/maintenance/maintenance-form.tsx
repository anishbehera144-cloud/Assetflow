"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  DollarSign,
  Wrench,
} from "lucide-react";

import { createMaintenanceRecord } from "@/actions/assets";

type AssetOption = {
  id: string;
  assetTag: string;
  manufacturer: string | null;
  model: string | null;
  status: string;
};

type MaintenanceFormProps = {
  assets: AssetOption[];
};

type FormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

const initialState: FormState = {
  success: false,
  message: "",
};

export function MaintenanceForm({
  assets,
}: MaintenanceFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    async (
      previousState: FormState,
      formData: FormData
    ) => {
      const assetId = String(
        formData.get("assetId") || ""
      );

      if (!assetId) {
        return {
          success: false,
          message: "Please select an asset.",
          errors: {
            assetId: ["Asset is required."],
          },
        };
      }

      const result = await createMaintenanceRecord(
        assetId,
        previousState,
        formData
      );

      return result;
    },
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push("/maintenance");
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Asset */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/20 bg-orange-400/10">
            <Wrench className="h-5 w-5 text-orange-300" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Asset Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the asset currently undergoing repair.
            </p>
          </div>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Asset
          </span>

          <select
            name="assetId"
            required
            defaultValue=""
            disabled={pending}
            className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition focus:border-orange-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="" disabled>
              Select an asset in repair
            </option>

            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.assetTag} —{" "}
                {asset.manufacturer || "Unknown"}{" "}
                {asset.model || ""}
              </option>
            ))}
          </select>

          {state.errors?.assetId && (
            <p className="mt-2 text-xs text-red-300">
              {state.errors.assetId[0]}
            </p>
          )}
        </label>

        <div className="mt-4 flex items-start gap-3 rounded-xl border border-orange-400/10 bg-orange-400/[0.04] p-4">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-orange-300" />

          <p className="text-xs leading-5 text-slate-400">
            Maintenance records can only be opened for assets whose
            lifecycle status is <span className="text-orange-300">IN REPAIR</span>.
          </p>
        </div>
      </section>

      {/* Issue */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5">
          <h2 className="font-semibold text-white">
            Issue Details
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Document the problem that requires servicing.
          </p>
        </div>

        <label className="block">
          <span className="mb-2 block text-sm font-medium text-slate-300">
            Issue Description
          </span>

          <textarea
            name="issueDescription"
            required
            minLength={5}
            maxLength={2000}
            rows={6}
            disabled={pending}
            placeholder="Describe the hardware failure, software issue, damage, or servicing requirement..."
            className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-slate-600 focus:border-orange-400/40 disabled:cursor-not-allowed disabled:opacity-50"
          />

          {state.errors?.issueDescription && (
            <p className="mt-2 text-xs text-red-300">
              {state.errors.issueDescription[0]}
            </p>
          )}
        </label>
      </section>

      {/* Service details */}
      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-5 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
            <Building2 className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <h2 className="font-semibold text-white">
              Service Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add the servicing vendor and estimated or recorded cost.
            </p>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Vendor
            </span>

            <input
              name="vendor"
              type="text"
              maxLength={150}
              disabled={pending}
              placeholder="e.g. Apple Authorized Service"
              className="h-12 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-slate-300">
              Maintenance Cost
            </span>

            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                name="cost"
                type="number"
                min="0"
                step="0.01"
                disabled={pending}
                placeholder="0.00"
                className="h-12 w-full rounded-xl border border-white/10 bg-black/20 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {state.errors?.cost && (
              <p className="mt-2 text-xs text-red-300">
                {state.errors.cost[0]}
              </p>
            )}
          </label>
        </div>
      </section>

      {/* Result */}
      {state.message && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 ${
            state.success
              ? "border-emerald-400/20 bg-emerald-400/10"
              : "border-red-400/20 bg-red-400/10"
          }`}
        >
          {state.success ? (
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
          ) : (
            <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />
          )}

          <div>
            <p
              className={`text-sm font-medium ${
                state.success
                  ? "text-emerald-300"
                  : "text-red-300"
              }`}
            >
              {state.message}
            </p>

            {state.success && (
              <p className="mt-1 text-xs text-slate-400">
                Redirecting you to maintenance records...
              </p>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 border-t border-white/10 pt-6 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => router.push("/maintenance")}
          disabled={pending}
          className="rounded-xl border border-white/10 px-5 py-3 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={pending || assets.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Wrench className="h-4 w-4" />

          {pending
            ? "Creating Record..."
            : "Create Maintenance Record"}
        </button>
      </div>

      {assets.length === 0 && (
        <p className="text-center text-xs text-slate-500">
          There are currently no eligible assets in repair.
        </p>
      )}
    </form>
  );
}