"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Loader2,
  PlayCircle,
  Wrench,
} from "lucide-react";

import {
  cancelMaintenance,
  completeMaintenance,
  startMaintenance,
  type MaintenanceActionState,
} from "@/actions/assets";

type MaintenanceActionsProps = {
  maintenanceId: string;
  status: string;
};

const initialState: MaintenanceActionState = {
  success: false,
  message: "",
};

export function MaintenanceActions({
  maintenanceId,
  status,
}: MaintenanceActionsProps) {
  const router = useRouter();

  const [startState, startAction, startPending] = useActionState(
    startMaintenance.bind(null, maintenanceId),
    initialState
  );

  const [completeState, completeAction, completePending] =
    useActionState(
      completeMaintenance.bind(null, maintenanceId),
      initialState
    );

  const [cancelState, cancelAction, cancelPending] =
    useActionState(
      cancelMaintenance.bind(null, maintenanceId),
      initialState
    );

  useEffect(() => {
    if (
      startState.success ||
      completeState.success ||
      cancelState.success
    ) {
      router.refresh();
    }
  }, [
    startState.success,
    completeState.success,
    cancelState.success,
    router,
  ]);

  // -----------------------------------------
  // COMPLETED
  // -----------------------------------------

  if (status === "COMPLETED") {
    return (
      <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.06] p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-400" />

          <div>
            <p className="font-semibold text-white">
              Maintenance completed
            </p>

            <p className="mt-1 text-sm text-slate-400">
              The maintenance workflow has been completed and the
              asset is available again.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // CANCELLED
  // -----------------------------------------

  if (status === "CANCELLED") {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 text-red-300" />

          <div>
            <p className="font-semibold text-white">
              Maintenance cancelled
            </p>

            <p className="mt-1 text-sm text-slate-400">
              This maintenance record has been cancelled and the
              asset has been returned to available inventory.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // OPEN → IN PROGRESS / CANCELLED
  // -----------------------------------------

  if (status === "OPEN") {
    return (
      <div className="space-y-4">

        {/* OPEN STATUS INFORMATION */}
        <div className="rounded-2xl border border-orange-400/20 bg-orange-400/[0.05] p-5">
          <div className="flex items-start gap-3">
            <Wrench className="mt-0.5 h-5 w-5 text-orange-300" />

            <div>
              <p className="font-semibold text-white">
                Service has not started
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Start the service workflow when the technician
                begins working on the asset.
              </p>
            </div>
          </div>
        </div>

        {/* START SERVICE MESSAGE */}
        {startState.message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              startState.success
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border-red-400/20 bg-red-400/10 text-red-300"
            }`}
          >
            {startState.message}
          </div>
        )}

        {/* START SERVICE */}
        <form action={startAction}>
          <button
            type="submit"
            disabled={startPending || cancelPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {startPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Starting Service...
              </>
            ) : (
              <>
                <PlayCircle className="h-4 w-4" />
                Start Service
              </>
            )}
          </button>
        </form>

        {/* CANCEL MESSAGE */}
        {cancelState.message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              cancelState.success
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border-red-400/20 bg-red-400/10 text-red-300"
            }`}
          >
            {cancelState.message}
          </div>
        )}

        {/* CANCEL MAINTENANCE */}
        <div className="border-t border-white/10 pt-4">
          <form action={cancelAction}>
            <button
              type="submit"
              disabled={cancelPending || startPending}
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-5 py-3 text-sm font-semibold text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {cancelPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4" />
                  Cancel Maintenance
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // -----------------------------------------
  // IN PROGRESS → COMPLETED
  // -----------------------------------------

  if (status === "IN_PROGRESS") {
    return (
      <div className="space-y-4">

        {/* IN PROGRESS INFORMATION */}
        <div className="rounded-2xl border border-blue-400/20 bg-blue-400/[0.05] p-5">
          <div className="flex items-start gap-3">
            <Wrench className="mt-0.5 h-5 w-5 text-blue-300" />

            <div>
              <p className="font-semibold text-white">
                Service in progress
              </p>

              <p className="mt-1 text-sm text-slate-400">
                Add the final resolution notes before completing
                the maintenance workflow.
              </p>
            </div>
          </div>
        </div>

        {/* COMPLETE MESSAGE */}
        {completeState.message && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              completeState.success
                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-300"
                : "border-red-400/20 bg-red-400/10 text-red-300"
            }`}
          >
            {completeState.message}
          </div>
        )}

        {/* COMPLETE FORM */}
        <form
          action={completeAction}
          className="space-y-4"
        >
          <div>
            <label
              htmlFor="resolutionNotes"
              className="mb-2 block text-sm font-medium text-slate-200"
            >
              Resolution Notes
            </label>

            <textarea
              id="resolutionNotes"
              name="resolutionNotes"
              rows={5}
              required
              placeholder="Describe the work performed, parts replaced, tests completed, and final resolution..."
              className="w-full resize-none rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/10"
            />

            {completeState.errors?.resolutionNotes && (
              <p className="mt-2 text-xs text-red-400">
                {completeState.errors.resolutionNotes[0]}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={completePending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {completePending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Completing Maintenance...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Complete Maintenance
              </>
            )}
          </button>
        </form>
      </div>
    );
  }

  // -----------------------------------------
  // FALLBACK
  // -----------------------------------------

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-sm text-slate-400">
      No actions are available for this maintenance status.
    </div>
  );
}