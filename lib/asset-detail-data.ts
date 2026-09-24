import { prisma } from "@/lib/prisma";

export async function getAssetDetail(assetId: string) {
  const asset = await prisma.asset.findUnique({
    where: {
      id: assetId,
    },
    include: {
      category: true,
      department: true,
      location: true,
    },
  });

  if (!asset) {
    return null;
  }

  const [
    allocations,
    returnRequests,
    maintenance,
    auditLogs,
  ] = await Promise.all([
    prisma.allocation.findMany({
      where: {
        assetId,
      },
      orderBy: {
        assignedAt: "desc",
      },
      include: {
        employee: {
          include: {
            department: true,
          },
        },
      },
    }),

    prisma.returnRequest.findMany({
      where: {
        assetId,
      },
      orderBy: {
        requestedAt: "desc",
      },
      include: {
        employee: true,
      },
    }),

    prisma.maintenanceRecord.findMany({
      where: {
        assetId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.auditLog.findMany({
      where: {
        entity: "Asset",
        entityId: assetId,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 30,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        },
      },
    }),
  ]);

  const activeAllocation =
    allocations.find(
      (allocation) =>
        allocation.status === "ACTIVE"
    ) ?? null;

  const pendingReturn =
    returnRequests.find(
      (request) =>
        request.status === "PENDING"
    ) ?? null;

  const openMaintenance =
    maintenance.find(
      (record) =>
        record.status === "OPEN" ||
        record.status === "IN_PROGRESS"
    ) ?? null;

  /*
   * Convert Prisma Decimal values into plain strings
   * before passing the data to a Client Component.
   */
  const serializedAsset = {
    ...asset,
    purchasePrice:
      asset.purchasePrice !== null
        ? asset.purchasePrice.toString()
        : null,
  };

  const serializedMaintenance = maintenance.map(
    (record) => ({
      ...record,
      cost:
        record.cost !== null
          ? record.cost.toString()
          : null,
    })
  );

  return {
    asset: serializedAsset,
    allocations,
    returnRequests,
    maintenance: serializedMaintenance,
    auditLogs,
    activeAllocation,
    pendingReturn,
    openMaintenance,
  };
}