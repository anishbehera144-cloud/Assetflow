import Link from "next/link";
import {
  Download,
  Filter,
  Package,
  Plus,
  Search,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 10;

function statusStyles(status: string) {
  switch (status) {
    case "ASSIGNED":
      return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";
    case "AVAILABLE":
      return "bg-cyan-400/10 text-cyan-400 border-cyan-400/20";
    case "IN_REPAIR":
      return "bg-amber-400/10 text-amber-400 border-amber-400/20";
    case "RETURN_REQUESTED":
      return "bg-violet-400/10 text-violet-400 border-violet-400/20";
    case "RETIRED":
      return "bg-slate-400/10 text-slate-400 border-slate-400/20";
    default:
      return "bg-white/5 text-slate-400 border-white/10";
  }
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatAssetType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

type SearchParams = {
  search?: string;
  status?: string;
  type?: string;
  department?: string;
  page?: string;
};

export default async function AssetsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const search = params.search?.trim() || "";
  const status = params.status || "";
  const type = params.type || "";
  const department = params.department || "";

  const currentPage = Math.max(
    1,
    Number.parseInt(params.page || "1", 10) || 1
  );

  const where = {
    ...(search
      ? {
          OR: [
            {
              assetTag: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              serialNumber: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              model: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              manufacturer: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              allocations: {
                some: {
                  status: "ACTIVE" as const,
                  employee: {
                    OR: [
                      {
                        firstName: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                      {
                        lastName: {
                          contains: search,
                          mode: "insensitive" as const,
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        }
      : {}),
    ...(status ? { status: status as any } : {}),
    ...(type ? { assetType: type as any } : {}),
    ...(department
      ? {
          department: {
            name: department,
          },
        }
      : {}),
  };

  const [assets, totalAssets, availableAssets, assignedAssets, repairAssets, departments] =
    await Promise.all([
      prisma.asset.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          category: true,
          department: true,
          allocations: {
            where: {
              status: "ACTIVE",
            },
            include: {
              employee: true,
            },
            take: 1,
          },
        },
        skip: (currentPage - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),

      prisma.asset.count(),

      prisma.asset.count({
        where: {
          status: "AVAILABLE",
        },
      }),

      prisma.asset.count({
        where: {
          status: "ASSIGNED",
        },
      }),

      prisma.asset.count({
        where: {
          status: "IN_REPAIR",
        },
      }),

      prisma.department.findMany({
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  const filteredCount = await prisma.asset.count({
    where,
  });

  const totalPages = Math.max(
    1,
    Math.ceil(filteredCount / PAGE_SIZE)
  );

  const safePage = Math.min(currentPage, totalPages);

  const buildUrl = (page: number) => {
    const query = new URLSearchParams();

    if (search) query.set("search", search);
    if (status) query.set("status", status);
    if (type) query.set("type", type);
    if (department) query.set("department", department);

    query.set("page", String(page));

    return `/assets?${query.toString()}`;
  };

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-cyan-400">
              <Package className="h-4 w-4" />
              Asset Management
            </div>

            <h1 className="text-3xl font-semibold tracking-tight text-white">
              Assets
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Track hardware, software, ownership and lifecycle state.
            </p>
          </div>

          <Link
            href="/assets/new"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Plus className="h-4 w-4" />
            Add Asset
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Assets"
            value={totalAssets}
            icon={<Package className="h-4 w-4" />}
          />

          <StatCard
            label="Available"
            value={availableAssets}
            icon={<span className="h-2 w-2 rounded-full bg-cyan-400" />}
          />

          <StatCard
            label="Assigned"
            value={assignedAssets}
            icon={<span className="h-2 w-2 rounded-full bg-emerald-400" />}
          />

          <StatCard
            label="In Repair"
            value={repairAssets}
            icon={<span className="h-2 w-2 rounded-full bg-amber-400" />}
          />
        </div>

        {/* Filters */}
        <form
          method="GET"
          className="mb-5 rounded-2xl border border-white/10 bg-white/[0.025] p-3"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px_200px_auto_auto]">

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                name="search"
                defaultValue={search}
                placeholder="Search tag, serial, model, employee..."
                className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-cyan-400/40"
              />
            </div>

            {/* Status */}
            <select
              name="status"
              defaultValue={status}
              className="h-10 rounded-xl border border-white/10 bg-[#0a0d13] px-3 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_REPAIR">In Repair</option>
              <option value="RETURN_REQUESTED">
                Return Requested
              </option>
              <option value="RETIRED">Retired</option>
            </select>

            {/* Type */}
            <select
              name="type"
              defaultValue={type}
              className="h-10 rounded-xl border border-white/10 bg-[#0a0d13] px-3 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
            >
              <option value="">All Types</option>
              <option value="LAPTOP">Laptop</option>
              <option value="DESKTOP">Desktop</option>
              <option value="MONITOR">Monitor</option>
              <option value="MOBILE">Mobile</option>
              <option value="TABLET">Tablet</option>
              <option value="PERIPHERAL">Peripheral</option>
              <option value="NETWORK_DEVICE">
                Network Device
              </option>
              <option value="SOFTWARE">Software</option>
              <option value="OTHER">Other</option>
            </select>

            {/* Department */}
            <select
              name="department"
              defaultValue={department}
              className="h-10 rounded-xl border border-white/10 bg-[#0a0d13] px-3 text-sm text-slate-300 outline-none focus:border-cyan-400/40"
            >
              <option value="">All Departments</option>

              {departments.map((dept) => (
                <option key={dept.id} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>

            <button
              type="submit"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-400/10 px-4 text-sm font-medium text-cyan-300 transition hover:bg-cyan-400/15"
            >
              <Filter className="h-4 w-4" />
              Filter
            </button>

            <Link
              href="/assets"
              className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 px-4 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
            >
              Clear
            </Link>
          </div>
        </form>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.025]">

          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <div>
              <h2 className="font-medium text-white">
                Asset Inventory
              </h2>

              <p className="mt-0.5 text-xs text-slate-500">
                Showing {assets.length} of {filteredCount} matching assets
              </p>
            </div>

            <button className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 transition hover:bg-white/5 hover:text-white">
              <Download className="h-3.5 w-3.5" />
              Export
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.02] text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Asset</th>
                  <th className="px-5 py-3 font-medium">Type</th>
                  <th className="px-5 py-3 font-medium">Serial</th>
                  <th className="px-5 py-3 font-medium">Assigned To</th>
                  <th className="px-5 py-3 font-medium">Department</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">
                {assets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <Package className="mx-auto mb-3 h-8 w-8 text-slate-600" />

                      <p className="text-sm text-slate-400">
                        No assets found.
                      </p>

                      <p className="mt-1 text-xs text-slate-600">
                        Try changing your filters or search query.
                      </p>
                    </td>
                  </tr>
                ) : (
                  assets.map((asset) => {
                    const allocation = asset.allocations[0];
                    const employee = allocation?.employee;

                    const employeeName = employee
                      ? `${employee.firstName} ${employee.lastName}`
                      : "—";

                    return (
                      <tr
                        key={asset.id}
                        className="group transition hover:bg-white/[0.025]"
                      >
                        <td className="px-5 py-4">
                          <Link
                            href={`/assets/${asset.id}`}
                            className="block"
                          >
                            <p className="font-medium text-white group-hover:text-cyan-300">
                              {asset.model || "Unnamed Asset"}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {asset.assetTag}
                              {asset.manufacturer
                                ? ` · ${asset.manufacturer}`
                                : ""}
                            </p>
                          </Link>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {formatAssetType(asset.assetType)}
                        </td>

                        <td className="px-5 py-4 font-mono text-xs text-slate-500">
                          {asset.serialNumber || "—"}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-300">
                          {employeeName}
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-400">
                          {asset.department?.name || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles(
                              asset.status
                            )}`}
                          >
                            {formatStatus(asset.status)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Page {safePage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              {safePage > 1 ? (
                <Link
                  href={buildUrl(safePage - 1)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  Previous
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border border-white/5 px-3 py-2 text-xs text-slate-700">
                  Previous
                </span>
              )}

              <span className="rounded-lg bg-cyan-400/10 px-3 py-2 text-xs font-medium text-cyan-300">
                {safePage}
              </span>

              {safePage < totalPages ? (
                <Link
                  href={buildUrl(safePage + 1)}
                  className="rounded-lg border border-white/10 px-3 py-2 text-xs text-slate-400 hover:bg-white/5 hover:text-white"
                >
                  Next
                </Link>
              ) : (
                <span className="cursor-not-allowed rounded-lg border border-white/5 px-3 py-2 text-xs text-slate-700">
                  Next
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs text-slate-500">{label}</span>

        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/5">
          {icon}
        </span>
      </div>

      <p className="text-2xl font-semibold tracking-tight text-white">
        {value.toLocaleString()}
      </p>
    </div>
  );
}
