"use client";

import { useActionState, useEffect } from "react";
import { CheckCircle2, PackageCheck, Wrench } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  processAssetReturn,
  type ProcessReturnState,
} from "@/actions/assets";

type ProcessReturnFormProps = {
  returnRequestId: string;
  assetId: string;
  reportedCondition: string | null;
};

const initialState: ProcessReturnState = {
  success: false,
  message: "",
};

export function ProcessReturnForm({
  returnRequestId,
  assetId,
  reportedCondition,
}: ProcessReturnFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    processAssetReturn.bind(null, returnRequestId),
    initialState
  );

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push(`/assets/${assetId}`);
        router.refresh();
      }, 900);

      return () => clearTimeout(timer);
    }
  }, [state.success, assetId, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Destination */}
      <div>
        <label className="mb-3 block text-sm font-medium text-slate-200">
          Return destination
        </label>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="group cursor-pointer">
            <input
              type="radio"
              name="destination"
              value="AVAILABLE"
              defaultChecked
              className="peer sr-only"
            />

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition peer-checked:border-emerald-400/40 peer-checked:bg-emerald-400/[0.06] group-hover:bg-white/[0.04]">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                  <PackageCheck className="h-5 w-5 text-emerald-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    Available
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Asset is ready to return to inventory and be assigned
                    again.
                  </p>
                </div>
              </div>
            </div>
          </label>

          <label className="group cursor-pointer">
            <input
              type="radio"
              name="destination"
              value="IN_REPAIR"
              className="peer sr-only"
            />

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition peer-checked:border-orange-400/40 peer-checked:bg-orange-400/[0.06] group-hover:bg-white/[0.04]">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10">
                  <Wrench className="h-5 w-5 text-orange-300" />
                </div>

                <div>
                  <p className="text-sm font-semibold text-white">
                    In Repair
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Asset requires inspection or maintenance before reuse.
                  </p>
                </div>
              </div>
            </div>
          </label>
        </div>

        {state.errors?.destination && (
          <p className="mt-2 text-xs text-red-400">
            {state.errors.destination[0]}
          </p>
        )}
      </div>

      {/* Condition */}
      <div>
        <label
          htmlFor="conditionAtReturn"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Condition at return
        </label>

        <select
          id="conditionAtReturn"
          name="conditionAtReturn"
          defaultValue={reportedCondition ?? ""}
          className="w-full rounded-xl border border-white/10 bg-[#0b0f16] px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-400/40"
        >
          <option value="">Select condition</option>
          <option value="EXCELLENT">Excellent</option>
          <option value="GOOD">Good</option>
          <option value="FAIR">Fair</option>
          <option value="DAMAGED">Damaged</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label
          htmlFor="notes"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Processing notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Add inspection results, handover notes, or repair instructions..."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-cyan-400/40 focus:bg-white/[0.045]"
        />
      </div>

      {/* Message */}
      {state.message && !state.success && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
          {state.message}
        </div>
      )}

      {state.success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          {state.message}
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end border-t border-white/10 pt-6">
        <button
          type="submit"
          disabled={pending || state.success}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <CheckCircle2 className="h-4 w-4" />

          {pending ? "Processing..." : "Complete Return"}
        </button>
      </div>
    </form>
  );
}