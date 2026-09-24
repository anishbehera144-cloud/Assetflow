"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, Send, Undo2 } from "lucide-react";
import Link from "next/link";

import {
  requestAssetReturn,
  type ReturnAssetState,
} from "@/actions/assets";

type AssetReturnFormProps = {
  assetId: string;
  assetTag: string;
  employeeName: string;
};

const initialState: ReturnAssetState = {
  success: false,
  message: "",
};

export function AssetReturnForm({
  assetId,
  assetTag,
  employeeName,
}: AssetReturnFormProps) {
  const router = useRouter();

  const [state, formAction, pending] = useActionState(
    requestAssetReturn.bind(null, assetId),
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
      {/* Request summary */}
      <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
            <Undo2 className="h-5 w-5 text-amber-300" />
          </div>

          <div>
            <p className="text-sm font-semibold text-white">
              Request asset return
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-400">
              Submit a return request for{" "}
              <span className="font-medium text-slate-200">
                {assetTag}
              </span>
              . The current assignee is{" "}
              <span className="font-medium text-slate-200">
                {employeeName}
              </span>
              .
            </p>
          </div>
        </div>
      </div>

      {/* Reason */}
      <div>
        <label
          htmlFor="reason"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Return reason <span className="text-amber-300">*</span>
        </label>

        <textarea
          id="reason"
          name="reason"
          required
          minLength={5}
          rows={4}
          placeholder="Example: Employee is returning the laptop after project completion."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/40 focus:bg-white/[0.045]"
        />

        {state.errors?.reason && (
          <p className="mt-2 text-xs text-red-400">
            {state.errors.reason[0]}
          </p>
        )}
      </div>

      {/* Condition */}
      <div>
        <label
          htmlFor="condition"
          className="mb-2 block text-sm font-medium text-slate-200"
        >
          Current asset condition
        </label>

        <select
          id="condition"
          name="condition"
          defaultValue=""
          className="w-full rounded-xl border border-white/10 bg-[#0b0f16] px-4 py-3 text-sm text-white outline-none transition focus:border-amber-400/40"
        >
          <option value="" disabled>
            Select condition
          </option>
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
          Additional notes
        </label>

        <textarea
          id="notes"
          name="notes"
          rows={4}
          placeholder="Add any additional information about the return..."
          className="w-full resize-none rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-amber-400/40 focus:bg-white/[0.045]"
        />
      </div>

      {/* Lifecycle preview */}
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Lifecycle transition
        </p>

        <div className="flex items-center gap-3">
          <div className="rounded-lg border border-cyan-400/20 bg-cyan-400/10 px-3 py-2 text-xs font-semibold text-cyan-300">
            ASSIGNED
          </div>

          <div className="h-px flex-1 bg-white/10" />

          <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 px-3 py-2 text-xs font-semibold text-amber-300">
            RETURN REQUESTED
          </div>
        </div>
      </div>

      {/* Server message */}
      {state.message && !state.success && (
        <div className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-300">
          {state.message}
        </div>
      )}

      {state.success && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.06] px-4 py-3 text-sm text-emerald-300">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>{state.message}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-white/10 pt-6">
        <Link
          href={`/assets/${assetId}`}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Cancel
        </Link>

        <button
          type="submit"
          disabled={pending || state.success}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-amber-300 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-4 w-4" />

          {pending ? "Submitting..." : "Submit Return Request"}
        </button>
      </div>
    </form>
  );
}