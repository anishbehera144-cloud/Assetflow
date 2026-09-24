import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { EmployeeForm } from "@/components/employees/employee-form";

export default async function NewEmployeePage() {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      name: true,
      code: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div>
      <div className="mx-auto hidden max-w-4xl px-4 pt-8 sm:px-6 lg:px-8">
        <Link
          href="/employees"
          className="inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Employees
        </Link>
      </div>

      <EmployeeForm departments={departments} />
    </div>
  );
}