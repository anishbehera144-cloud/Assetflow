import Link from "next/link";
import { notFound } from "next/navigation";
import { RevokeLicenseButton } from "@/components/licenses/revoke-license-button";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileKey2,
  KeyRound,
  Pencil,
  Users,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

function formatDate(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(date: Date | null) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusStyles(status: string) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-400/10 text-emerald-400 border-emerald-400/20";

    case "EXPIRING":
      return "bg-amber-400/10 text-amber-400 border-amber-400/20";

    case "EXPIRED":
      return "bg-red-400/10 text-red-400 border-red-400/20";

    case "SUSPENDED":
      return "bg-slate-400/10 text-slate-400 border-slate-400/20";

    default:
      return "bg-white/[0.05] text-slate-400 border-white/[0.08]";
  }
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export default async function LicenseDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const license = await prisma.softwareLicense.findUnique({
    where: {
      id,
    },
    include: {
      assignments: {
        include: {
          employee: {
            include: {
              department: true,
            },
          },
        },
        orderBy: {
          assignedAt: "desc",
        },
      },
    },
  });

  if (!license) {
    notFound();
  }

  const usedSeats =
    license.totalSeats - license.availableSeats;

  const utilization =
    license.totalSeats > 0
      ? Math.round(
          (usedSeats / license.totalSeats) * 100
        )
      : 0;

  const activeAssignments =
    license.assignments.filter(
      (assignment) => !assignment.revokedAt
    );

  const revokedAssignments =
    license.assignments.filter(
      (assignment) => assignment.revokedAt
    );

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="mb-8">
          <Link
            href="/licenses"
            className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-cyan-400"
          >
            <ArrowLeft size={14} />
            Back to Licenses
          </Link>

          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/10 bg-cyan-400/[0.06] text-cyan-400">
                  <FileKey2 size={19} />
                </div>

                <span className="font-mono text-xs text-slate-600">
                  {license.id}
                </span>
              </div>

              <h1 className="text-3xl font-bold tracking-tight text-white">
                {license.name}
              </h1>

              <p className="mt-2 text-sm text-slate-500">
                {license.publisher || "Unknown publisher"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium ${statusStyles(
                  license.status
                )}`}
              >
                {license.status === "ACTIVE" ? (
                  <CheckCircle2 size={13} />
                ) : license.status === "EXPIRED" ? (
                  <XCircle size={13} />
                ) : (
                  <Clock3 size={13} />
                )}

                {statusLabel(license.status)}
              </span>

              <Link
                href={`/licenses/${license.id}/edit`}
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2 text-xs font-medium text-slate-300 transition hover:border-cyan-400/20 hover:bg-cyan-400/[0.05] hover:text-white"
              >
                <Pencil size={14} />
                Edit License
              </Link>
            </div>
          </div>
        </div>

        {/* License Overview */}
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users size={14} />
              Total Seats
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {license.totalSeats}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <CheckCircle2 size={14} />
              Used Seats
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {usedSeats}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Users size={14} />
              Available Seats
            </div>

            <p className="mt-4 text-3xl font-semibold text-cyan-400">
              {license.availableSeats}
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              Seat Utilization
            </div>

            <div className="mt-4 flex items-end justify-between">
              <p className="text-3xl font-semibold text-white">
                {utilization}%
              </p>

              <span className="text-xs text-slate-600">
                {usedSeats}/{license.totalSeats}
              </span>
            </div>

            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all"
                style={{
                  width: `${Math.min(utilization, 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.5fr]">

          {/* License Information */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-white">
                License Information
              </h2>

              <p className="mt-1 text-xs text-slate-600">
                Subscription and licensing details
              </p>
            </div>

            <div className="space-y-5">
              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  Publisher
                </p>

                <p className="mt-1 text-sm text-slate-300">
                  {license.publisher || "Unknown publisher"}
                </p>
              </div>

              <div>
                <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  <KeyRound size={12} />
                  License Key
                </p>

                <p className="mt-1 break-all font-mono text-xs text-slate-400">
                  {license.licenseKey || "Not provided"}
                </p>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    <CalendarDays size={12} />
                    Purchase Date
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {formatDate(license.purchaseDate)}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    <CalendarDays size={12} />
                    Renewal Date
                  </p>

                  <p className="mt-1 text-sm text-slate-300">
                    {formatDate(license.renewalDate)}
                  </p>
                </div>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.12em] text-slate-600">
                  Notes
                </p>

                <div className="mt-2 rounded-xl border border-white/[0.05] bg-black/10 p-4">
                  <p className="whitespace-pre-wrap text-xs leading-6 text-slate-400">
                    {license.notes || "No notes added."}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Seat Usage */}
          <section className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-6">
            <div className="mb-6 flex items-start justify-between">
              <div>
                <h2 className="text-sm font-semibold text-white">
                  Seat Usage
                </h2>

                <p className="mt-1 text-xs text-slate-600">
                  Current license allocation
                </p>
              </div>

              <Link
                href={`/licenses/${license.id}/assign`}
                className="rounded-xl bg-cyan-400 px-4 py-2 text-xs font-semibold text-slate-950 transition hover:bg-cyan-300"
              >
                Assign Employee
              </Link>
            </div>

            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  {usedSeats} seats used
                </span>

                <span className="text-slate-500">
                  {license.availableSeats} available
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                <div
                  className="h-full rounded-full bg-cyan-400"
                  style={{
                    width: `${Math.min(utilization, 100)}%`,
                  }}
                />
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Active assignments
                </span>

                <span className="text-sm font-semibold text-white">
                  {activeAssignments.length}
                </span>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Revoked assignments
                </span>

                <span className="text-sm font-semibold text-slate-400">
                  {revokedAssignments.length}
                </span>
              </div>
            </div>
          </section>
        </div>

        {/* Assignment History */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
          <div className="border-b border-white/[0.07] px-6 py-5">
            <h2 className="text-sm font-semibold text-white">
              Assignment History
            </h2>

            <p className="mt-1 text-xs text-slate-600">
              Employees who have received this license
            </p>
          </div>

          {license.assignments.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <Users
                size={24}
                className="mx-auto text-slate-700"
              />

              <p className="mt-3 text-sm text-slate-500">
                No employees have been assigned this license yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left">
                <thead>
                  <tr className="border-b border-white/[0.05] text-[10px] uppercase tracking-[0.12em] text-slate-600">
                    <th className="px-6 py-3 font-medium">
                      Employee
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Department
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Assigned
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Revoked
                    </th>

                    <th className="px-6 py-3 font-medium">
                      Status
                    </th>

                    <th className="px-6 py-3 text-right font-medium">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {license.assignments.map((assignment) => {
                    const employee = assignment.employee;
                    const active = !assignment.revokedAt;

                    return (
                      <tr
                        key={assignment.id}
                        className="border-b border-white/[0.04] last:border-0 transition hover:bg-white/[0.02]"
                      >
                        {/* Employee */}
                        <td className="px-6 py-4">
                          <div>
                            <p className="text-xs font-medium text-slate-300">
                              {employee.firstName}{" "}
                              {employee.lastName}
                            </p>

                            <p className="mt-1 font-mono text-[10px] text-slate-600">
                              {employee.employeeCode}
                            </p>
                          </div>
                        </td>

                        {/* Department */}
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {employee.department?.name || "—"}
                        </td>

                        {/* Assigned */}
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {formatDateTime(
                            assignment.assignedAt
                          )}
                        </td>

                        {/* Revoked */}
                        <td className="px-6 py-4 text-xs text-slate-500">
                          {formatDateTime(
                            assignment.revokedAt
                          )}
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-medium ${
                              active
                                ? "bg-emerald-400/10 text-emerald-400"
                                : "bg-slate-400/10 text-slate-500"
                            }`}
                          >
                            {active
                              ? "Active"
                              : "Revoked"}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="px-6 py-4 text-right">
                          {active ? (
                            <RevokeLicenseButton
                              assignmentId={assignment.id}
                              employeeName={`${employee.firstName} ${employee.lastName}`}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-700">
                              No action
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}