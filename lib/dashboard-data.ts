import {
  AssetStatus,
  LicenseStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

export async function getDashboardData() {
  const [
    totalAssets,
    assignedAssets,
    availableAssets,
    repairAssets,
    returnRequests,
    retiredAssets,

    totalEmployees,
    activeEmployees,
    inactiveEmployees,

    totalLicenses,
    activeLicenses,
    expiringLicenses,
    expiredLicenses,
    suspendedLicenses,

    availableByCategory,
    assignedByCategory,
    repairByCategory,

    availableByDepartment,
    assignedByDepartment,
    repairByDepartment,
  ] = await Promise.all([
    prisma.asset.count(),

    prisma.asset.count({
      where: {
        status: AssetStatus.ASSIGNED,
      },
    }),

    prisma.asset.count({
      where: {
        status: AssetStatus.AVAILABLE,
      },
    }),

    prisma.asset.count({
      where: {
        status: AssetStatus.IN_REPAIR,
      },
    }),

    prisma.returnRequest.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.asset.count({
      where: {
        status: AssetStatus.RETIRED,
      },
    }),

    prisma.employee.count(),

    prisma.employee.count({
      where: {
        status: "ACTIVE",
      },
    }),

    prisma.employee.count({
      where: {
        status: "INACTIVE",
      },
    }),

    prisma.softwareLicense.count(),

    prisma.softwareLicense.count({
      where: {
        status: LicenseStatus.ACTIVE,
      },
    }),

    prisma.softwareLicense.count({
      where: {
        status: LicenseStatus.EXPIRING,
      },
    }),

    prisma.softwareLicense.count({
      where: {
        status: LicenseStatus.EXPIRED,
      },
    }),

    prisma.softwareLicense.count({
      where: {
        status: LicenseStatus.SUSPENDED,
      },
    }),

    // -----------------------------
    // Assets by category
    // -----------------------------

    prisma.asset.groupBy({
      by: ["categoryId"],
      where: {
        status: AssetStatus.AVAILABLE,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.asset.groupBy({
      by: ["categoryId"],
      where: {
        status: AssetStatus.ASSIGNED,
      },
      _count: {
        _all: true,
      },
    }),

    prisma.asset.groupBy({
      by: ["categoryId"],
      where: {
        status: AssetStatus.IN_REPAIR,
      },
      _count: {
        _all: true,
      },
    }),

    // -----------------------------
    // Assets by department
    // -----------------------------

    prisma.asset.groupBy({
      by: ["departmentId"],
      where: {
        status: AssetStatus.AVAILABLE,
        departmentId: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    }),

    prisma.asset.groupBy({
      by: ["departmentId"],
      where: {
        status: AssetStatus.ASSIGNED,
        departmentId: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    }),

    prisma.asset.groupBy({
      by: ["departmentId"],
      where: {
        status: AssetStatus.IN_REPAIR,
        departmentId: {
          not: null,
        },
      },
      _count: {
        _all: true,
      },
    }),
  ]);

  // --------------------------------
  // Resolve category names
  // --------------------------------

  const categoryIds = Array.from(
  new Set(
    [
      ...availableByCategory.map(
        (item) => item.categoryId
      ),
      ...assignedByCategory.map(
        (item) => item.categoryId
      ),
      ...repairByCategory.map(
        (item) => item.categoryId
      ),
    ].filter(
      (id): id is string => Boolean(id)
    )
  )
);

  const categories =
  categoryIds.length > 0
    ? await prisma.assetCategory.findMany({
        where: {
          id: {
            in: categoryIds,
          },
        },
        select: {
          id: true,
          name: true,
        },
      })
    : [];

  const categoryMap = new Map(
    categories.map((category) => [
      category.id,
      category.name,
    ])
  );

  const categoryAnalytics = categoryIds.map(
    (categoryId) => {
      const available =
        availableByCategory.find(
          (item) =>
            item.categoryId === categoryId
        )?._count._all ?? 0;

      const assigned =
        assignedByCategory.find(
          (item) =>
            item.categoryId === categoryId
        )?._count._all ?? 0;

      const repair =
        repairByCategory.find(
          (item) =>
            item.categoryId === categoryId
        )?._count._all ?? 0;

      return {
        name:
          categoryMap.get(categoryId) ??
          "Unknown",
        available,
        assigned,
        repair,
        total:
          available +
          assigned +
          repair,
      };
    }
  );

  // --------------------------------
  // Resolve department names
  // --------------------------------

  const departmentIds = Array.from(
    new Set([
      ...availableByDepartment
        .map((item) => item.departmentId)
        .filter(Boolean),
      ...assignedByDepartment
        .map((item) => item.departmentId)
        .filter(Boolean),
      ...repairByDepartment
        .map((item) => item.departmentId)
        .filter(Boolean),
    ])
  ) as string[];

  const departments =
    departmentIds.length > 0
      ? await prisma.department.findMany({
          where: {
            id: {
              in: departmentIds,
            },
          },
          select: {
            id: true,
            name: true,
          },
        })
      : [];

  const departmentMap = new Map(
    departments.map((department) => [
      department.id,
      department.name,
    ])
  );

  const departmentAnalytics =
    departmentIds.map((departmentId) => {
      const available =
        availableByDepartment.find(
          (item) =>
            item.departmentId === departmentId
        )?._count._all ?? 0;

      const assigned =
        assignedByDepartment.find(
          (item) =>
            item.departmentId === departmentId
        )?._count._all ?? 0;

      const repair =
        repairByDepartment.find(
          (item) =>
            item.departmentId === departmentId
        )?._count._all ?? 0;

      return {
        name:
          departmentMap.get(departmentId) ??
          "Unknown",
        available,
        assigned,
        repair,
        total:
          available +
          assigned +
          repair,
      };
    });

  return {
    assets: {
      total: totalAssets,
      assigned: assignedAssets,
      available: availableAssets,
      repair: repairAssets,
      returnRequests,
      retired: retiredAssets,
    },

    employees: {
      total: totalEmployees,
      active: activeEmployees,
      inactive: inactiveEmployees,
    },

    licenses: {
      total: totalLicenses,
      active: activeLicenses,
      expiring: expiringLicenses,
      expired: expiredLicenses,
      suspended: suspendedLicenses,
    },

    analytics: {
      categories: categoryAnalytics,
      departments: departmentAnalytics,
    },
  };
}