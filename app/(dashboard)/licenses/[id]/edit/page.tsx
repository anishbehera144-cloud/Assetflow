import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { LicenseEditForm } from "@/components/licenses/license-edit-form";

function toDateInputValue(date: Date | null) {
  if (!date) {
    return "";
  }

  return date.toISOString().split("T")[0];
}

export default async function EditLicensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const license =
    await prisma.softwareLicense.findUnique({
      where: {
        id,
      },
      include: {
        assignments: {
          where: {
            revokedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
    });

  if (!license) {
    notFound();
  }

  const activeAssignments =
    license.assignments.length;

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <LicenseEditForm
          license={{
            id: license.id,
            name: license.name,
            publisher: license.publisher,
            licenseKey: license.licenseKey,
            totalSeats: license.totalSeats,
            availableSeats: license.availableSeats,
            purchaseDate: toDateInputValue(
              license.purchaseDate
            ),
            renewalDate: toDateInputValue(
              license.renewalDate
            ),
            status: license.status,
            notes: license.notes,
          }}
          activeAssignments={activeAssignments}
        />
      </div>
    </div>
  );
}