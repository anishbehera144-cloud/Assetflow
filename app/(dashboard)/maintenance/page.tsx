import Link from "next/link";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Wrench,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

type MaintenancePageProps = {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

function formatStatus(status: string) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  switch (status) {
    case "OPEN":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "IN_PROGRESS":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-300";

    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-slate-300";
  }
}

function formatCurrency(value: number | null) {
  if (value === null) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: Date | null) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value);
}

export default async function MaintenancePage({
  searchParams,
}: MaintenancePageProps) {
  const params = await searchParams;

  const query = params.q?.trim() || "";
  const status = params.status || "";
  const requestedPage = Number(params.page || "1");

  const currentPage =
    Number.isFinite(requestedPage) && requestedPage > 0
      ? requestedPage
      : 1;

  const where = {
    ...(status &&
      ["OPEN", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(status) && {
        status: status as
          | "OPEN"
          | "IN_PROGRESS"
          | "COMPLETED"
          | "CANCELLED",
      }),

    ...(query && {
      OR: [
        {
          issueDescription: {
            contains: query,
            mode: "insensitive" as const,
          },
        },
        {
          vendor: {
            contains: query,
            mode: "insensitive" as const,
          },
        },
        {
          asset: {
            assetTag: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
        },
        {
          asset: {
            model: {
              contains: query,
              mode: "insensitive" as const,
            },
          },
        },
      ],
    }),
  };

  const [
    totalRecords,
    openRecords,
    inProgressRecords,
    completedRecords,
    cancelledRecords,
    costAggregate,
  ] = await Promise.all([
    prisma.maintenanceRecord.count(),

    prisma.maintenanceRecord.count({
      where: {
        status: "OPEN",
      },
    }),

    prisma.maintenanceRecord.count({
      where: {
        status: "IN_PROGRESS",
      },
    }),

    prisma.maintenanceRecord.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.maintenanceRecord.count({
      where: {
        status: "CANCELLED",
      },
    }),

    prisma.maintenanceRecord.aggregate({
      _sum: {
        cost: true,
      },
    }),
  ]);

  const totalFilteredRecords =
    await prisma.maintenanceRecord.count({
      where,
    });

  const totalPages = Math.max(
    1,
    Math.ceil(totalFilteredRecords / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const maintenanceRecords =
    await prisma.maintenanceRecord.findMany({
      where,
      include: {
        asset: {
          include: {
            category: true,
            department: true,
          },
        },
      },
      orderBy: {
        startedAt: "desc",
      },
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });

  const totalCost = Number(
    costAggregate._sum.cost ?? 0
  );

  function buildPageUrl(page: number) {
    const search = new URLSearchParams();

    if (query) {
      search.set("q", query);
    }

    if (status) {
      search.set("status", status);
    }

    search.set("page", String(page));

    return `/maintenance?${search.toString()}`;
  }

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <Link
              href="/dashboard"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10">
                <Wrench className="h-5 w-5 text-orange-300" />
              </div>

              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-white">
                  Maintenance
                </h1>

                <p className="mt-1 text-sm text-slate-400">
                  Monitor repairs, servicing, vendors, costs, and asset
                  recovery.
                </p>
              </div>
            </div>
          </div>

         <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
         <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
                 <span className="font-medium text-white">
                    {totalFilteredRecords}
                 </span>{" "}
                 matching records
    </div>

            <Link
                 href="/maintenance/new"
                 className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
                 >
            <Wrench className="h-4 w-4" />
             New Maintenance
            </Link>
        </div>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Total Records
              </p>

              <Wrench className="h-4 w-4 text-slate-500" />
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {totalRecords}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              All maintenance history
            </p>
          </div>

          <div className="rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Open
              </p>

              <AlertCircle className="h-4 w-4 text-amber-300" />
            </div>

            <p className="mt-4 text-3xl font-semibold text-amber-300">
              {openRecords}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Awaiting service
            </p>
          </div>

          <div className="rounded-2xl border border-cyan-400/10 bg-cyan-400/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                In Progress
              </p>

              <Clock3 className="h-4 w-4 text-cyan-300" />
            </div>

            <p className="mt-4 text-3xl font-semibold text-cyan-300">
              {inProgressRecords}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Currently being serviced
            </p>
          </div>

          <div className="rounded-2xl border border-emerald-400/10 bg-emerald-400/[0.04] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Completed
              </p>

              <CheckCircle2 className="h-4 w-4 text-emerald-300" />
            </div>

            <p className="mt-4 text-3xl font-semibold text-emerald-300">
              {completedRecords}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Successfully resolved
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <p className="text-sm text-slate-400">
              Total Cost
            </p>

            <p className="mt-4 text-2xl font-semibold text-white">
              {formatCurrency(totalCost)}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Recorded maintenance spend
            </p>
          </div>
        </div>

        {/* Search / Filters */}
        <form
          method="GET"
          className="mb-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="flex-1">
              <input
                name="q"
                defaultValue={query}
                placeholder="Search asset tag, model, issue, or vendor..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            <button
              type="submit"
              className="h-11 rounded-xl bg-cyan-400 px-5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Search
            </button>

            {(query || status) && (
              <Link
                href="/maintenance"
                className="inline-flex h-11 items-center justify-center rounded-xl border border-white/10 px-5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
              >
                Clear
              </Link>
            )}
          </div>
        </form>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr className="text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-4 font-medium">
                    Asset
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Issue
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Vendor
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Cost
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Started
                  </th>

                  <th className="px-5 py-4 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {maintenanceRecords.map((record) => (
                  <tr
                    key={record.id}
                    className="transition hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/assets/${record.asset.id}`}
                        className="group"
                      >
                        <p className="font-medium text-white group-hover:text-cyan-300">
                          {record.asset.assetTag}
                        </p>

                        <p className="mt-1 text-xs text-slate-500">
                          {record.asset.manufacturer || "Unknown"}{" "}
                          {record.asset.model || ""}
                        </p>
                      </Link>
                    </td>

                    <td className="max-w-[360px] px-5 py-4">
                      <p className="truncate text-sm text-slate-300">
                        {record.issueDescription}
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        {record.asset.category.name}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {record.vendor || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-300">
                      {formatCurrency(
                        record.cost === null
                          ? null
                          : Number(record.cost)
                      )}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-400">
                      {formatDate(record.startedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${statusClasses(
                          record.status
                        )}`}
                      >
                        {formatStatus(record.status)}
                      </span>
                    </td>
                  </tr>
                ))}

                {maintenanceRecords.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex max-w-md flex-col items-center">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                          <Wrench className="h-5 w-5 text-slate-500" />
                        </div>

                        <h3 className="mt-4 text-sm font-semibold text-white">
                          No maintenance records found
                        </h3>

                        <p className="mt-2 text-sm text-slate-500">
                          Try changing your search or status filter.
                        </p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-white/10 px-5 py-4">
              <p className="text-sm text-slate-500">
                Page{" "}
                <span className="text-slate-300">
                  {safePage}
                </span>{" "}
                of{" "}
                <span className="text-slate-300">
                  {totalPages}
                </span>
              </p>

              <div className="flex gap-2">
                {safePage > 1 ? (
                  <Link
                    href={buildPageUrl(safePage - 1)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    Previous
                  </Link>
                ) : (
                  <span className="rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-700">
                    Previous
                  </span>
                )}

                {safePage < totalPages ? (
                  <Link
                    href={buildPageUrl(safePage + 1)}
                    className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-300 transition hover:bg-white/5"
                  >
                    Next
                  </Link>
                ) : (
                  <span className="rounded-lg border border-white/5 px-3 py-2 text-sm text-slate-700">
                    Next
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Cancelled summary */}
        {cancelledRecords > 0 && (
          <div className="mt-4 text-xs text-slate-600">
            {cancelledRecords} cancelled maintenance{" "}
            {cancelledRecords === 1 ? "record" : "records"} in total.
          </div>
        )}
      </div>
    </div>
  );
}