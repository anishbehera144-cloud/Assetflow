import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  RotateCcw,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getStatusStyles(status: string) {
  switch (status) {
    case "PENDING":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "PROCESSED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "REJECTED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "APPROVED":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

export default async function ReturnRequestsPage() {
  const requests = await prisma.returnRequest.findMany({
    orderBy: {
      requestedAt: "desc",
    },
    include: {
      asset: {
        include: {
          category: true,
        },
      },
      employee: {
        include: {
          department: true,
        },
      },
    },
  });

  const pendingCount = requests.filter(
    (request) => request.status === "PENDING"
  ).length;

  const processedCount = requests.filter(
    (request) => request.status === "PROCESSED"
  ).length;

  const repairCount = requests.filter(
    (request) =>
      request.status === "PROCESSED" &&
      request.asset.status === "IN_REPAIR"
  ).length;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-amber-400/20 bg-amber-400/10">
                <RotateCcw className="h-5 w-5 text-amber-300" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/80">
                  Asset Lifecycle
                </p>

                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Return Requests
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-400">
              Review employee return requests and process assets back into
              inventory or maintenance.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Total Requests</p>

              <RotateCcw className="h-5 w-5 text-slate-500" />
            </div>

            <p className="mt-3 text-3xl font-semibold text-white">
              {requests.length}
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Pending</p>

              <Clock3 className="h-5 w-5 text-amber-300" />
            </div>

            <p className="mt-3 text-3xl font-semibold text-amber-300">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/20 bg-emerald-400/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Processed</p>

              <CheckCircle2 className="h-5 w-5 text-emerald-300" />
            </div>

            <p className="mt-3 text-3xl font-semibold text-emerald-300">
              {processedCount}
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">Sent to Repair</p>

              <Wrench className="h-5 w-5 text-cyan-300" />
            </div>

            <p className="mt-3 text-3xl font-semibold text-cyan-300">
              {repairCount}
            </p>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="text-sm font-semibold text-white">
              Return Request Queue
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Process pending requests and review completed returns.
            </p>
          </div>

          {requests.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <RotateCcw className="mx-auto h-10 w-10 text-slate-600" />

              <h3 className="mt-4 text-sm font-semibold text-white">
                No return requests
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                Return requests will appear here when employees submit them.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1100px] text-left">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02]">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Asset
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Employee
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Reason
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Condition
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Requested
                    </th>

                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Status
                    </th>

                    <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {requests.map((request) => {
                    const employeeName =
                      `${request.employee.firstName} ${request.employee.lastName}`.trim();

                    return (
                      <tr
                        key={request.id}
                        className="border-b border-white/[0.06] transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/assets/${request.asset.id}`}
                            className="group"
                          >
                            <p className="text-sm font-semibold text-white group-hover:text-cyan-300">
                              {request.asset.assetTag}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {request.asset.model || request.asset.assetType}
                            </p>
                          </Link>
                        </td>

                        <td className="px-5 py-4">
                          <p className="text-sm font-medium text-slate-200">
                            {employeeName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            {request.employee.department?.name || "No department"}
                          </p>
                        </td>

                        <td className="max-w-[260px] px-5 py-4">
                          <p className="truncate text-sm text-slate-300">
                            {request.reason}
                          </p>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-300">
                            {request.condition || "—"}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="text-sm text-slate-400">
                            {formatDate(request.requestedAt)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${getStatusStyles(
                              request.status
                            )}`}
                          >
                            {request.status.replaceAll("_", " ")}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          {request.status === "PENDING" ? (
                            <Link
                              href={`/return-requests/${request.id}`}
                              className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-3.5 py-2 text-xs font-semibold text-slate-950 transition hover:bg-amber-300"
                            >
                              Process
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          ) : (
                            <Link
                              href={`/assets/${request.asset.id}`}
                              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3.5 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/5 hover:text-white"
                            >
                              View Asset
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}