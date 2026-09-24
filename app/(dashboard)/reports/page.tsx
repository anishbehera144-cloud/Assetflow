import {
  Activity,
  Boxes,
  FileKey2,
  RefreshCw,
  Users,
  Wrench,
} from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { getReportsData } from "@/lib/reports-data";
import { ReportAnalytics } from "@/components/reports/report-analytics";

export default async function ReportsPage() {
  await requirePermission("report.read");
  const data = await getReportsData();

  const kpis = [
    {
      label: "Total Assets",
      value: data.totals.assets,
      icon: Boxes,
      description: "Tracked inventory",
    },
    {
      label: "Employees",
      value: data.totals.employees,
      icon: Users,
      description: "Registered employees",
    },
    {
      label: "Software Licenses",
      value: data.totals.licenses,
      icon: FileKey2,
      description: "Managed licenses",
    },
    {
      label: "Maintenance",
      value: data.totals.maintenance,
      icon: Wrench,
      description: "Service records",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-cyan-400">
              <Activity size={16} />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                Analytics
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Reports & Analytics
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Operational intelligence across assets,
              employees, licenses, and maintenance.
            </p>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-2.5 text-xs font-medium text-slate-400 transition hover:border-cyan-400/20 hover:bg-white/[0.05] hover:text-white"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {kpis.map((kpi) => {
            const Icon = kpi.icon;

            return (
              <div
                key={kpi.label}
                className="group rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5 transition hover:border-cyan-400/10 hover:bg-white/[0.035]"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-400">
                    <Icon size={18} />
                  </div>

                  <span className="text-[10px] uppercase tracking-[0.12em] text-slate-700">
                    Live
                  </span>
                </div>

                <p className="mt-5 text-3xl font-semibold tracking-tight text-white">
                  {kpi.value}
                </p>

                <p className="mt-1 text-sm font-medium text-slate-300">
                  {kpi.label}
                </p>

                <p className="mt-1 text-xs text-slate-600">
                  {kpi.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Lifecycle Summary */}
        <section className="mt-5 rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-white">
              Asset Lifecycle Summary
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Current state of the organization's asset inventory
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            <SummaryCard
              label="Available"
              value={data.assetSummary.available}
            />

            <SummaryCard
              label="Assigned"
              value={data.assetSummary.assigned}
            />

            <SummaryCard
              label="In Repair"
              value={data.assetSummary.inRepair}
            />

            <SummaryCard
              label="Return Requested"
              value={data.assetSummary.returnRequested}
            />

            <SummaryCard
              label="Retired"
              value={data.assetSummary.retired}
            />
          </div>
        </section>

        {/* Analytics */}
        <div className="mt-5">
          <ReportAnalytics data={data} />
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
      <p className="text-[10px] uppercase tracking-[0.1em] text-slate-600">
        {label}
      </p>

      <p className="mt-2 text-2xl font-semibold text-white">
        {value}
      </p>
    </div>
  );
}