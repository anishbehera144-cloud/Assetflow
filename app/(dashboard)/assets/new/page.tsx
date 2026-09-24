import Link from "next/link";
import {
  ArrowLeft,
  Boxes,
  CalendarDays,
  MapPin,
  PackagePlus,
} from "lucide-react";

import { prisma } from "@/lib/prisma";
import { AssetForm } from "@/components/assets/asset-form";

export default async function NewAssetPage() {
  const [categories, departments, locations] = await Promise.all([
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

  return (
    <div className="min-h-[calc(100vh-76px)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1200px]">

        {/* Back button */}
        <Link
          href="/assets"
          className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assets
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <PackagePlus className="h-5 w-5 text-cyan-300" />
          </div>

          <h1 className="text-3xl font-semibold tracking-tight text-white">
            Add Asset
          </h1>

          <p className="mt-2 max-w-2xl text-sm text-slate-500">
            Register a new company asset and add it to the ASSETFLOW
            inventory.
          </p>
        </div>

        {/* Information cards */}
        <div className="mb-6 grid gap-3 md:grid-cols-3">
          <InfoCard
            icon={<Boxes className="h-4 w-4" />}
            title="Lifecycle"
            text="New assets start as Available."
          />

          <InfoCard
            icon={<CalendarDays className="h-4 w-4" />}
            title="Purchase"
            text="Record purchase and warranty information."
          />

          <InfoCard
            icon={<MapPin className="h-4 w-4" />}
            title="Location"
            text="Associate the asset with a department and location."
          />
        </div>

        {/* Asset form */}
        <AssetForm
          categories={categories}
          departments={departments}
          locations={locations}
        />
      </div>
    </div>
  );
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-cyan-300">
        {icon}
      </div>

      <p className="text-sm font-medium text-white">
        {title}
      </p>

      <p className="mt-1 text-xs leading-5 text-slate-500">
        {text}
      </p>
    </div>
  );
}