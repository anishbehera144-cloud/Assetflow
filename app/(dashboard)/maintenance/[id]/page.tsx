import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  MapPin,
  Package,
  ServerCog,
  Tag,
  User,
  Wrench,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { MaintenanceActions } from "@/components/maintenance/maintenance-actions";

type MaintenanceDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: unknown) {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value));
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ");
}

function statusClasses(status: string) {
  switch (status) {
    case "OPEN":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "IN_PROGRESS":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "COMPLETED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "CANCELLED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-white/10 bg-white/[0.04] text-slate-300";
  }
}

export default async function MaintenanceDetailsPage({
  params,
}: MaintenanceDetailsPageProps) {
  const { id } = await params;

  const maintenance = await prisma.maintenanceRecord.findUnique({
    where: {
      id,
    },
    include: {
      asset: {
        include: {
          category: true,
          department: true,
          location: true,
        },
      },
    },
  });

  if (!maintenance) {
    notFound();
  }

  const asset = maintenance.asset;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/maintenance"
              className="mb-4 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Maintenance
            </Link>

            <div className="flex flex-wrap items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10">
                <Wrench className="h-6 w-6 text-orange-300" />
              </div>

              <div>
                <p className="text-sm text-slate-500">
                  Maintenance Record
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  {asset.assetTag}
                </h1>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${statusClasses(
                  maintenance.status
                )}`}
              >
                {statusLabel(maintenance.status)}
              </span>
            </div>
          </div>

          <Link
            href={`/assets/${asset.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-sm font-medium text-slate-200 transition hover:bg-white/[0.08] hover:text-white"
          >
            <Package className="h-4 w-4" />
            View Asset
          </Link>
        </div>

        {/* TOP SUMMARY */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-orange-400/10">
              <Tag className="h-4 w-4 text-orange-300" />
            </div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Asset
            </p>

            <p className="mt-1 font-semibold text-white">
              {asset.assetTag}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-blue-400/10">
              <ServerCog className="h-4 w-4 text-blue-300" />
            </div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Asset Status
            </p>

            <p className="mt-1 font-semibold text-white">
              {statusLabel(asset.status)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10">
              <CircleDollarSign className="h-4 w-4 text-emerald-300" />
            </div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Service Cost
            </p>

            <p className="mt-1 font-semibold text-white">
              {formatCurrency(maintenance.cost)}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl bg-purple-400/10">
              <CalendarDays className="h-4 w-4 text-purple-300" />
            </div>

            <p className="text-xs uppercase tracking-wider text-slate-500">
              Started
            </p>

            <p className="mt-1 font-semibold text-white">
              {formatDate(maintenance.startedAt)}
            </p>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">

          {/* LEFT */}
          <div className="space-y-6">

            {/* ISSUE */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-400/10">
                  <Wrench className="h-5 w-5 text-red-300" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Maintenance Issue
                  </h2>

                  <p className="text-sm text-slate-500">
                    Reported service problem
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-5">
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                  {maintenance.issueDescription}
                </p>
              </div>
            </section>

            {/* ASSET INFORMATION */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-400/10">
                  <Package className="h-5 w-5 text-orange-300" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Asset Information
                  </h2>

                  <p className="text-sm text-slate-500">
                    Hardware and organizational details
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Asset Tag
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {asset.assetTag}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Type
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {statusLabel(asset.assetType)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Category
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {asset.category.name}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Manufacturer
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {asset.manufacturer || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Model
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {asset.model || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Serial Number
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {asset.serialNumber || "—"}
                  </p>
                </div>
              </div>
            </section>

            {/* ORGANIZATION */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10">
                  <MapPin className="h-5 w-5 text-blue-300" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Organization & Location
                  </h2>

                  <p className="text-sm text-slate-500">
                    Current organizational assignment
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Department
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {asset.department?.name || "Unassigned"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Location
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {asset.location?.name || "Unassigned"}
                  </p>
                </div>
              </div>
            </section>

            {/* SERVICE DETAILS */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-400/10">
                  <ServerCog className="h-5 w-5 text-purple-300" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Service Details
                  </h2>

                  <p className="text-sm text-slate-500">
                    Vendor, cost and resolution information
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Vendor
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {maintenance.vendor || "Not specified"}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Cost
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {formatCurrency(maintenance.cost)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Started At
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {formatDate(maintenance.startedAt)}
                  </p>
                </div>

                <div>
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Resolved At
                  </p>

                  <p className="mt-1 font-medium text-white">
                    {formatDate(maintenance.resolvedAt)}
                  </p>
                </div>
              </div>

              {maintenance.resolutionNotes && (
                <div className="mt-6 border-t border-white/10 pt-6">
                  <p className="text-xs uppercase tracking-wider text-slate-500">
                    Resolution Notes
                  </p>

                  <div className="mt-2 rounded-xl border border-emerald-400/10 bg-emerald-400/[0.04] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">
                      {maintenance.resolutionNotes}
                    </p>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* RIGHT */}
          <div className="space-y-6">

            {/* WORKFLOW */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-orange-300">
                  Workflow
                </p>

                <h2 className="mt-1 text-lg font-semibold text-white">
                  Maintenance Actions
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Move this maintenance record through its lifecycle.
                </p>
              </div>

              <MaintenanceActions
                maintenanceId={maintenance.id}
                status={maintenance.status}
              />
            </section>

            {/* LIFECYCLE */}
<section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
  <div className="mb-6">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
      Lifecycle
    </p>

    <h2 className="mt-1 text-lg font-semibold text-white">
      Service Progress
    </h2>

    <p className="mt-1 text-sm text-slate-500">
      Current maintenance workflow state.
    </p>
  </div>

  <div className="space-y-0">

    {/* OPEN */}
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border ${
            maintenance.status === "OPEN" ||
            maintenance.status === "IN_PROGRESS" ||
            maintenance.status === "COMPLETED"
              ? "border-orange-400/30 bg-orange-400/10 text-orange-300"
              : "border-white/10 bg-white/[0.03] text-slate-600"
          }`}
        >
          <Wrench className="h-4 w-4" />
        </div>

        <div className="h-12 w-px bg-white/10" />
      </div>

      <div className="pb-6 pt-1">
        <p
          className={`font-medium ${
            maintenance.status === "OPEN" ||
            maintenance.status === "IN_PROGRESS" ||
            maintenance.status === "COMPLETED"
              ? "text-white"
              : "text-slate-600"
          }`}
        >
          Maintenance Opened
        </p>

        <p className="mt-1 text-xs text-slate-500">
          {formatDate(maintenance.createdAt)}
        </p>
      </div>
    </div>

    {/* CANCELLED PATH */}
    {maintenance.status === "CANCELLED" && (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-full border border-red-400/30 bg-red-400/10 text-red-300">
            <AlertTriangle className="h-4 w-4" />
          </div>
        </div>

        <div className="pt-1">
          <p className="font-medium text-white">
            Maintenance Cancelled
          </p>

          <p className="mt-1 text-xs text-slate-500">
            The maintenance workflow was cancelled before service started.
          </p>

          <div className="mt-3 inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-medium text-red-300">
            Asset returned to AVAILABLE
          </div>
        </div>
      </div>
    )}

    {/* SERVICE IN PROGRESS */}
    {maintenance.status !== "CANCELLED" && (
      <div className="flex gap-4">
        <div className="flex flex-col items-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              maintenance.status === "IN_PROGRESS" ||
              maintenance.status === "COMPLETED"
                ? "border-blue-400/30 bg-blue-400/10 text-blue-300"
                : "border-white/10 bg-white/[0.03] text-slate-600"
            }`}
          >
            <ServerCog className="h-4 w-4" />
          </div>

          <div className="h-12 w-px bg-white/10" />
        </div>

        <div className="pb-6 pt-1">
          <p
            className={`font-medium ${
              maintenance.status === "IN_PROGRESS" ||
              maintenance.status === "COMPLETED"
                ? "text-white"
                : "text-slate-600"
            }`}
          >
            Service In Progress
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {maintenance.status === "OPEN"
              ? "Waiting for technician to start service"
              : maintenance.status === "IN_PROGRESS"
                ? "Technician is currently working on the asset"
                : "Service stage completed"}
          </p>
        </div>
      </div>
    )}

    {/* COMPLETED */}
    {maintenance.status !== "CANCELLED" && (
      <div className="flex gap-4">
        <div className="flex h-10 w-10 items-center justify-center">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-full border ${
              maintenance.status === "COMPLETED"
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-300"
                : "border-white/10 bg-white/[0.03] text-slate-600"
            }`}
          >
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>

        <div className="pt-1">
          <p
            className={`font-medium ${
              maintenance.status === "COMPLETED"
                ? "text-white"
                : "text-slate-600"
            }`}
          >
            Maintenance Completed
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {maintenance.resolvedAt
              ? formatDate(maintenance.resolvedAt)
              : "Waiting for completion"}
          </p>

          {maintenance.status === "COMPLETED" && (
            <div className="mt-3 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-300">
              Asset returned to AVAILABLE
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</section>

            {/* RECORD META */}
            <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
              <h2 className="font-semibold text-white">
                Record Information
              </h2>

              <div className="mt-5 space-y-4">

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Record ID
                  </span>

                  <span className="max-w-[220px] truncate text-right font-mono text-xs text-slate-400">
                    {maintenance.id}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Created
                  </span>

                  <span className="text-sm text-slate-300">
                    {formatDate(maintenance.createdAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Last Updated
                  </span>

                  <span className="text-sm text-slate-300">
                    {formatDate(maintenance.updatedAt)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-slate-500">
                    Asset
                  </span>

                  <Link
                    href={`/assets/${asset.id}`}
                    className="inline-flex items-center gap-2 text-sm font-medium text-orange-300 transition hover:text-orange-200"
                  >
                    <User className="h-4 w-4" />
                    {asset.assetTag}
                  </Link>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}