import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { EditEmployeeForm } from "@/components/employees/edit-employee-form";

type EditEmployeePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditEmployeePage({
  params,
}: EditEmployeePageProps) {
  const { id } = await params;

  const [employee, departments] = await Promise.all([
    prisma.employee.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        employeeCode: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        jobTitle: true,
        departmentId: true,
      },
    }),

    prisma.department.findMany({
      select: {
        id: true,
        name: true,
        code: true,
      },
      orderBy: {
        name: "asc",
      },
    }),
  ]);

  if (!employee) {
    notFound();
  }

  return (
    <EditEmployeeForm
      employee={employee}
      departments={departments}
    />
  );
}