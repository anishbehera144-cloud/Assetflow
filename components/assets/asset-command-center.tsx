"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Laptop,
  MapPin,
  Package,
  Pencil,
  RotateCcw,
  ShieldCheck,
  User,
  UserPlus,
  Wrench,
} from "lucide-react";

type AssetCommandCenterProps = {
  data: any;
};

function statusStyles(status: string) {
  switch (status) {
    case "ASSIGNED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-400";

    case "AVAILABLE":
      return "border-cyan-400/20 bg-cyan-400/10 text-cyan-400";

    case "IN_REPAIR":
      return "border-amber-400/20 bg-amber-400/10 text-amber-400";

    case "RETURN_REQUESTED":
      return "border-violet-400/20 bg-violet-400/10 text-violet-400";

    case "RETIRED":
      return "border-slate-400/20 bg-slate-400/10 text-slate-400";

    default:
      return "border-white/10 bg-white/5 text-slate-400";
  }
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: Date | string | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function getInitials(
  firstName?: string | null,
  lastName?: string | null
) {
  return `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
}

export function AssetCommandCenter({
  data,
}: AssetCommandCenterProps) {
  const {
    asset,
    allocations = [],
    returnRequests = [],
    maintenance = [],
    activeAllocation,
    pendingReturn,
    openMaintenance,
    auditLogs = [],
  } = data;

  const employee = activeAllocation?.employee;

  const status = asset.status;

  const isAvailable = status === "AVAILABLE";
  const isAssigned = status === "ASSIGNED";
  const isRetired = status === "RETIRED";

  return (
    <div className="min-h-[calc(100vh-76px)] bg-[#05070b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1550px]">

        {/* Back */}
        <Link
          href="/assets"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Link>

        {/* ========================================================= */}
        {/* HEADER */}
        {/* ========================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-6 overflow-hidden rounded-3xl border border-white/[0.08] bg-white/[0.025]"
        >
          <div className="relative overflow-hidden p-5 sm:p-7">

            {/* Ambient glow */}
            <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-cyan-400/[0.08] blur-3xl" />

            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">

              <div className="flex gap-4">

                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10 shadow-[0_0_40px_rgba(34,211,238,0.08)]">
                  <Laptop className="h-7 w-7 text-cyan-300" />
                </div>

                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {asset.model || "Unnamed Asset"}
                    </h1>

                    <span
                      className={`rounded-full border px-2.5 py-1 text-[11px] font-medium ${statusStyles(
                        status
                      )}`}
                    >
                      {formatStatus(status)}
                    </span>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                    <span className="font-mono text-slate-400">
                      {asset.assetTag}
                    </span>

                    <span className="text-slate-700">•</span>

                    <span className="text-slate-500">
                      {asset.manufacturer || "Unknown manufacturer"}
                    </span>

                    <span className="text-slate-700">•</span>

                    <span className="text-slate-500">
                      {asset.assetType.replaceAll("_", " ")}
                    </span>
                  </div>

                  {asset.serialNumber && (
                    <p className="mt-2 font-mono text-xs text-slate-600">
                      SN: {asset.serialNumber}
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-2">

                {isAvailable && !isRetired && (
                  <Link
                    href={`/assets/${asset.id}/allocate`}
                    className="inline-flex items-center gap-2 rounded-xl bg-cyan-400 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                  >
                    <UserPlus className="h-4 w-4" />
                    Allocate
                  </Link>
                )}

                {isAssigned && (
                  <Link
                    href={`/assets/${asset.id}/return`}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-2.5 text-sm font-semibold text-amber-300 transition hover:bg-amber-400/15"
                  >
                    <RotateCcw className="h-4 w-4" />
                    Request Return
                  </Link>
                )}

                <Link
                  href={`/assets/${asset.id}/edit`}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </div>
            </div>
          </div>

          {/* Quick metrics */}
          <div className="grid border-t border-white/[0.07] sm:grid-cols-2 lg:grid-cols-4">

            <Metric
              label="Current Custody"
              value={employee ? "Assigned" : "Unassigned"}
              icon={<User className="h-4 w-4" />}
            />

            <Metric
              label="Allocation Records"
              value={allocations.length.toString()}
              icon={<ShieldCheck className="h-4 w-4" />}
            />

            <Metric
              label="Maintenance Records"
              value={maintenance.length.toString()}
              icon={<Wrench className="h-4 w-4" />}
            />

            <Metric
              label="Return Requests"
              value={returnRequests.length.toString()}
              icon={<RotateCcw className="h-4 w-4" />}
            />
          </div>
        </motion.div>

        {/* ========================================================= */}
        {/* ACTIVE ALERTS */}
        {/* ========================================================= */}

        {(pendingReturn || openMaintenance) && (
          <div className="mb-6 grid gap-3 lg:grid-cols-2">

            {pendingReturn && (
              <AlertCard
                title="Return request pending"
                description={`A return request was submitted on ${formatDate(
                  pendingReturn.requestedAt
                )}.`}
                type="return"
              />
            )}

            {openMaintenance && (
              <AlertCard
                title="Maintenance in progress"
                description={
                  openMaintenance.issueDescription ||
                  "This asset currently has an open maintenance record."
                }
                type="maintenance"
              />
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* MAIN GRID */}
        {/* ========================================================= */}

        <div className="grid gap-5 xl:grid-cols-[1.55fr_0.85fr]">

          {/* ======================================================= */}
          {/* LEFT COLUMN */}
          {/* ======================================================= */}

          <div className="space-y-5">

            {/* Asset overview */}
            <Panel
              title="Asset Overview"
              description="Core identification and inventory information."
            >
              <div className="grid gap-px overflow-hidden rounded-xl bg-white/[0.07] sm:grid-cols-2 lg:grid-cols-3">

                <InfoItem
                  label="Asset Tag"
                  value={asset.assetTag}
                  mono
                />

                <InfoItem
                  label="Serial Number"
                  value={asset.serialNumber || "—"}
                  mono
                />

                <InfoItem
                  label="Category"
                  value={asset.category?.name || "—"}
                />

                <InfoItem
                  label="Manufacturer"
                  value={asset.manufacturer || "—"}
                />

                <InfoItem
                  label="Model"
                  value={asset.model || "—"}
                />

                <InfoItem
                  label="Asset Type"
                  value={asset.assetType.replaceAll("_", " ")}
                />
              </div>
            </Panel>

            {/* Organization */}
            <Panel
              title="Organization & Location"
              description="Where this asset belongs."
            >
              <div className="grid gap-3 sm:grid-cols-2">

                <InfoCard
                  icon={<Package className="h-4 w-4" />}
                  label="Department"
                  value={asset.department?.name || "—"}
                />

                <InfoCard
                  icon={<MapPin className="h-4 w-4" />}
                  label="Location"
                  value={asset.location?.name || "—"}
                />
              </div>
            </Panel>

            {/* Purchase */}
            <Panel
              title="Purchase & Warranty"
              description="Financial and warranty information."
            >
              <div className="grid gap-3 sm:grid-cols-3">

                <InfoCard
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Purchase Date"
                  value={formatDate(asset.purchaseDate)}
                />

                <InfoCard
                  label="Purchase Price"
                  value={formatCurrency(asset.purchasePrice)}
                />

                <InfoCard
                  label="Warranty Expiry"
                  value={formatDate(asset.warrantyExpiry)}
                />
              </div>
            </Panel>

            {/* Notes */}
            {asset.notes && (
              <Panel title="Notes">
                <div className="flex gap-3 rounded-xl border border-white/[0.06] bg-black/20 p-4">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />

                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {asset.notes}
                  </p>
                </div>
              </Panel>
            )}

            {/* Allocation history */}
            <Panel
              title="Allocation History"
              description="Complete custody history for this asset."
              badge={`${allocations.length}`}
            >
              {allocations.length === 0 ? (
                <EmptyState text="No allocation history." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                  <div className="divide-y divide-white/[0.06]">
                    {allocations.map((allocation: any) => (
                      <div
                        key={allocation.id}
                        className="flex flex-col gap-4 p-4 transition hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="flex min-w-0 gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-400/10 text-cyan-300">
                            {getInitials(
                              allocation.employee?.firstName,
                              allocation.employee?.lastName
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">
                              {allocation.employee?.firstName}{" "}
                              {allocation.employee?.lastName}
                            </p>

                            <p className="mt-1 text-xs text-slate-500">
                              {allocation.employee?.employeeCode || "—"}
                              {" · "}
                              {allocation.employee?.department?.name || "—"}
                            </p>

                            {allocation.checkoutCondition && (
                              <p className="mt-2 text-xs text-slate-600">
                                Checkout condition:{" "}
                                {allocation.checkoutCondition}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="shrink-0 text-left sm:text-right">

                          <span
                            className={`inline-flex rounded-full border px-2 py-1 text-[10px] ${
                              allocation.status === "ACTIVE"
                                ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-400"
                                : "border-white/10 bg-white/5 text-slate-500"
                            }`}
                          >
                            {allocation.status}
                          </span>

                          <p className="mt-2 text-xs text-slate-400">
                            Assigned {formatDate(allocation.assignedAt)}
                          </p>

                          <p className="mt-1 text-[11px] text-slate-600">
                            {allocation.returnedAt
                              ? `Returned ${formatDate(
                                  allocation.returnedAt
                                )}`
                              : "Currently assigned"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>

            {/* Maintenance */}
            <Panel
              title="Maintenance History"
              description="Service and repair records."
              badge={`${maintenance.length}`}
            >
              {maintenance.length === 0 ? (
                <EmptyState text="No maintenance records." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                  <div className="divide-y divide-white/[0.06]">
                    {maintenance.map((record: any) => (
                      <div
                        key={record.id}
                        className="flex gap-4 p-4 transition hover:bg-white/[0.025]"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-400/10">
                          <Wrench className="h-4 w-4 text-amber-400" />
                        </div>

                        <div className="min-w-0 flex-1">

                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-medium text-white">
                              {record.issueDescription}
                            </p>

                            <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                              {formatStatus(record.status)}
                            </span>
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {record.vendor || "Internal service"}
                            {" · "}
                            Started {formatDate(record.startedAt)}
                          </p>

                          {record.resolutionNotes && (
                            <p className="mt-2 text-xs leading-5 text-slate-500">
                              {record.resolutionNotes}
                            </p>
                          )}

                          {record.cost !== null &&
                            record.cost !== undefined && (
                              <p className="mt-2 text-xs text-slate-600">
                                Service cost:{" "}
                                {formatCurrency(record.cost)}
                              </p>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>

            {/* Return requests */}
            <Panel
              title="Return Requests"
              description="Return workflow history for this asset."
              badge={`${returnRequests.length}`}
            >
              {returnRequests.length === 0 ? (
                <EmptyState text="No return requests." />
              ) : (
                <div className="overflow-hidden rounded-xl border border-white/[0.06]">
                  <div className="divide-y divide-white/[0.06]">
                    {returnRequests.map((request: any) => (
                      <div
                        key={request.id}
                        className="p-4 transition hover:bg-white/[0.025]"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">

                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-white">
                                {request.employee?.firstName}{" "}
                                {request.employee?.lastName}
                              </p>

                              <span className="rounded-full border border-violet-400/20 bg-violet-400/10 px-2 py-0.5 text-[10px] text-violet-300">
                                {formatStatus(request.status)}
                              </span>
                            </div>

                            <p className="mt-1 text-xs text-slate-500">
                              Requested {formatDate(request.requestedAt)}
                            </p>
                          </div>

                          <Link
                            href={`/return-requests/${request.id}`}
                            className="inline-flex items-center gap-1 text-xs text-cyan-400 transition hover:text-cyan-300"
                          >
                            View request
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>
                        </div>

                        {request.reason && (
                          <div className="mt-3 rounded-lg bg-black/20 p-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-600">
                              Reason
                            </p>

                            <p className="mt-1 text-xs leading-5 text-slate-400">
                              {request.reason}
                            </p>
                          </div>
                        )}

                        {request.condition && (
                          <p className="mt-2 text-xs text-slate-600">
                            Condition: {request.condition}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Panel>
          </div>

          {/* ======================================================= */}
          {/* RIGHT COLUMN */}
          {/* ======================================================= */}

          <div className="space-y-5">

            {/* Current custody */}
            <Panel title="Current Custody">

              {employee ? (
                <div>

                  <div className="flex items-center gap-4">

                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/10 text-sm font-semibold text-cyan-300">
                      {getInitials(
                        employee.firstName,
                        employee.lastName
                      )}
                    </div>

                    <div className="min-w-0">
                      <p className="font-medium text-white">
                        {employee.firstName}{" "}
                        {employee.lastName}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {employee.jobTitle || "Employee"}
                      </p>

                      <p className="mt-1 truncate text-xs text-slate-600">
                        {employee.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">

                    <MiniInfo
                      label="Employee ID"
                      value={employee.employeeCode}
                    />

                    <MiniInfo
                      label="Department"
                      value={employee.department?.name || "—"}
                    />
                  </div>

                  <div className="mt-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3">
                    <p className="text-[10px] uppercase tracking-wider text-slate-600">
                      Assigned
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      {formatDateTime(
                        activeAllocation?.assignedAt
                      )}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="py-7 text-center">

                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.04]">
                    <User className="h-5 w-5 text-slate-600" />
                  </div>

                  <p className="mt-3 text-sm text-slate-400">
                    No current assignee
                  </p>

                  <p className="mt-1 text-xs text-slate-600">
                    This asset is not currently assigned.
                  </p>

                  {isAvailable && (
                    <Link
                      href={`/assets/${asset.id}/allocate`}
                      className="mt-4 inline-flex items-center gap-2 rounded-lg bg-cyan-400 px-3 py-2 text-xs font-semibold text-slate-950 hover:bg-cyan-300"
                    >
                      <UserPlus className="h-3.5 w-3.5" />
                      Assign Asset
                    </Link>
                  )}
                </div>
              )}
            </Panel>

            {/* Lifecycle */}
            <Panel title="Lifecycle">

              <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">

                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border ${statusStyles(
                    status
                  )}`}
                >
                  <CheckCircle2 className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-sm font-medium text-white">
                    {formatStatus(status)}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Current lifecycle state
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <LifecycleItem
                  label="Asset created"
                  date={asset.createdAt}
                  active
                />

                {allocations.length > 0 && (
                  <LifecycleItem
                    label="Allocation recorded"
                    date={allocations[0].assignedAt}
                    active
                  />
                )}

                {maintenance.length > 0 && (
                  <LifecycleItem
                    label="Maintenance activity"
                    date={
                      maintenance[0].startedAt ||
                      maintenance[0].createdAt
                    }
                    active
                  />
                )}

                {returnRequests.length > 0 && (
                  <LifecycleItem
                    label="Return request activity"
                    date={returnRequests[0].requestedAt}
                    active
                  />
                )}

                <LifecycleItem
                  label="Last updated"
                  date={asset.updatedAt}
                  active
                />
              </div>
            </Panel>

            {/* Asset security / state */}
            <Panel title="Asset State">

              <div className="space-y-2">

                <StateRow
                  label="Lifecycle status"
                  value={formatStatus(status)}
                />

                <StateRow
                  label="Custody"
                  value={employee ? "Assigned" : "Unassigned"}
                />

                <StateRow
                  label="Pending return"
                  value={pendingReturn ? "Yes" : "No"}
                />

                <StateRow
                  label="Active maintenance"
                  value={openMaintenance ? "Yes" : "No"}
                />

                <StateRow
                  label="Asset type"
                  value={asset.assetType.replaceAll("_", " ")}
                />
              </div>
            </Panel>

            {/* Metadata */}
            <Panel title="Metadata">

              <div className="space-y-4">

                <MetadataItem
                  label="Asset ID"
                  value={asset.id}
                />

                <MetadataItem
                  label="Created"
                  value={formatDateTime(asset.createdAt)}
                />

                <MetadataItem
                  label="Last Updated"
                  value={formatDateTime(asset.updatedAt)}
                />

                {asset.serialNumber && (
                  <MetadataItem
                    label="Serial Number"
                    value={asset.serialNumber}
                  />
                )}
              </div>
            </Panel>

            {/* Audit activity */}
            <Panel
              title="Recent Activity"
              description="Recent audit events related to this asset."
            >
              {auditLogs.length === 0 ? (
                <EmptyState text="No audit activity recorded." />
              ) : (
                <div className="space-y-4">

                  {auditLogs.slice(0, 8).map((log: any) => (
                    <div
                      key={log.id}
                      className="flex gap-3"
                    >
                      <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/[0.04]">
                        <Clock3 className="h-3.5 w-3.5 text-slate-500" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-medium text-slate-300">
                          {formatAuditAction(log.action)}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-600">
                          {log.user?.name || "System"}
                          {" · "}
                          {formatDateTime(log.createdAt)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Panel>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* COMPONENTS */
/* ============================================================= */

function Panel({
  title,
  description,
  badge,
  children,
}: {
  title: string;
  description?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.025]">

      <div className="flex items-start justify-between border-b border-white/[0.07] px-5 py-4">

        <div>
          <h2 className="font-medium text-white">
            {title}
          </h2>

          {description && (
            <p className="mt-1 text-xs text-slate-600">
              {description}
            </p>
          )}
        </div>

        {badge && (
          <span className="rounded-full border border-white/[0.07] bg-white/[0.03] px-2 py-1 text-[10px] text-slate-500">
            {badge}
          </span>
        )}
      </div>

      <div className="p-5">
        {children}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 border-r border-white/[0.07] px-5 py-4 last:border-r-0">

      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] text-slate-500">
        {icon}
      </div>

      <div>
        <p className="text-[10px] uppercase tracking-wider text-slate-600">
          {label}
        </p>

        <p className="mt-1 text-sm font-medium text-slate-300">
          {value}
        </p>
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="bg-[#080b10] p-4">
      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p
        className={`mt-2 text-sm text-slate-300 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}

function InfoCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/20 p-4">

      <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-600">
        {icon}
        {label}
      </div>

      <p className="mt-2 text-sm text-slate-300">
        {value}
      </p>
    </div>
  );
}

function MiniInfo({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">

      <p className="text-[9px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 truncate text-xs text-slate-400">
        {value}
      </p>
    </div>
  );
}

function StateRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/[0.05] py-2.5 last:border-0">

      <span className="text-xs text-slate-600">
        {label}
      </span>

      <span className="text-right text-xs text-slate-400">
        {value}
      </span>
    </div>
  );
}

function LifecycleItem({
  label,
  date,
  active,
}: {
  label: string;
  date: Date | string | null | undefined;
  active?: boolean;
}) {
  return (
    <div className="relative flex gap-3 pb-4 last:pb-0">

      <div className="relative flex w-4 justify-center">
        <div
          className={`mt-1 h-2.5 w-2.5 rounded-full ${
            active ? "bg-cyan-400" : "bg-slate-700"
          }`}
        />

        <div className="absolute top-4 h-full w-px bg-white/[0.06]" />
      </div>

      <div>
        <p className="text-xs font-medium text-slate-300">
          {label}
        </p>

        <p className="mt-1 flex items-center gap-1 text-[11px] text-slate-600">
          <Clock3 className="h-3 w-3" />
          {formatDateTime(date)}
        </p>
      </div>
    </div>
  );
}

function MetadataItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-600">
        {label}
      </p>

      <p className="mt-1 break-all font-mono text-[11px] text-slate-500">
        {value}
      </p>
    </div>
  );
}

function AlertCard({
  title,
  description,
  type,
}: {
  title: string;
  description: string;
  type: "return" | "maintenance";
}) {
  return (
    <div
      className={`rounded-2xl border p-4 ${
        type === "return"
          ? "border-violet-400/15 bg-violet-400/[0.05]"
          : "border-amber-400/15 bg-amber-400/[0.05]"
      }`}
    >
      <div className="flex gap-3">

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
            type === "return"
              ? "bg-violet-400/10 text-violet-300"
              : "bg-amber-400/10 text-amber-300"
          }`}
        >
          {type === "return" ? (
            <RotateCcw className="h-4 w-4" />
          ) : (
            <Wrench className="h-4 w-4" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium text-white">
            {title}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-white/[0.07] px-5 py-10 text-center">
      <p className="text-sm text-slate-600">
        {text}
      </p>
    </div>
  );
}

function formatAuditAction(action: string) {
  return action
    .replaceAll("_", " ")
    .replaceAll(".", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}