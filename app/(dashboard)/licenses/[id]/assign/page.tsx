import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { LicenseAssignmentForm } from "@/components/licenses/license-assignment-form";

export default async function AssignLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const license = await prisma.softwareLicense.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      name: true,
      availableSeats: true,
    },
  });

  if (!license) {
    notFound();
  }

  const employees = await prisma.employee.findMany({
    where: {
      status: "ACTIVE",
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      employeeCode: true,
      department: {
        select: {
          name: true,
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
  });

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <LicenseAssignmentForm
          licenseId={license.id}
          licenseName={license.name}
          availableSeats={license.availableSeats}
          employees={employees}
        />
      </div>
    </div>
  );
}