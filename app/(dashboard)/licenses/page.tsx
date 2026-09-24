import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Plus,
  Search,
  Users,
  XCircle,
} from "lucide-react";
import { LicenseStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  page?: string;
}>;

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatStatus(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusClasses(status: string) {
  switch (status) {
    case "ACTIVE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "EXPIRING":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "EXPIRED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    case "SUSPENDED":
      return "border-zinc-400/20 bg-zinc-400/10 text-zinc-300";

    default:
      return "border-white/10 bg-white/[0.03] text-zinc-300";
  }
}

function getUtilization(
  totalSeats: number,
  availableSeats: number
) {
  if (totalSeats <= 0) return 0;

  const usedSeats = Math.max(
    0,
    totalSeats - availableSeats
  );

  return Math.min(
    100,
    Math.round((usedSeats / totalSeats) * 100)
  );
}

export default async function LicensesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;

  const q = params.q?.trim() ?? "";
  const status = params.status ?? "";

  const currentPage = Math.max(
    1,
    Number.parseInt(params.page ?? "1", 10) || 1
  );

  const pageSize = 10;

 const validStatuses: LicenseStatus[] = [
  LicenseStatus.ACTIVE,
  LicenseStatus.EXPIRING,
  LicenseStatus.EXPIRED,
  LicenseStatus.SUSPENDED,
];

const selectedStatus = validStatuses.includes(
  status as LicenseStatus
)
  ? (status as LicenseStatus)
  : undefined;

const where = {
  ...(q
    ? {
        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
          {
            publisher: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
          {
            licenseKey: {
              contains: q,
              mode: "insensitive" as const,
            },
          },
        ],
      }
    : {}),

  ...(selectedStatus
    ? {
        status: selectedStatus,
      }
    : {}),
};

  const [
    licenses,
    totalLicenses,
    activeCount,
    expiringCount,
    expiredCount,
    suspendedCount,
  ] = await Promise.all([
    prisma.softwareLicense.findMany({
      where,

      orderBy: {
        name: "asc",
      },

      skip: (currentPage - 1) * pageSize,
      take: pageSize,

      include: {
        _count: {
          select: {
            assignments: true,
          },
        },
      },
    }),

    prisma.softwareLicense.count({
      where,
    }),

    prisma.softwareLicense.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.softwareLicense.count({
      where: {
        status: "EXPIRING",
      },
    }),

    prisma.softwareLicense.count({
      where: {
        status: "EXPIRED",
      },
    }),

    prisma.softwareLicense.count({
      where: {
        status: "SUSPENDED",
      },
    }),
  ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalLicenses / pageSize)
  );

  const safePage = Math.min(
    currentPage,
    totalPages
  );

  const createQuery = (
    overrides: Record<string, string | undefined>
  ) => {
    const query = new URLSearchParams();

    if (q) {
      query.set("q", q);
    }

    if (status) {
      query.set("status", status);
    }

    Object.entries(overrides).forEach(
      ([key, value]) => {
        if (value) {
          query.set(key, value);
        } else {
          query.delete(key);
        }
      }
    );

    return query.toString();
  };

  return (
    <div className="min-h-screen bg-[#05070b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                <KeyRound className="h-5 w-5 text-emerald-300" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                  Software Licenses
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Manage software licenses, seat allocation and
                  renewal lifecycle.
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/licenses/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Plus className="h-4 w-4" />
            Add License
          </Link>
        </div>

        {/* KPI cards */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Active
              </p>

              <div className="rounded-lg bg-emerald-400/10 p-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold">
              {activeCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Active licenses
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Expiring
              </p>

              <div className="rounded-lg bg-amber-400/10 p-2">
                <AlertTriangle className="h-4 w-4 text-amber-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold">
              {expiringCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Need renewal attention
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Expired
              </p>

              <div className="rounded-lg bg-red-400/10 p-2">
                <XCircle className="h-4 w-4 text-red-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold">
              {expiredCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              No longer valid
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">
                Suspended
              </p>

              <div className="rounded-lg bg-zinc-400/10 p-2">
                <KeyRound className="h-4 w-4 text-zinc-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold">
              {suspendedCount}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Currently suspended
            </p>
          </div>
        </section>

        {/* Filters */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-4">
          <form
            method="GET"
            className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_auto]"
          >
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />

              <input
                type="text"
                name="q"
                defaultValue={q}
                placeholder="Search license, publisher or key..."
                className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.03] pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-emerald-400/40 focus:bg-white/[0.05]"
              />
            </div>

            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded-xl border border-white/10 bg-[#0d121a] px-3 text-sm text-zinc-300 outline-none focus:border-emerald-400/40"
            >
              <option value="">
                All Statuses
              </option>

              <option value="ACTIVE">
                Active
              </option>

              <option value="EXPIRING">
                Expiring
              </option>

              <option value="EXPIRED">
                Expired
              </option>

              <option value="SUSPENDED">
                Suspended
              </option>
            </select>

            <button
              type="submit"
              className="h-11 rounded-xl border border-white/10 bg-white/[0.05] px-5 text-sm font-medium text-white transition hover:bg-white/[0.09]"
            >
              Apply Filters
            </button>
          </form>

          {(q || status) && (
            <div className="mt-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
              <p className="text-xs text-zinc-500">
                Showing filtered license results
              </p>

              <Link
                href="/licenses"
                className="text-xs font-medium text-zinc-400 hover:text-white"
              >
                Clear filters
              </Link>
            </div>
          )}
        </section>

        {/* Summary */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-zinc-400">
            {totalLicenses === 0
              ? "No licenses found"
              : `Showing ${
                  (safePage - 1) * pageSize + 1
                }–${Math.min(
                  safePage * pageSize,
                  totalLicenses
                )} of ${totalLicenses} licenses`}
          </p>

          <p className="text-xs text-zinc-500">
            {totalLicenses} total license
            {totalLicenses === 1 ? "" : "s"}
          </p>
        </div>

        {/* License table */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
          {licenses.length === 0 ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                <KeyRound className="h-6 w-6 text-zinc-500" />
              </div>

              <h2 className="mt-5 text-base font-semibold">
                No licenses found
              </h2>

              <p className="mt-2 max-w-md text-sm leading-6 text-zinc-500">
                Try changing your search or status filter, or create
                a new software license.
              </p>

              <Link
                href="/licenses/new"
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white hover:bg-white/[0.08]"
              >
                <Plus className="h-4 w-4" />
                Add License
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1150px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.015] text-left">
                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      License
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Publisher
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Seats
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Utilization
                    </th>

                    <th className="px-6 py-4 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Renewal
                    </th>

                    <th className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {licenses.map((license) => {
                    const usedSeats =
                      Math.max(
                        0,
                        license.totalSeats -
                          license.availableSeats
                      );

                    const utilization =
                      getUtilization(
                        license.totalSeats,
                        license.availableSeats
                      );

                    return (
                      <tr
                        key={license.id}
                        className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                      >
                        {/* License */}
                        <td className="px-6 py-4">
                          <Link
                            href={`/licenses/${license.id}`}
                            className="group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/10">
                                <KeyRound className="h-4 w-4 text-emerald-300" />
                              </div>

                              <div className="min-w-0">
                                <p className="truncate font-medium text-white group-hover:text-emerald-300">
                                  {license.name}
                                </p>

                                <p className="mt-1 max-w-[280px] truncate text-xs text-zinc-500">
                                  {license.licenseKey ??
                                    "No license key"}
                                </p>
                              </div>
                            </div>
                          </Link>
                        </td>

                        {/* Publisher */}
                        <td className="px-6 py-4 text-sm text-zinc-300">
                          {license.publisher ?? "—"}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                              license.status
                            )}`}
                          >
                            {license.status === "ACTIVE" && (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}

                            {license.status === "EXPIRING" && (
                              <AlertTriangle className="h-3.5 w-3.5" />
                            )}

                            {license.status === "EXPIRED" && (
                              <XCircle className="h-3.5 w-3.5" />
                            )}

                            {formatStatus(
                              license.status
                            )}
                          </span>
                        </td>

                        {/* Seats */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-zinc-600" />

                            <div>
                              <p className="text-sm font-medium text-white">
                                {usedSeats} /{" "}
                                {license.totalSeats}
                              </p>

                              <p className="text-xs text-zinc-500">
                                {license.availableSeats}{" "}
                                available
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Utilization */}
                        <td className="px-6 py-4">
                          <div className="w-[150px]">
                            <div className="mb-1 flex items-center justify-between">
                              <span className="text-xs text-zinc-500">
                                Usage
                              </span>

                              <span className="text-xs font-medium text-zinc-300">
                                {utilization}%
                              </span>
                            </div>

                            <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
                              <div
                                className="h-full rounded-full bg-emerald-400 transition-all"
                                style={{
                                  width: `${utilization}%`,
                                }}
                              />
                            </div>
                          </div>
                        </td>

                        {/* Renewal */}
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-sm text-zinc-300">
                            <CalendarDays className="h-4 w-4 text-zinc-600" />
                            {formatDate(
                              license.renewalDate
                            )}
                          </div>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/licenses/${license.id}`}
                            className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Pagination */}
        {totalLicenses > 0 && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-zinc-500">
              Page {safePage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link
                  href={`/licenses?${createQuery({
                    page: String(
                      safePage - 1
                    ),
                  })}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2 text-xs font-medium text-zinc-700">
                  <ChevronLeft className="h-3.5 w-3.5" />
                  Previous
                </span>
              )}

              <div className="flex items-center gap-1">
                {Array.from(
                  {
                    length: Math.min(
                      totalPages,
                      5
                    ),
                  },
                  (_, index) => {
                    let pageNumber =
                      index + 1;

                    if (
                      totalPages > 5 &&
                      safePage >= 4
                    ) {
                      pageNumber =
                        safePage - 2 + index;
                    }

                    if (
                      pageNumber > totalPages
                    ) {
                      pageNumber =
                        totalPages -
                        (4 - index);
                    }

                    return pageNumber;
                  }
                ).map((pageNumber) => (
                  <Link
                    key={pageNumber}
                    href={`/licenses?${createQuery(
                      {
                        page: String(
                          pageNumber
                        ),
                      }
                    )}`}
                    className={`flex h-9 min-w-9 items-center justify-center rounded-lg border px-2 text-xs font-medium transition ${
                      pageNumber === safePage
                        ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                        : "border-white/10 bg-white/[0.03] text-zinc-400 hover:bg-white/[0.07] hover:text-white"
                    }`}
                  >
                    {pageNumber}
                  </Link>
                ))}
              </div>

              {safePage < totalPages ? (
                <Link
                  href={`/licenses?${createQuery(
                    {
                      page: String(
                        safePage + 1
                      ),
                    }
                  )}`}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-zinc-300 transition hover:bg-white/[0.07] hover:text-white"
                >
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-2 text-xs font-medium text-zinc-700">
                  Next
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}