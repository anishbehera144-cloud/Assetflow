import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  Package,
  User,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import { ProcessReturnForm } from "@/components/assets/process-return-form";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProcessReturnPage({
  params,
}: PageProps) {
  // Authenticate the current request and verify permission.
  // This MUST be inside the page function so cookies()
  // is executed within the Next.js request scope.
  await requirePermission("return.read");

  const { id } = await params;

  const returnRequest = await prisma.returnRequest.findUnique({
    where: {
      id,
    },
    include: {
      asset: {
        include: {
          category: true,
          department: true,
          location: true,
        },
      },
      employee: {
        include: {
          department: true,
        },
      },
    },
  });

  if (!returnRequest) {
    notFound();
  }

  if (returnRequest.status !== "PENDING") {
    redirect("/return-requests");
  }

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Back */}
        <Link
          href="/return-requests"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Return Requests
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-2">
              <Package className="h-5 w-5 text-cyan-300" />
            </div>

            <span className="text-sm font-medium uppercase tracking-[0.18em] text-cyan-300">
              Return Processing
            </span>
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Process Asset Return
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Review the return request, inspect the asset condition, and choose
            what should happen to the asset next.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
          {/* Request details */}
          <div className="space-y-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Return Request
                  </h2>

                  <p className="mt-1 text-sm text-slate-400">
                    Request submitted by the current asset holder.
                  </p>
                </div>

                <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1.5 text-xs font-medium text-amber-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-300" />
                  Pending
                </span>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {/* Asset */}
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Asset
                  </p>

                  <p className="mt-2 font-medium text-white">
                    {returnRequest.asset.assetTag}
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    {returnRequest.asset.manufacturer ||
                      "Unknown manufacturer"}{" "}
                    {returnRequest.asset.model || ""}
                  </p>
                </div>

                {/* Employee */}
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Employee
                  </p>

                  <div className="mt-2 flex items-center gap-2">
                    <User className="h-4 w-4 text-slate-400" />

                    <div>
                      <p className="font-medium text-white">
                        {returnRequest.employee.firstName}{" "}
                        {returnRequest.employee.lastName}
                      </p>

                      <p className="text-sm text-slate-400">
                        {returnRequest.employee.employeeCode}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Category */}
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Category
                  </p>

                  <p className="mt-2 font-medium text-white">
                    {returnRequest.asset.category.name}
                  </p>
                </div>

                {/* Current Status */}
                <div className="rounded-xl border border-white/10 bg-black/10 p-4">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Current Status
                  </p>

                  <p className="mt-2 font-medium text-amber-300">
                    {returnRequest.asset.status.replaceAll("_", " ")}
                  </p>
                </div>
              </div>
            </section>

            {/* Reason */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">
                Return Details
              </h2>

              <div className="mt-5 space-y-5">
                {/* Reason */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Reason
                  </p>

                  <div className="mt-2 rounded-xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-slate-300">
                    {returnRequest.reason}
                  </div>
                </div>

                {/* Condition */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Reported Condition
                  </p>

                  <div className="mt-2 rounded-xl border border-white/10 bg-black/10 p-4 text-sm text-slate-300">
                    {returnRequest.condition || "Not provided"}
                  </div>
                </div>

                {/* Notes */}
                {returnRequest.notes && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Notes
                    </p>

                    <div className="mt-2 rounded-xl border border-white/10 bg-black/10 p-4 text-sm leading-6 text-slate-300">
                      {returnRequest.notes}
                    </div>
                  </div>
                )}
              </div>
            </section>

            {/* Lifecycle */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="text-lg font-semibold text-white">
                Asset Lifecycle
              </h2>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {/* Assigned */}
                <div className="rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
                  <p className="text-xs text-slate-500">
                    Current
                  </p>

                  <p className="mt-1 text-sm font-semibold text-white">
                    Assigned
                  </p>
                </div>

                <div className="text-slate-600">
                  →
                </div>

                {/* Return Requested */}
                <div className="rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3">
                  <p className="text-xs text-amber-300/70">
                    Processing
                  </p>

                  <p className="mt-1 text-sm font-semibold text-amber-300">
                    Return Requested
                  </p>
                </div>

                <div className="text-slate-600">
                  →
                </div>

                {/* Destination options */}
                <div className="flex gap-3">
                  <div className="rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3">
                    <p className="text-xs text-emerald-300/70">
                      Option 1
                    </p>

                    <p className="mt-1 text-sm font-semibold text-emerald-300">
                      Available
                    </p>
                  </div>

                  <div className="rounded-xl border border-orange-400/20 bg-orange-400/10 px-4 py-3">
                    <p className="text-xs text-orange-300/70">
                      Option 2
                    </p>

                    <p className="mt-1 text-sm font-semibold text-orange-300">
                      In Repair
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Processing panel */}
          <div>
            <div className="sticky top-24 rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/10">
                  <CheckCircle2 className="h-5 w-5 text-cyan-300" />
                </div>

                <h2 className="text-lg font-semibold text-white">
                  Process Return
                </h2>

                <p className="mt-1 text-sm leading-6 text-slate-400">
                  Confirm the physical condition and select the next lifecycle
                  state for this asset.
                </p>
              </div>

              <ProcessReturnForm
                returnRequestId={returnRequest.id}
                assetId={returnRequest.assetId}
                reportedCondition={returnRequest.condition}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}