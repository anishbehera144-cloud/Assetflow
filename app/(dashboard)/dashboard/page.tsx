import Link from "next/link";
import { AssetAnalytics } from "@/components/dashboard/asset-analytics";
import {
  Package,
  CheckCircle2,
  Wrench,
  RotateCcw,
  Archive,
  Users,
  KeyRound,
  ArrowUpRight,
  MoreHorizontal,
} from "lucide-react";
import {
  MotionDiv,
  MotionSection,
  MotionMain,
  MotionArticle,
  MotionButton,
  MotionSpan,
  MotionP,
  MotionH1,
  MotionH2,
} from "@/components/ui/motion";

import { getDashboardData } from "@/lib/dashboard-data";
import { prisma } from "@/lib/prisma";

function formatAssetStatus(status: string) {
  switch (status) {
    case "ASSIGNED":
      return "Assigned";

    case "IN_REPAIR":
      return "In Repair";

    case "RETURN_REQUESTED":
      return "Return Requested";

    case "AVAILABLE":
      return "Available";

    case "RETIRED":
      return "Retired";

    default:
      return status;
  }
}

function getStatusClasses(status: string) {
  switch (status) {
    case "ASSIGNED":
      return "bg-emerald-400/10 text-emerald-400";

    case "IN_REPAIR":
      return "bg-amber-400/10 text-amber-400";

    case "RETURN_REQUESTED":
      return "bg-orange-400/10 text-orange-400";

    case "AVAILABLE":
      return "bg-cyan-400/10 text-cyan-400";

    case "RETIRED":
      return "bg-slate-400/10 text-slate-400";

    default:
      return "bg-white/10 text-white/60";
  }
}

export default async function DashboardPage() {
  const [dashboardData, recentAssets] =
    await Promise.all([
      getDashboardData(),

      prisma.asset.findMany({
        orderBy: {
          updatedAt: "desc",
        },
        take: 4,
        include: {
          department: true,
          allocations: {
            where: {
              status: "ACTIVE",
            },
            include: {
              employee: true,
            },
            orderBy: {
              assignedAt: "desc",
            },
            take: 1,
          },
        },
      }),
    ]);

  const stats = [
    {
      label: "Total Assets",
      value: dashboardData.assets.total.toLocaleString(),
      icon: Package,
      description: "All registered assets",
    },
    {
      label: "Assigned Assets",
      value: dashboardData.assets.assigned.toLocaleString(),
      icon: CheckCircle2,
      description: "Currently assigned",
    },
    {
      label: "In Repair",
      value: dashboardData.assets.repair.toLocaleString(),
      icon: Wrench,
      description: "Currently under repair",
    },
    {
      label: "Return Requests",
      value:
        dashboardData.assets.returnRequests.toLocaleString(),
      icon: RotateCcw,
      description: "Pending return requests",
    },
  ];

  const lifecycleItems = [
    {
      label: "Available",
      value: dashboardData.assets.available,
    },
    {
      label: "Assigned",
      value: dashboardData.assets.assigned,
    },
    {
      label: "Repair",
      value: dashboardData.assets.repair,
    },
    {
      label: "Return",
      value: dashboardData.assets.returnRequests,
    },
    {
      label: "Retired",
      value: dashboardData.assets.retired,
    },
  ];

  const totalLifecycleAssets =
    dashboardData.assets.total;

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">

        {/* Header */}
        <MotionDiv
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="mb-2 flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]" />

            <span className="text-xs font-medium uppercase tracking-[0.2em] text-cyan-400">
              Command Center
            </span>
          </div>

          <h1 className="text-3xl font-bold tracking-[-0.03em] text-white sm:text-4xl">
            Asset Intelligence
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Monitor your organization's complete asset lifecycle.
          </p>
        </MotionDiv>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;

            return (
              <MotionDiv
                key={stat.label}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.45,
                  delay: index * 0.08,
                }}
                whileHover={{ y: -3 }}
                className="group relative overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition-colors hover:border-cyan-400/20"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-400/[0.04] blur-2xl transition group-hover:bg-cyan-400/[0.08]" />

                <div className="relative">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400/[0.08] text-cyan-400">
                      <Icon size={19} />
                    </div>

                    <button
                      type="button"
                      aria-label={`${stat.label} options`}
                      className="text-slate-700 transition hover:text-slate-400"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>

                  <p className="mt-5 text-sm text-slate-500">
                    {stat.label}
                  </p>

                  <div className="mt-1 flex items-end justify-between">
                    <p className="text-3xl font-semibold tracking-tight text-white">
                      {stat.value}
                    </p>

                    <span className="rounded-full bg-cyan-400/10 px-2 py-1 text-[10px] font-medium text-cyan-400">
                      Live
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-slate-600">
                    {stat.description}
                  </p>
                </div>
              </MotionDiv>
            );
          })}
        </div>

        {/* Main Analytics */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1.6fr_1fr]">

          {/* Lifecycle Overview */}
          <MotionSection
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.35,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Asset Lifecycle
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Current asset distribution
                </p>
              </div>

              <div className="rounded-lg border border-white/[0.07] px-3 py-1.5 text-xs text-slate-400">
                Live Data
              </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-6 sm:grid-cols-5">
              {lifecycleItems.map(
                (item, index) => {
                  const percentage =
                    totalLifecycleAssets > 0
                      ? Math.round(
                          (item.value /
                            totalLifecycleAssets) *
                            100
                        )
                      : 0;

                  return (
                    <div
                      key={item.label}
                      className="text-center"
                    >
                      <div className="relative mx-auto flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-cyan-400/10">
                        <div
                          className="absolute inset-[-10px] rounded-full border-[10px] border-transparent border-t-cyan-400 border-r-cyan-400/60"
                          style={{
                            transform: `rotate(${
                              -35 + index * 18
                            }deg)`,
                          }}
                        />

                        <div>
                          <div className="text-lg font-bold text-white">
                            {item.value.toLocaleString()}
                          </div>

                          <div className="text-[9px] text-slate-600">
                            {percentage}%
                          </div>
                        </div>
                      </div>

                      <p className="mt-3 text-[11px] text-slate-500">
                        {item.label}
                      </p>
                    </div>
                  );
                }
              )}
            </div>
          </MotionSection>

          {/* Quick Actions */}
          <MotionSection
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.42,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6"
          >
            <h2 className="text-sm font-semibold text-white">
              Quick Actions
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Common asset operations
            </p>

            <div className="mt-5 grid gap-2">

              <Link
                href="/assets/new"
                className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div>
                  <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Add New Asset
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Register hardware or software
                  </p>
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-slate-700 transition group-hover:text-cyan-400"
                />
              </Link>

              <Link
                href="/assets"
                className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div>
                  <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Assign Asset
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Find an available asset to assign
                  </p>
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-slate-700 transition group-hover:text-cyan-400"
                />
              </Link>

              <Link
                href="/return-requests"
                className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div>
                  <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Create Return Request
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Start an asset return workflow
                  </p>
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-slate-700 transition group-hover:text-cyan-400"
                />
              </Link>

              <Link
                href="/maintenance"
                className="group flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.02] p-3 text-left transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.03]"
              >
                <div>
                  <p className="text-xs font-medium text-slate-300 group-hover:text-white">
                    Log Maintenance
                  </p>

                  <p className="mt-1 text-[10px] text-slate-600">
                    Record a service event
                  </p>
                </div>

                <ArrowUpRight
                  size={15}
                  className="text-slate-700 transition group-hover:text-cyan-400"
                />
              </Link>

            </div>
          </MotionSection>
        </div>
        <AssetAnalytics
          categories={dashboardData.analytics.categories}
          departments={dashboardData.analytics.departments}
        />

        {/* Operational Summary */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {/* Employees */}
          <MotionDiv
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.45,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-400/10 text-purple-400">
                <Users size={17} />
              </div>

              <Link
                href="/employees"
                className="text-slate-600 transition hover:text-cyan-400"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Active Employees
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {dashboardData.employees.active.toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              {dashboardData.employees.total.toLocaleString()} total employees
            </p>
          </MotionDiv>

          {/* Available Assets */}
          <MotionDiv
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.5,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-400/10 text-cyan-400">
                <Package size={17} />
              </div>

              <Link
                href="/assets?status=AVAILABLE"
                className="text-slate-600 transition hover:text-cyan-400"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Available Assets
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {dashboardData.assets.available.toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Ready for allocation
            </p>
          </MotionDiv>

          {/* Licenses */}
          <MotionDiv
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.55,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-400/10 text-blue-400">
                <KeyRound size={17} />
              </div>

              <Link
                href="/licenses"
                className="text-slate-600 transition hover:text-cyan-400"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Active Licenses
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {dashboardData.licenses.active.toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              {dashboardData.licenses.expiring.toLocaleString()} expiring
            </p>
          </MotionDiv>

          {/* Retired */}
          <MotionDiv
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.4,
              delay: 0.6,
            }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
          >
            <div className="flex items-center justify-between">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-400/10 text-slate-400">
                <Archive size={17} />
              </div>

              <Link
                href="/assets?status=RETIRED"
                className="text-slate-600 transition hover:text-cyan-400"
              >
                <ArrowUpRight size={16} />
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-500">
              Retired Assets
            </p>

            <p className="mt-1 text-2xl font-semibold text-white">
              {dashboardData.assets.retired.toLocaleString()}
            </p>

            <p className="mt-1 text-[10px] text-slate-600">
              Removed from active inventory
            </p>
          </MotionDiv>

        </div>

        {/* Recent Assets */}
        <MotionSection
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 0.5,
            delay: 0.65,
          }}
          className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]"
        >
          <div className="flex items-center justify-between border-b border-white/[0.07] px-6 py-5">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Recently Updated Assets
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                Latest changes across your inventory
              </p>
            </div>

            <Link
              href="/assets"
              className="text-xs font-medium text-cyan-400 transition hover:text-cyan-300"
            >
              View all assets →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left">
              <thead>
                <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  <th className="px-6 py-3 font-medium">
                    Asset
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Employee
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Department
                  </th>

                  <th className="px-6 py-3 font-medium">
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {recentAssets.map((asset) => {
                  const activeAllocation =
                    asset.allocations[0];

                  const employee =
                    activeAllocation?.employee;

                  const employeeName = employee
                    ? `${employee.firstName} ${employee.lastName}`
                    : "—";

                  const department =
                    asset.department?.name ??
                    "—";

                  const displayStatus =
                    formatAssetStatus(
                      asset.status
                    );

                  return (
                    <tr
                      key={asset.id}
                      className="border-b border-white/[0.04] last:border-0 transition hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/assets/${asset.id}`}
                          className="flex items-center gap-3"
                        >
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.04] text-xs font-semibold text-slate-400">
                            {asset.model?.charAt(
                              0
                            ) ??
                              asset.assetTag.charAt(
                                0
                              )}
                          </div>

                          <div>
                            <p className="text-xs font-medium text-slate-300 transition hover:text-cyan-400">
                              {asset.model ||
                                "Unnamed Asset"}
                            </p>

                            <p className="mt-0.5 font-mono text-[10px] text-slate-600">
                              {asset.assetTag}
                            </p>
                          </div>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-400">
                        {employee ? (
                          <Link
                            href={`/employees/${employee.id}`}
                            className="transition hover:text-cyan-400"
                          >
                            {employeeName}
                          </Link>
                        ) : (
                          employeeName
                        )}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-500">
                        {department}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${getStatusClasses(
                            asset.status
                          )}`}
                        >
                          {displayStatus}
                        </span>
                      </td>
                    </tr>
                  );
                })}

                {recentAssets.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-6 py-12 text-center text-sm text-slate-600"
                    >
                      No assets found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </MotionSection>

      </div>
    </div>
  );
}