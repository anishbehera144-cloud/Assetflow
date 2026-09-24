import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Package,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AssetEditForm } from "@/components/assets/asset-edit-form";

type EditAssetPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditAssetPage({
  params,
}: EditAssetPageProps) {
  const { id } = await params;

  const [asset, categories, departments, locations] =
    await Promise.all([
      prisma.asset.findUnique({
        where: {
          id,
        },
      }),

      prisma.assetCategory.findMany({
        orderBy: {
          name: "asc",
        },
      }),

      prisma.department.findMany({
        orderBy: {
          name: "asc",
        },
      }),

      prisma.location.findMany({
        orderBy: {
          name: "asc",
        },
      }),
    ]);

  if (!asset) {
    notFound();
  }

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">
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
            <Edit3 className="h-5 w-5 text-cyan-300" />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-white">
                Edit Asset
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Update the inventory information for{" "}
                <span className="text-slate-300">
                  {asset.assetTag}
                </span>
                .
              </p>
            </div>

            <div className="inline-flex items-center gap-2 self-start rounded-xl border border-white/10 bg-white/[0.025] px-3 py-2 text-xs text-slate-400 sm:self-auto">
              <Package className="h-4 w-4 text-cyan-300" />
              {asset.assetTag}
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mb-6 rounded-2xl border border-amber-400/10 bg-amber-400/[0.04] px-4 py-3 text-xs leading-5 text-slate-500">
          Asset lifecycle status is managed separately to protect
          allocation and servicing workflows. This form updates
          inventory information only.
        </div>

        <AssetEditForm
          asset={{
            id: asset.id,
            assetTag: asset.assetTag,
            assetType: asset.assetType,
            categoryId: asset.categoryId,
            manufacturer: asset.manufacturer,
            model: asset.model,
            serialNumber: asset.serialNumber,
            purchaseDate: asset.purchaseDate,
            purchasePrice: asset.purchasePrice
              ? String(asset.purchasePrice)
              : null,
            warrantyExpiry: asset.warrantyExpiry,
            departmentId: asset.departmentId,
            locationId: asset.locationId,
            notes: asset.notes,
          }}
          categories={categories}
          departments={departments}
          locations={locations}
        />
      </div>
    </div>
  );
}