import Link from "next/link";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Mail,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { prisma } from "@/lib/prisma";

type EmployeesPageProps = {
  searchParams: Promise<{
    q?: string;
    department?: string;
    status?: string;
    page?: string;
  }>;
};

const PAGE_SIZE = 10;

function getPageNumber(value?: string) {
  const page = Number(value);

  if (!Number.isFinite(page) || page < 1) {
    return 1;
  }

  return Math.floor(page);
}

function getEmployeeStatus(value?: string) {
  if (value === "ACTIVE" || value === "INACTIVE") {
    return value;
  }

  return "ALL";
}

export default async function EmployeesPage({
  searchParams,
}: EmployeesPageProps) {
  const params = await searchParams;

  const query = params.q?.trim() || "";
  const departmentId = params.department || "";
  const status = getEmployeeStatus(params.status);
  const page = getPageNumber(params.page);

  const where = {
    ...(query
      ? {
          OR: [
            {
              employeeCode: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              firstName: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              lastName: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
            {
              email: {
                contains: query,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {}),

    ...(departmentId
      ? {
          departmentId,
        }
      : {}),

    ...(status !== "ALL"
      ? {
          status: status as "ACTIVE" | "INACTIVE",
        }
      : {}),
  };

  const [employees, totalEmployees, departments] =
    await Promise.all([
      prisma.employee.findMany({
        where,
        include: {
          department: true,
          _count: {
            select: {
              allocations: true,
              returnRequests: true,
              licenseAssignments: true,
            },
          },
        },
        orderBy: [
          {
            firstName: "asc",
          },
          {
            lastName: "asc",
          },
        ],
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
      }),

      prisma.employee.count({
        where,
      }),

      prisma.department.findMany({
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  const totalPages = Math.max(
    1,
    Math.ceil(totalEmployees / PAGE_SIZE)
  );

  const currentPage = Math.min(page, totalPages);

  function buildUrl(nextPage: number) {
    const search = new URLSearchParams();

    if (query) {
      search.set("q", query);
    }

    if (departmentId) {
      search.set("department", departmentId);
    }

    if (status !== "ALL") {
      search.set("status", status);
    }

    if (nextPage > 1) {
      search.set("page", String(nextPage));
    }

    const queryString = search.toString();

    return queryString
      ? `/employees?${queryString}`
      : "/employees";
  }

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">

        {/* HEADER */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-blue-400/20 bg-blue-400/10">
                <Users className="h-5 w-5 text-blue-300" />
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-300">
                  People
                </p>

                <h1 className="text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                  Employees
                </h1>
              </div>
            </div>

            <p className="max-w-2xl text-sm leading-6 text-slate-500">
              Manage employees, departments, assigned assets and
              software access from one centralized directory.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-slate-400">
              <span className="font-medium text-white">
                {totalEmployees}
              </span>{" "}
              employees
            </div>

            <Link
              href="/employees/new"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-orange-300"
            >
              <Plus className="h-4 w-4" />
              New Employee
            </Link>
          </div>
        </div>

        {/* SEARCH + FILTERS */}
        <form
          method="GET"
          className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
        >
          <div className="grid gap-3 lg:grid-cols-[1fr_240px_180px_auto]">

            {/* SEARCH */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />

              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search employee name, code or email..."
                className="h-11 w-full rounded-xl border border-white/10 bg-black/20 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-600 focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/10"
              />
            </div>

            {/* DEPARTMENT */}
            <select
              name="department"
              defaultValue={departmentId}
              className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-slate-200 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/10"
            >
              <option value="">All Departments</option>

              {departments.map((department) => (
                <option
                  key={department.id}
                  value={department.id}
                >
                  {department.name}
                </option>
              ))}
            </select>

            {/* STATUS */}
            <select
              name="status"
              defaultValue={status}
              className="h-11 rounded-xl border border-white/10 bg-black/20 px-3 text-sm text-slate-200 outline-none transition focus:border-orange-400/50 focus:ring-2 focus:ring-orange-400/10"
            >
              <option value="ALL">All Status</option>

              <option value="ACTIVE">Active</option>

              <option value="INACTIVE">Inactive</option>
            </select>

            {/* APPLY */}
            <button
              type="submit"
              className="h-11 rounded-xl border border-white/10 bg-white/[0.06] px-5 text-sm font-medium text-white transition hover:bg-white/[0.1]"
            >
              Apply Filters
            </button>
          </div>
        </form>

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">

              <thead className="border-b border-white/10 bg-white/[0.02]">
                <tr>
                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Employee
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Department
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Job Title
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Assets
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Requests
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5">
                {employees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="transition hover:bg-white/[0.025]"
                  >

                    {/* EMPLOYEE */}
                    <td className="px-5 py-4">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="group flex items-center gap-3"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.05] text-sm font-semibold text-slate-300">
                          {employee.firstName.charAt(0)}
                          {employee.lastName.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium text-white transition group-hover:text-orange-300">
                            {employee.firstName}{" "}
                            {employee.lastName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-500">
                            {employee.employeeCode}
                          </p>
                        </div>
                      </Link>
                    </td>

                    {/* DEPARTMENT */}
                    <td className="px-5 py-4">
                      {employee.department ? (
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Building2 className="h-4 w-4 text-slate-500" />
                          {employee.department.name}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-600">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* JOB TITLE */}
                    <td className="px-5 py-4">
                      <p className="text-sm text-slate-300">
                        {employee.jobTitle || "—"}
                      </p>

                      <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-600">
                        <Mail className="h-3.5 w-3.5" />
                        {employee.email}
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-5 py-4">
                      {employee.status === "ACTIVE" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-xs font-medium text-emerald-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-400/20 bg-slate-400/10 px-2.5 py-1 text-xs font-medium text-slate-400">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                          Inactive
                        </span>
                      )}
                    </td>

                    {/* ASSETS */}
                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-lg border border-blue-400/20 bg-blue-400/10 px-2.5 py-1 text-xs font-semibold text-blue-300">
                        {employee._count.allocations}
                      </span>
                    </td>

                    {/* REQUESTS */}
                    <td className="px-5 py-4">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-lg border border-orange-400/20 bg-orange-400/10 px-2.5 py-1 text-xs font-semibold text-orange-300">
                        {employee._count.returnRequests}
                      </span>
                    </td>

                    {/* ACTION */}
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/employees/${employee.id}`}
                        className="inline-flex items-center rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-medium text-slate-300 transition hover:bg-white/[0.08] hover:text-white"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}

                {employees.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
                        <Users className="h-5 w-5 text-slate-600" />
                      </div>

                      <h3 className="mt-4 font-medium text-white">
                        No employees found
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search, department, or
                        status filter.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {totalEmployees > 0 && (
            <div className="flex flex-col gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <p className="text-sm text-slate-500">
                Showing{" "}
                <span className="font-medium text-slate-300">
                  {(currentPage - 1) * PAGE_SIZE + 1}
                </span>{" "}
                to{" "}
                <span className="font-medium text-slate-300">
                  {Math.min(
                    currentPage * PAGE_SIZE,
                    totalEmployees
                  )}
                </span>{" "}
                of{" "}
                <span className="font-medium text-slate-300">
                  {totalEmployees}
                </span>
              </p>

              <div className="flex items-center gap-2">

                {/* PREVIOUS */}
                <Link
                  href={buildUrl(currentPage - 1)}
                  aria-disabled={currentPage <= 1}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm transition ${
                    currentPage <= 1
                      ? "pointer-events-none border-white/5 text-slate-700"
                      : "border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>

                {/* PAGE INDICATOR */}
                <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-slate-400">
                  Page{" "}
                  <span className="font-semibold text-white">
                    {currentPage}
                  </span>{" "}
                  of {totalPages}
                </div>

                {/* NEXT */}
                <Link
                  href={buildUrl(currentPage + 1)}
                  aria-disabled={currentPage >= totalPages}
                  className={`inline-flex h-9 items-center gap-1 rounded-lg border px-3 text-sm transition ${
                    currentPage >= totalPages
                      ? "pointer-events-none border-white/5 text-slate-700"
                      : "border-white/10 text-slate-300 hover:bg-white/[0.06] hover:text-white"
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>

              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}