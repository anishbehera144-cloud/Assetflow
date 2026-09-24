import Link from "next/link";
import { ArrowLeft, Wrench } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { MaintenanceForm } from "@/components/maintenance/maintenance-form";

export default async function NewMaintenancePage() {
  const assets = await prisma.asset.findMany({
    where: {
      status: "IN_REPAIR",
      maintenance: {
        none: {
          status: {
            in: ["OPEN", "IN_PROGRESS"],
          },
        },
      },
    },
    select: {
      id: true,
      assetTag: true,
      manufacturer: true,
      model: true,
      status: true,
    },
    orderBy: {
      assetTag: "asc",
    },
  });

  return (
    <div className="min-h-screen px-6 py-8 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/maintenance"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Maintenance
        </Link>

        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10">
            <Wrench className="h-6 w-6 text-orange-300" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Create Maintenance Record
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Record a repair or servicing event for an asset currently in the
            repair lifecycle.
          </p>
        </div>

        <MaintenanceForm assets={assets} />
      </div>
    </div>
  );
}