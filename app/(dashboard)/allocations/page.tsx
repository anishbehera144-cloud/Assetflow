import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Package,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import { prisma } from "@/lib/prisma";

type SearchParams = {
  search?: string | string[];
};

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(value);
}

export default async function AllocationsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;

  const search = getParam(params.search).trim();

  const allocations = await prisma.allocation.findMany({
    where: {
      status: "ACTIVE",
      ...(search
        ? {
            OR: [
              {
                asset: {
                  assetTag: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                asset: {
                  serialNumber: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                asset: {
                  model: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                employee: {
                  firstName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                employee: {
                  lastName: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
              {
                employee: {
                  employeeCode: {
                    contains: search,
                    mode: "insensitive",
                  },
                },
              },
            ],
          }
        : {}),
    },
    include: {
      asset: {
        select: {
          id: true,
          assetTag: true,
          assetType: true,
          manufacturer: true,
          model: true,
          serialNumber: true,
          status: true,
        },
      },
      employee: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          employeeCode: true,
          department: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: {
      assignedAt: "desc",
    },
  });

  const totalAllocations = allocations.length;

  const uniqueEmployees = new Set(
    allocations.map((allocation) => allocation.employee.id)
  ).size;

  const uniqueAssets = new Set(
    allocations.map((allocation) => allocation.asset.id)
  ).size;

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-cyan-400">
              <CheckCircle2 size={16} />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                Asset Operations
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Allocations
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Track assets currently assigned to employees and review
              active custody records.
            </p>
          </div>

          <Link
            href="/assets"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
          >
            <Package size={15} />
            Manage Assets
          </Link>
        </div>

        {/* Stats */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Active Allocations"
            value={totalAllocations}
            icon={CheckCircle2}
          />

          <StatCard
            label="Assigned Assets"
            value={uniqueAssets}
            icon={Package}
          />

          <StatCard
            label="Employees With Assets"
            value={uniqueEmployees}
            icon={UserRound}
          />
        </div>

        {/* Search */}
        <form
          method="GET"
          className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
        >
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600"
            />

            <input
              type="search"
              name="search"
              defaultValue={search}
              placeholder="Search asset tag, serial number, model, employee..."
              className="h-11 w-full rounded-xl border border-white/[0.07] bg-black/20 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/30 focus:bg-white/[0.035]"
            />
          </div>
        </form>

        {/* Allocation table */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Current Asset Custody
              </h2>

              <p className="mt-1 text-[11px] text-slate-600">
                Only active allocations are displayed.
              </p>
            </div>

            <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-600">
              {totalAllocations}{" "}
              {totalAllocations === 1 ? "allocation" : "allocations"}
            </span>
          </div>

          {allocations.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <>
              {/* Desktop */}
              <div className="hidden overflow-x-auto lg:block">
                <table className="w-full min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                      <TableHeader>Asset</TableHeader>
                      <TableHeader>Employee</TableHeader>
                      <TableHeader>Department</TableHeader>
                      <TableHeader>Condition</TableHeader>
                      <TableHeader>Assigned</TableHeader>
                      <TableHeader>Action</TableHeader>
                    </tr>
                  </thead>

                  <tbody>
                    {allocations.map((allocation) => (
                      <AllocationRow
                        key={allocation.id}
                        allocation={allocation}
                      />
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile */}
              <div className="divide-y divide-white/[0.06] lg:hidden">
                {allocations.map((allocation) => (
                  <MobileAllocationCard
                    key={allocation.id}
                    allocation={allocation}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof CheckCircle2;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-400/15 bg-cyan-400/[0.06]">
          <Icon size={16} className="text-cyan-300" />
        </div>
      </div>

      <div className="text-2xl font-bold tracking-tight text-white">
        {value}
      </div>

      <div className="mt-1 text-xs text-slate-500">{label}</div>
    </div>
  );
}

function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
      {children}
    </th>
  );
}

function AllocationRow({
  allocation,
}: {
  allocation: {
    id: string;
    assignedAt: Date;
    conditionAtCheckout: string | null;
    notes: string | null;
    asset: {
      id: string;
      assetTag: string;
      assetType: string;
      manufacturer: string | null;
      model: string | null;
      serialNumber: string | null;
      status: string;
    };
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      employeeCode: string;
      department: {
        name: string;
      } | null;
    };
  };
}) {
  const employeeName =
    `${allocation.employee.firstName} ${allocation.employee.lastName}`.trim();

  return (
    <tr className="border-b border-white/[0.05] transition hover:bg-white/[0.02]">
      <td className="px-5 py-4">
        <Link
          href={`/assets/${allocation.asset.id}`}
          className="group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.06]">
              <Package size={15} className="text-blue-300" />
            </div>

            <div>
              <div className="text-xs font-semibold text-white transition group-hover:text-cyan-300">
                {allocation.asset.assetTag}
              </div>

              <div className="mt-0.5 text-[10px] text-slate-600">
                {allocation.asset.manufacturer || "Unknown"}{" "}
                {allocation.asset.model || "Unknown model"}
              </div>
            </div>
          </div>
        </Link>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 text-[10px] font-bold text-white">
            {allocation.employee.firstName.charAt(0)}
            {allocation.employee.lastName.charAt(0)}
          </div>

          <div>
            <div className="text-xs font-medium text-white">
              {employeeName}
            </div>

            <div className="mt-0.5 font-mono text-[10px] text-slate-600">
              {allocation.employee.employeeCode}
            </div>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        <span className="text-xs text-slate-400">
          {allocation.employee.department?.name || "Unassigned"}
        </span>
      </td>

      <td className="px-5 py-4">
        <span className="rounded-lg border border-white/[0.07] bg-white/[0.025] px-2.5 py-1 text-[10px] font-medium text-slate-400">
          {allocation.conditionAtCheckout || "Not recorded"}
        </span>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarDays size={13} />
          {formatDate(allocation.assignedAt)}
        </div>
      </td>

      <td className="px-5 py-4">
        <Link
          href={`/assets/${allocation.asset.id}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-[10px] font-semibold text-slate-400 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-cyan-300"
        >
          View Asset
          <ArrowRight size={12} />
        </Link>
      </td>
    </tr>
  );
}

function MobileAllocationCard({
  allocation,
}: {
  allocation: {
    id: string;
    assignedAt: Date;
    conditionAtCheckout: string | null;
    notes: string | null;
    asset: {
      id: string;
      assetTag: string;
      assetType: string;
      manufacturer: string | null;
      model: string | null;
      serialNumber: string | null;
      status: string;
    };
    employee: {
      id: string;
      firstName: string;
      lastName: string;
      employeeCode: string;
      department: {
        name: string;
      } | null;
    };
  };
}) {
  const employeeName =
    `${allocation.employee.firstName} ${allocation.employee.lastName}`.trim();

  return (
    <div className="p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-blue-400/15 bg-blue-400/[0.06]">
          <Package size={16} className="text-blue-300" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/assets/${allocation.asset.id}`}
              className="text-sm font-semibold text-white hover:text-cyan-300"
            >
              {allocation.asset.assetTag}
            </Link>

            <span className="rounded-full border border-blue-400/15 bg-blue-400/[0.06] px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wider text-blue-300">
              Assigned
            </span>
          </div>

          <p className="mt-1 text-xs text-slate-500">
            {allocation.asset.manufacturer || "Unknown"}{" "}
            {allocation.asset.model || "Unknown model"}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-slate-600">
                Employee
              </div>

              <div className="mt-1 text-xs text-slate-300">
                {employeeName}
              </div>

              <div className="mt-0.5 font-mono text-[10px] text-slate-600">
                {allocation.employee.employeeCode}
              </div>
            </div>

            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-slate-600">
                Department
              </div>

              <div className="mt-1 text-xs text-slate-300">
                {allocation.employee.department?.name ||
                  "Unassigned"}
              </div>
            </div>

            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-slate-600">
                Condition
              </div>

              <div className="mt-1 text-xs text-slate-300">
                {allocation.conditionAtCheckout ||
                  "Not recorded"}
              </div>
            </div>

            <div>
              <div className="text-[9px] font-medium uppercase tracking-[0.1em] text-slate-600">
                Assigned
              </div>

              <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">
                <CalendarDays size={12} />
                {formatDate(allocation.assignedAt)}
              </div>
            </div>
          </div>

          <Link
            href={`/assets/${allocation.asset.id}`}
            className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-semibold text-cyan-400 hover:text-cyan-300"
          >
            View Asset
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ search }: { search: string }) {
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Package size={19} className="text-slate-500" />
      </div>

      <h3 className="text-sm font-semibold text-white">
        No active allocations found
      </h3>

      <p className="mt-2 max-w-md text-xs leading-5 text-slate-500">
        {search
          ? "No active allocation matches your search."
          : "There are currently no assets assigned to employees."}
      </p>

      {search && (
        <Link
          href="/allocations"
          className="mt-4 text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          Clear search
        </Link>
      )}
    </div>
  );
}