import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RotateCcw } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AssetReturnForm } from "@/components/assets/asset-return-form";

export default async function AssetReturnPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const asset = await prisma.asset.findUnique({
    where: { id },
    include: {
      category: true,
      allocations: {
        where: {
          status: "ACTIVE",
        },
        include: {
          employee: true,
        },
        take: 1,
      },
      returnRequests: {
        where: {
          status: "PENDING",
        },
        take: 1,
      },
    },
  });

  if (!asset) {
    notFound();
  }

  if (asset.status !== "ASSIGNED") {
    redirect(`/assets/${asset.id}`);
  }

  if (asset.returnRequests.length > 0) {
    redirect(`/assets/${asset.id}`);
  }

  const activeAllocation = asset.allocations[0];

  if (!activeAllocation) {
    redirect(`/assets/${asset.id}`);
  }

  const employeeName =
    `${activeAllocation.employee.firstName} ${activeAllocation.employee.lastName}`.trim();

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        {/* Back */}
        <Link
          href={`/assets/${asset.id}`}
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to asset
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-amber-400/20 bg-amber-400/10">
            <RotateCcw className="h-6 w-6 text-amber-300" />
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-300/80">
            Asset Lifecycle
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Request Asset Return
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
            Create a return request for this assigned asset. Once submitted,
            the asset will move into the{" "}
            <span className="text-amber-300">Return Requested</span> state
            for IT processing.
          </p>
        </div>

        {/* Asset summary */}
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Asset
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {asset.assetTag}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Model
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {asset.model || "—"}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Current Assignee
            </p>
            <p className="mt-2 text-sm font-semibold text-white">
              {employeeName}
            </p>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-3xl border border-white/10 bg-white/[0.025] p-5 shadow-2xl shadow-black/20 sm:p-8">
          <AssetReturnForm
            assetId={asset.id}
            assetTag={asset.assetTag}
            employeeName={employeeName}
          />
        </div>
      </div>
    </div>
  );
}