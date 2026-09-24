import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  Edit3,
  FileText,
  Laptop,
  Mail,
  MapPin,
  Monitor,
  Package,
  Phone,
  ShieldCheck,
  User,
  UserCheck,
  UserX,
  XCircle,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

function formatDate(date: Date | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatDateTime(date: Date | null | undefined) {
  if (!date) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function formatEnum(value: string | null | undefined) {
  if (!value) return "—";

  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getStatusClasses(status: string) {
  if (status === "ACTIVE") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";
  }

  return "border-red-400/20 bg-red-400/10 text-red-300";
}

function getAssetStatusClasses(status: string) {
  switch (status) {
    case "ASSIGNED":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "AVAILABLE":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "IN_REPAIR":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "RETURN_REQUESTED":
      return "border-orange-400/20 bg-orange-400/10 text-orange-300";

    case "RETIRED":
      return "border-zinc-400/20 bg-zinc-400/10 text-zinc-300";

    default:
      return "border-white/10 bg-white/5 text-zinc-300";
  }
}

function getReturnStatusClasses(status: string) {
  switch (status) {
    case "PENDING":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "APPROVED":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "PROCESSED":
      return "border-emerald-400/20 bg-emerald-400/10 text-emerald-300";

    case "REJECTED":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-white/10 bg-white/5 text-zinc-300";
  }
}

function getLicenseStatusClasses(status: string) {
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
      return "border-white/10 bg-white/5 text-zinc-300";
  }
}

export default async function EmployeeDetailsPage({
  params,
}: PageProps) {
  const { id } = await params;

  const employee = await prisma.employee.findUnique({
    where: {
      id,
    },
    include: {
      department: true,
      user: true,

      allocations: {
        include: {
          asset: {
            include: {
              category: true,
              location: true,
            },
          },
        },
        orderBy: {
           assignedAt: "desc",
        },
      },

      returnRequests: {
        include: {
          asset: {
            include: {
              category: true,
            },
          },
        },
        orderBy: {
            requestedAt: "desc",
        },
      },

      licenseAssignments: {
        include: {
          license: true,
        },
        orderBy: {
          assignedAt: "desc",
        },
      },
    },
  });

  if (!employee) {
    notFound();
  }

  const activeAllocations = employee.allocations.filter(
    (allocation) => allocation.status === "ACTIVE"
  );

  const pendingReturns = employee.returnRequests.filter(
    (request) => request.status === "PENDING"
  );

  const activeLicenses = employee.licenseAssignments.filter(
    (assignment) => assignment.license.status === "ACTIVE"
  );

  const isInactive = employee.status === "INACTIVE";

  return (
    <div className="min-h-screen bg-[#05070b] px-4 py-6 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        {/* Back navigation */}
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Employees
        </Link>

        {/* Employee Header */}
        <section className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_35%)]" />

          <div className="relative p-6 lg:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-4">
                {/* Avatar */}
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04] text-xl font-semibold text-white shadow-lg">
                  {employee.firstName?.charAt(0)}
                  {employee.lastName?.charAt(0)}
                </div>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-3">
                    <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                      {employee.firstName} {employee.lastName}
                    </h1>

                    {/* Employee status */}
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                        employee.status
                      )}`}
                    >
                      {employee.status === "ACTIVE" ? (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5" />
                      )}

                      {employee.status === "ACTIVE"
                        ? "Active"
                        : "Inactive"}
                    </span>

                    {/* Portal account */}
                    {employee.user ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-xs font-medium text-blue-300">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        Portal Account
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-400/20 bg-zinc-400/10 px-2.5 py-1 text-xs font-medium text-zinc-300">
                        No Portal Account
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-sm text-zinc-400">
                    {employee.employeeCode}
                    {employee.jobTitle ? ` • ${employee.jobTitle}` : ""}
                  </p>

                  <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-zinc-400">
                    <span className="inline-flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-zinc-500" />
                      {employee.department?.name ?? "No Department"}
                    </span>

                    {employee.email && (
                      <span className="inline-flex items-center gap-2">
                        <Mail className="h-4 w-4 text-zinc-500" />
                        {employee.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <Link
                href={`/employees/${employee.id}/edit`}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-white/20 hover:bg-white/[0.08]"
              >
                <Edit3 className="h-4 w-4" />
                Edit Employee
              </Link>
            </div>
          </div>
        </section>

        {/* Inactive warning */}
        {isInactive && (
          <section className="rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-5">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-400/20 bg-red-400/10">
                <UserX className="h-5 w-5 text-red-300" />
              </div>

              <div>
                <h2 className="font-semibold text-red-200">
                  Employee is inactive
                </h2>

                <p className="mt-1 text-sm leading-6 text-red-200/70">
                  New asset allocations are blocked for this employee.
                  Existing allocations, custody history, return requests,
                  and software license records remain available for review.
                </p>
              </div>
            </div>
          </section>
        )}

        {/* KPI cards */}
        <section className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Current Assets</p>

              <div className="rounded-lg bg-blue-400/10 p-2">
                <Package className="h-4 w-4 text-blue-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {activeAllocations.length}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Currently assigned
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Asset History</p>

              <div className="rounded-lg bg-violet-400/10 p-2">
                <Clock3 className="h-4 w-4 text-violet-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {employee.allocations.length}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Total allocation records
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Pending Returns</p>

              <div className="rounded-lg bg-amber-400/10 p-2">
                <Package className="h-4 w-4 text-amber-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {pendingReturns.length}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Awaiting processing
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16] p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-zinc-400">Software Licenses</p>

              <div className="rounded-lg bg-emerald-400/10 p-2">
                <CreditCard className="h-4 w-4 text-emerald-300" />
              </div>
            </div>

            <p className="mt-4 text-3xl font-semibold text-white">
              {activeLicenses.length}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Active assignments
            </p>
          </div>
        </section>

        {/* Profile + Organization */}
        <section className="grid gap-6 xl:grid-cols-2">
          {/* Profile */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-400/10 p-2">
                  <User className="h-4 w-4 text-blue-300" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Profile Information
                  </h2>

                  <p className="text-xs text-zinc-500">
                    Employee identity and contact details
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Employee Code
                </p>
                <p className="mt-2 text-sm text-white">
                  {employee.employeeCode}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Employment Status
                </p>

                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                      employee.status
                    )}`}
                  >
                    {employee.status === "ACTIVE" ? (
                      <UserCheck className="h-3.5 w-3.5" />
                    ) : (
                      <UserX className="h-3.5 w-3.5" />
                    )}

                    {employee.status === "ACTIVE"
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Full Name
                </p>

                <p className="mt-2 text-sm text-white">
                  {employee.firstName} {employee.lastName}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Job Title
                </p>

                <p className="mt-2 text-sm text-white">
                  {employee.jobTitle ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Email
                </p>

                <p className="mt-2 break-all text-sm text-white">
                  {employee.email ?? "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Phone
                </p>

                <p className="mt-2 text-sm text-white">
                  {employee.phone ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Organization */}
          <div className="rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
            <div className="border-b border-white/[0.06] px-6 py-5">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-violet-400/10 p-2">
                  <Building2 className="h-4 w-4 text-violet-300" />
                </div>

                <div>
                  <h2 className="font-semibold text-white">
                    Organization
                  </h2>

                  <p className="text-xs text-zinc-500">
                    Department and account information
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 p-6 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Department
                </p>

                <p className="mt-2 text-sm text-white">
                  {employee.department?.name ?? "No Department"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Portal Account
                </p>

                <div className="mt-2">
                  {employee.user ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-xs text-blue-300">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      Enabled
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-zinc-400/20 bg-zinc-400/10 px-2.5 py-1 text-xs text-zinc-400">
                      Not Configured
                    </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  User Role
                </p>

                <p className="mt-2 text-sm text-white">
                  {employee.user?.role
                    ? formatEnum(employee.user.role)
                    : "—"}
                </p>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                  Joined
                </p>

                <p className="mt-2 inline-flex items-center gap-2 text-sm text-white">
                  <CalendarDays className="h-4 w-4 text-zinc-500" />
                  {formatDate(employee.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Current Assets */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
          <div className="flex flex-col gap-3 border-b border-white/[0.06] px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-400/10 p-2">
                  <Laptop className="h-4 w-4 text-blue-300" />
                </div>

                <h2 className="font-semibold text-white">
                  Currently Assigned Assets
                </h2>
              </div>

              <p className="mt-1 text-xs text-zinc-500">
                Assets currently under this employee&apos;s custody
              </p>
            </div>

            <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 text-xs text-zinc-400">
              {activeAllocations.length} active
            </span>
          </div>

          {activeAllocations.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-14 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                <Package className="h-5 w-5 text-zinc-500" />
              </div>

              <p className="mt-4 text-sm font-medium text-zinc-300">
                No assets currently assigned
              </p>

              <p className="mt-1 max-w-md text-xs leading-5 text-zinc-500">
                This employee currently has no active asset custody
                records.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Asset
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Category
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Location
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Checked Out
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Condition
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {activeAllocations.map((allocation) => (
                    <tr
                      key={allocation.id}
                      className="border-b border-white/[0.04] transition hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/assets/${allocation.asset.id}`}
                          className="group"
                        >
                          <p className="font-medium text-white transition group-hover:text-blue-300">
                            {allocation.asset.assetTag}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {allocation.asset.manufacturer ?? ""}{" "}
                            {allocation.asset.model ?? ""}
                          </p>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {allocation.asset.category?.name ?? "—"}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-zinc-300">
                          <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                          {allocation.asset.location?.name ?? "—"}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDate(allocation.assignedAt)}
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-300">
                          {allocation.conditionAtCheckout || "Not recorded"}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/assets/${allocation.asset.id}`}
                          className="inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
                        >
                          View
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Asset History */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-400/10 p-2">
                <Clock3 className="h-4 w-4 text-violet-300" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Asset History
                </h2>

                <p className="text-xs text-zinc-500">
                  Historical asset custody records
                </p>
              </div>
            </div>
          </div>

          {employee.allocations.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              No asset history available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Asset
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Checked Out
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Returned
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employee.allocations.map((allocation) => (
                    <tr
                      key={allocation.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/assets/${allocation.asset.id}`}
                          className="group"
                        >
                          <p className="font-medium text-white group-hover:text-blue-300">
                            {allocation.asset.assetTag}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {allocation.asset.model ?? "No model"}
                          </p>
                        </Link>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getAssetStatusClasses(
                            allocation.asset.status
                          )}`}
                        >
                          {formatEnum(allocation.asset.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDateTime(allocation.assignedAt)}
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDateTime(allocation.returnedAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/assets/${allocation.asset.id}`}
                          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
                        >
                          View Asset
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Return Requests */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-400/10 p-2">
                <FileText className="h-4 w-4 text-amber-300" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Return Requests
                </h2>

                <p className="text-xs text-zinc-500">
                  Asset return requests submitted by this employee
                </p>
              </div>
            </div>
          </div>

          {employee.returnRequests.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              No return requests found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Asset
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Reason
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Created
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employee.returnRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/assets/${request.asset.id}`}
                          className="group"
                        >
                          <p className="font-medium text-white group-hover:text-blue-300">
                            {request.asset.assetTag}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                            {request.asset.category?.name ?? "—"}
                          </p>
                        </Link>
                      </td>

                      <td className="max-w-[300px] px-6 py-4">
                        <p className="truncate text-sm text-zinc-300">
                          {request.reason}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getReturnStatusClasses(
                            request.status
                          )}`}
                        >
                          {formatEnum(request.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-400">
                       {formatDateTime(request.requestedAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/return-requests/${request.id}`}
                          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
                        >
                          View
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Software Licenses */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-400/10 p-2">
                <CreditCard className="h-4 w-4 text-emerald-300" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Software Licenses
                </h2>

                <p className="text-xs text-zinc-500">
                  Software licenses assigned to this employee
                </p>
              </div>
            </div>
          </div>

          {employee.licenseAssignments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-zinc-500">
              No software licenses assigned.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[750px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      License
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Vendor
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Status
                    </th>

                    <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Assigned
                    </th>

                    <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-zinc-500">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {employee.licenseAssignments.map((assignment) => (
                    <tr
                      key={assignment.id}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02]"
                    >
                      <td className="px-6 py-4">
                        <Link
                          href={`/licenses/${assignment.license.id}`}
                          className="group"
                        >
                          <p className="font-medium text-white group-hover:text-emerald-300">
                            {assignment.license.name}
                          </p>

                          <p className="mt-1 text-xs text-zinc-500">
                           {assignment.license.notes ?? "No additional license details"}
                          </p>
                        </Link>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-300">
                       {assignment.license.publisher ?? "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getLicenseStatusClasses(
                            assignment.license.status
                          )}`}
                        >
                          {formatEnum(assignment.license.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {formatDate(assignment.assignedAt)}
                      </td>

                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/licenses/${assignment.license.id}`}
                          className="inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-white"
                        >
                          View
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Account Metadata */}
        <section className="rounded-2xl border border-white/[0.08] bg-[#0b0f16]">
          <div className="border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-zinc-400/10 p-2">
                <BriefcaseBusiness className="h-4 w-4 text-zinc-300" />
              </div>

              <div>
                <h2 className="font-semibold text-white">
                  Account Metadata
                </h2>

                <p className="text-xs text-zinc-500">
                  System-level employee record information
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Employee ID
              </p>

              <p className="mt-2 break-all font-mono text-xs text-zinc-300">
                {employee.id}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Created
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {formatDateTime(employee.createdAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Last Updated
              </p>

              <p className="mt-2 text-sm text-zinc-300">
                {formatDateTime(employee.updatedAt)}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
                Record Status
              </p>

              <div className="mt-2">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${getStatusClasses(
                    employee.status
                  )}`}
                >
                  {employee.status === "ACTIVE" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}

                  {employee.status === "ACTIVE"
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.06] pt-6">
          <Link
            href="/employees"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:bg-white/[0.06] hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            All Employees
          </Link>

          <Link
            href={`/employees/${employee.id}/edit`}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:bg-zinc-200"
          >
            <Edit3 className="h-4 w-4" />
            Edit Employee
          </Link>
        </div>
      </div>
    </div>
  );
}