import { Activity, CalendarDays, Filter, ShieldCheck } from "lucide-react";
import { requirePermission } from "@/lib/auth";
import { AuditTable } from "@/components/audit/audit-table";
import { getAuditLogs } from "@/lib/audit-data";

type SearchParams = {
  search?: string | string[];
  action?: string | string[];
  entity?: string | string[];
  from?: string | string[];
  to?: string | string[];
  page?: string | string[];
};

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
    

}) {
    await requirePermission("audit.read");

  const params = await searchParams;

  const search = getParam(params.search);
  const action = getParam(params.action);
  const entity = getParam(params.entity);
  const from = getParam(params.from);
  const to = getParam(params.to);

  const parsedPage = Number(getParam(params.page));

  const page =
    Number.isFinite(parsedPage) && parsedPage > 0
      ? Math.floor(parsedPage)
      : 1;

  const data = await getAuditLogs({
    search,
    action,
    entity,
    from,
    to,
    page,
    pageSize: 15,
  });

  const hasFilters =
    Boolean(search) ||
    Boolean(action) ||
    Boolean(entity) ||
    Boolean(from) ||
    Boolean(to);

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-cyan-400">
              <ShieldCheck size={16} />

              <span className="text-[10px] font-semibold uppercase tracking-[0.18em]">
                Security & Compliance
              </span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-white">
              Audit Log
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              Review system activity, record changes, asset operations,
              license events, and administrative actions.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2.5">
              <Activity size={14} className="text-cyan-400" />

              <span className="text-xs font-medium text-slate-400">
                {data.pagination.total.toLocaleString("en-IN")}{" "}
                {data.pagination.total === 1 ? "event" : "events"}
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <form
          method="GET"
          className="mb-5 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4"
        >
          <div className="mb-4 flex items-center gap-2">
            <Filter size={14} className="text-slate-500" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              Filters
            </span>

            {hasFilters && (
              <a
                href="/audit"
                className="ml-auto text-[10px] font-medium text-cyan-400 transition hover:text-cyan-300"
              >
                Clear all
              </a>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {/* Search */}
            <div className="lg:col-span-2">
              <label
                htmlFor="audit-search"
                className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-slate-600"
              >
                Search
              </label>

              <input
                id="audit-search"
                name="search"
                defaultValue={search}
                placeholder="Action, entity, ID, user..."
                className="h-10 w-full rounded-xl border border-white/[0.07] bg-black/20 px-3 text-xs text-white outline-none placeholder:text-slate-700 transition focus:border-cyan-400/30 focus:bg-white/[0.035]"
              />
            </div>

            {/* Action */}
            <div>
              <label
                htmlFor="audit-action"
                className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-slate-600"
              >
                Action
              </label>

              <select
                id="audit-action"
                name="action"
                defaultValue={action}
                className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#090c13] px-3 text-xs text-slate-300 outline-none transition focus:border-cyan-400/30"
              >
                <option value="">All actions</option>
                <option value="CREATE_ASSET">Create Asset</option>
                <option value="UPDATE_ASSET">Update Asset</option>
                <option value="ALLOCATE_ASSET">Allocate Asset</option>
                <option value="REQUEST_RETURN">Request Return</option>
                <option value="PROCESS_RETURN">Process Return</option>
                <option value="CREATE_MAINTENANCE">
                  Create Maintenance
                </option>
                <option value="START_MAINTENANCE">
                  Start Maintenance
                </option>
                <option value="COMPLETE_MAINTENANCE">
                  Complete Maintenance
                </option>
                <option value="CANCEL_MAINTENANCE">
                  Cancel Maintenance
                </option>
                <option value="CREATE_EMPLOYEE">
                  Create Employee
                </option>
                <option value="UPDATE_EMPLOYEE">
                  Update Employee
                </option>
                <option value="CREATE_LICENSE">
                  Create License
                </option>
                <option value="UPDATE_LICENSE">
                  Update License
                </option>
                <option value="ASSIGN_LICENSE">
                  Assign License
                </option>
                <option value="REVOKE_LICENSE">
                  Revoke License
                </option>
              </select>
            </div>

            {/* Entity */}
            <div>
              <label
                htmlFor="audit-entity"
                className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.1em] text-slate-600"
              >
                Entity
              </label>

              <select
                id="audit-entity"
                name="entity"
                defaultValue={entity}
                className="h-10 w-full rounded-xl border border-white/[0.07] bg-[#090c13] px-3 text-xs text-slate-300 outline-none transition focus:border-cyan-400/30"
              >
                <option value="">All entities</option>
                <option value="Asset">Asset</option>
                <option value="Allocation">Allocation</option>
                <option value="ReturnRequest">
                  Return Request
                </option>
                <option value="MaintenanceRecord">
                  Maintenance Record
                </option>
                <option value="Employee">Employee</option>
                <option value="License">License</option>
                <option value="LicenseAssignment">
                  License Assignment
                </option>
              </select>
            </div>

            {/* Apply */}
            <div className="flex items-end">
              <button
                type="submit"
                className="h-10 w-full rounded-xl bg-cyan-400 px-4 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Apply Filters
              </button>
            </div>

            {/* Date range */}
            <div className="sm:col-span-2 lg:col-span-5">
              <div className="mb-2 flex items-center gap-2">
                <CalendarDays
                  size={13}
                  className="text-slate-600"
                />

                <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-slate-600">
                  Date range
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="audit-from"
                    className="mb-1.5 block text-[10px] text-slate-600"
                  >
                    From
                  </label>

                  <input
                    id="audit-from"
                    type="date"
                    name="from"
                    defaultValue={from}
                    className="h-10 w-full rounded-xl border border-white/[0.07] bg-black/20 px-3 text-xs text-slate-300 outline-none transition focus:border-cyan-400/30 [color-scheme:dark]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="audit-to"
                    className="mb-1.5 block text-[10px] text-slate-600"
                  >
                    To
                  </label>

                  <input
                    id="audit-to"
                    type="date"
                    name="to"
                    defaultValue={to}
                    className="h-10 w-full rounded-xl border border-white/[0.07] bg-black/20 px-3 text-xs text-slate-300 outline-none transition focus:border-cyan-400/30 [color-scheme:dark]"
                  />
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Results */}
        <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02]">
          <div className="flex flex-col gap-2 border-b border-white/[0.07] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white">
                Activity History
              </h2>

              <p className="mt-1 text-[11px] text-slate-600">
                Showing the newest activity first.
              </p>
            </div>

            <div className="text-[10px] text-slate-600">
              Page {data.pagination.page} of{" "}
              {data.pagination.totalPages}
            </div>
          </div>

          <AuditTable
            logs={data.logs}
            pagination={data.pagination}
          />
        </div>
      </div>
    </div>
  );
}