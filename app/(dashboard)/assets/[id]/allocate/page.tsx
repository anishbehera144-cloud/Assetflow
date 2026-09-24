import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  UserPlus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AssetAllocationForm } from "@/components/assets/asset-allocation-form";

type AllocatePageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AllocateAssetPage({
  params,
}: AllocatePageProps) {
  const { id } = await params;

  const [asset, employees] = await Promise.all([
    prisma.asset.findUnique({
      where: {
        id,
      },
      include: {
        category: true,
      },
    }),

    /*
     * Only ACTIVE employees can receive new asset allocations.
     *
     * INACTIVE employees are intentionally excluded from
     * the allocation dropdown.
     */
    prisma.employee.findMany({
      where: {
        status: "ACTIVE",
      },
      orderBy: [
        {
          firstName: "asc",
        },
        {
          lastName: "asc",
        },
      ],
      include: {
        department: true,
      },
    }),
  ]);

  if (!asset) {
    notFound();
  }

  /*
   * Allocation is only allowed for AVAILABLE assets.
   */
  if (asset.status !== "AVAILABLE") {
    redirect(`/assets/${asset.id}`);
  }

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1000px]">

        {/* Back */}
        <Link
          href={`/assets/${asset.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Asset
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <UserPlus className="h-5 w-5 text-cyan-300" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Allocate Asset
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Assign this available asset to an active employee and
            record its checkout condition.
          </p>
        </div>

        <AssetAllocationForm
          assetId={asset.id}
          assetTag={asset.assetTag}
          model={asset.model}
          employees={employees}
        />
      </div>
    </div>
  );
}