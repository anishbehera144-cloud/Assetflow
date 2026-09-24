import { AssetStatus } from "@prisma/client";

const transitions: Record<AssetStatus, AssetStatus[]> = {
  AVAILABLE: [
    AssetStatus.ASSIGNED,
    AssetStatus.RETIRED,
  ],

  ASSIGNED: [
    AssetStatus.RETURN_REQUESTED,
  ],

  RETURN_REQUESTED: [
    AssetStatus.IN_REPAIR,
    AssetStatus.AVAILABLE,
  ],

  IN_REPAIR: [
    AssetStatus.AVAILABLE,
    AssetStatus.RETIRED,
  ],

  RETIRED: [],
};

export function canTransition(
  from: AssetStatus,
  to: AssetStatus
): boolean {
  return transitions[from]?.includes(to) ?? false;
}

export function validateTransition(
  from: AssetStatus,
  to: AssetStatus
): void {
  if (!canTransition(from, to)) {
    throw new Error(
      `Invalid asset transition: ${from} → ${to}`
    );
  }
}