import { notFound } from "next/navigation";

import { getAssetDetail } from "@/lib/asset-detail-data";
import { AssetCommandCenter } from "@/components/assets/asset-command-center";

export default async function AssetDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const data = await getAssetDetail(id);

  if (!data) {
    notFound();
  }

  return <AssetCommandCenter data={data} />;
}