"use client";

import {
  BarChart3,
  Boxes,
  Building2,
  FileKey2,
  Wrench,
} from "lucide-react";

type Props = {
  data: {
    assetSummary: {
      available: number;
      assigned: number;
      inRepair: number;
      returnRequested: number;
      retired: number;
    };

    licenseSummary: {
      active: number;
      expiring: number;
      expired: number;
    };

    assetsByCategory: {
      category: string;
      count: number;
    }[];

    employeesByDepartment: {
      department: string;
      count: number;
    }[];
  };
};

function BarRow({
  label,
  value,
  max,
}: {
  label: string;
  value: number;
  max: number;
}) {
  const percentage =
    max > 0
      ? Math.max(
          4,
          Math.round(
            (value / max) * 100
          )
        )
      : 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <span className="truncate text-xs text-slate-400">
          {label}
        </span>

        <span className="shrink-0 text-xs font-semibold text-white">
          {value}
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.05]">
        <div
          className="h-full rounded-full bg-cyan-400 transition-all duration-700"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>
    </div>
  );
}

export function ReportAnalytics({
  data,
}: Props) {
  const statusItems = [
    {
      label: "Available",
      value: data.assetSummary.available,
    },
    {
      label: "Assigned",
      value: data.assetSummary.assigned,
    },
    {
      label: "In Repair",
      value: data.assetSummary.inRepair,
    },
    {
      label: "Return Requested",
      value:
        data.assetSummary.returnRequested,
    },
    {
      label: "Retired",
      value: data.assetSummary.retired,
    },
  ];

  const maxStatus = Math.max(
    ...statusItems.map(
      (item) => item.value
    ),
    1
  );

  const maxCategory = Math.max(
    ...data.assetsByCategory.map(
      (item) => item.count
    ),
    1
  );

  const maxDepartment = Math.max(
    ...data.employeesByDepartment.map(
      (item) => item.count
    ),
    1
  );

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {/* Asset Status */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-400">
            <Boxes size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Asset Status
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Current lifecycle distribution
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {statusItems.map(
            (item) => (
              <BarRow
                key={item.label}
                label={item.label}
                value={item.value}
                max={maxStatus}
              />
            )
          )}
        </div>
      </section>

      {/* Asset Categories */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet-400/10 bg-violet-400/[0.06] text-violet-400">
            <BarChart3 size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Assets by Category
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Inventory distribution
            </p>
          </div>
        </div>

        {data.assetsByCategory.length ===
        0 ? (
          <p className="py-8 text-center text-xs text-slate-600">
            No category data available.
          </p>
        ) : (
          <div className="space-y-5">
            {data.assetsByCategory.map(
              (item) => (
                <BarRow
                  key={item.category}
                  label={item.category}
                  value={item.count}
                  max={maxCategory}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* Departments */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-emerald-400/10 bg-emerald-400/[0.06] text-emerald-400">
            <Building2 size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Employees by Department
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Workforce distribution
            </p>
          </div>
        </div>

        {data.employeesByDepartment
          .length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-600">
            No department data available.
          </p>
        ) : (
          <div className="space-y-5">
            {data.employeesByDepartment.map(
              (item) => (
                <BarRow
                  key={item.department}
                  label={item.department}
                  value={item.count}
                  max={maxDepartment}
                />
              )
            )}
          </div>
        )}
      </section>

      {/* License Summary */}
      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="mb-6 flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-amber-400/10 bg-amber-400/[0.06] text-amber-400">
            <FileKey2 size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              License Overview
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Software license status
            </p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-emerald-400/10 bg-emerald-400/[0.03] p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-600">
              Active
            </p>

            <p className="mt-2 text-2xl font-semibold text-emerald-400">
              {data.licenseSummary.active}
            </p>
          </div>

          <div className="rounded-xl border border-amber-400/10 bg-amber-400/[0.03] p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-600">
              Expiring
            </p>

            <p className="mt-2 text-2xl font-semibold text-amber-400">
              {data.licenseSummary.expiring}
            </p>
          </div>

          <div className="rounded-xl border border-red-400/10 bg-red-400/[0.03] p-4">
            <p className="text-[10px] uppercase tracking-[0.1em] text-slate-600">
              Expired
            </p>

            <p className="mt-2 text-2xl font-semibold text-red-400">
              {data.licenseSummary.expired}
            </p>
          </div>
        </div>
      </section>

      {/* Maintenance */}
      <section className="xl:col-span-2 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/10 bg-orange-400/[0.06] text-orange-400">
            <Wrench size={18} />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">
              Maintenance
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Maintenance records by status
            </p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            "OPEN",
            "IN_PROGRESS",
            "COMPLETED",
            "CANCELLED",
          ].map((status) => {
            const count =
              data.assetSummary;

            return (
              <div
                key={status}
                className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
              >
                <p className="text-[10px] uppercase tracking-[0.1em] text-slate-600">
                  {status.replace(
                    "_",
                    " "
                  )}
                </p>

                <p className="mt-2 text-2xl font-semibold text-white">
                  —
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}