import {
  AssetStatus,
  AssetType,
  LicenseStatus,
  MaintenanceStatus,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";


export async function getReportsData() {
  
  const [
    totalAssets,
    totalEmployees,
    totalLicenses,
    totalMaintenance,
    assetStatusGroups,
    assetTypeGroups,
    licenseStatusGroups,
    maintenanceStatusGroups,
    categoryGroups,
    departmentGroups,
  ] = await Promise.all([
    /* -----------------------------------------------------
       Total assets
    ----------------------------------------------------- */

    prisma.asset.count(),

    /* -----------------------------------------------------
       Total employees
    ----------------------------------------------------- */

    prisma.employee.count(),

    /* -----------------------------------------------------
       Total software licenses
    ----------------------------------------------------- */

    prisma.softwareLicense.count(),

    /* -----------------------------------------------------
       Total maintenance records
    ----------------------------------------------------- */

    prisma.maintenanceRecord.count(),

    /* -----------------------------------------------------
       Assets by status
    ----------------------------------------------------- */

    prisma.asset.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),

    /* -----------------------------------------------------
       Assets by type
    ----------------------------------------------------- */

    prisma.asset.groupBy({
      by: ["assetType"],
      _count: {
        _all: true,
      },
    }),

    /* -----------------------------------------------------
       Licenses by status
    ----------------------------------------------------- */

    prisma.softwareLicense.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),

    /* -----------------------------------------------------
       Maintenance by status
    ----------------------------------------------------- */

    prisma.maintenanceRecord.groupBy({
      by: ["status"],
      _count: {
        _all: true,
      },
    }),

    /* -----------------------------------------------------
       Assets by category
    ----------------------------------------------------- */

    prisma.asset.groupBy({
      by: ["categoryId"],
      _count: {
        _all: true,
      },
    }),

    /* -----------------------------------------------------
       Employees by department
    ----------------------------------------------------- */

    prisma.employee.groupBy({
      by: ["departmentId"],
      _count: {
        _all: true,
      },
    }),
  ]);

  /* -------------------------------------------------------
     Resolve category names
  ------------------------------------------------------- */

  const categoryIds = Array.from(
    new Set(
      categoryGroups
        .map((item) => item.categoryId)
        .filter(
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

  /* -------------------------------------------------------
     Resolve department names
  ------------------------------------------------------- */

  const departmentIds = Array.from(
    new Set(
      departmentGroups
        .map((item) => item.departmentId)
        .filter(
          (id): id is string => Boolean(id)
        )
    )
  );

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

  /* -------------------------------------------------------
     Normalize asset status
  ------------------------------------------------------- */

  const assetsByStatus = Object.values(
    AssetStatus
  ).map((status) => {
    const item = assetStatusGroups.find(
      (group) => group.status === status
    );

    return {
      status,
      count: item?._count._all ?? 0,
    };
  });

  /* -------------------------------------------------------
     Normalize asset type
  ------------------------------------------------------- */

  const assetsByType = Object.values(
    AssetType
  ).map((type) => {
    const item = assetTypeGroups.find(
      (group) => group.assetType === type
    );

    return {
      type,
      count: item?._count._all ?? 0,
    };
  });

  /* -------------------------------------------------------
     Normalize license status
  ------------------------------------------------------- */

  const licensesByStatus =
    Object.values(LicenseStatus).map(
      (status) => {
        const item =
          licenseStatusGroups.find(
            (group) =>
              group.status === status
          );

        return {
          status,
          count: item?._count._all ?? 0,
        };
      }
    );

  /* -------------------------------------------------------
     Normalize maintenance status
  ------------------------------------------------------- */

  const maintenanceByStatus =
    Object.values(MaintenanceStatus).map(
      (status) => {
        const item =
          maintenanceStatusGroups.find(
            (group) =>
              group.status === status
          );

        return {
          status,
          count: item?._count._all ?? 0,
        };
      }
    );

  /* -------------------------------------------------------
     Normalize categories
  ------------------------------------------------------- */

  const assetsByCategory = categoryGroups
    .map((item) => ({
      category:
        categoryMap.get(
          item.categoryId ?? ""
        ) ?? "Uncategorized",

      count: item._count._all,
    }))
    .sort(
      (a, b) => b.count - a.count
    );

  /* -------------------------------------------------------
     Normalize departments
  ------------------------------------------------------- */

  const employeesByDepartment =
    departmentGroups
      .map((item) => ({
        department:
          departmentMap.get(
            item.departmentId ?? ""
          ) ?? "Unassigned",

        count: item._count._all,
      }))
      .sort(
        (a, b) => b.count - a.count
      );

  /* -------------------------------------------------------
     Derived KPIs
  ------------------------------------------------------- */

  const getStatusCount = (
    status: AssetStatus
  ) =>
    assetsByStatus.find(
      (item) => item.status === status
    )?.count ?? 0;

  const availableAssets =
    getStatusCount(
      AssetStatus.AVAILABLE
    );

  const assignedAssets =
    getStatusCount(
      AssetStatus.ASSIGNED
    );

  const repairAssets =
    getStatusCount(
      AssetStatus.IN_REPAIR
    );

  const returnRequestedAssets =
    getStatusCount(
      AssetStatus.RETURN_REQUESTED
    );

  const retiredAssets =
    getStatusCount(
      AssetStatus.RETIRED
    );

  const activeLicenses =
    licensesByStatus.find(
      (item) =>
        item.status ===
        LicenseStatus.ACTIVE
    )?.count ?? 0;

  const expiringLicenses =
    licensesByStatus.find(
      (item) =>
        item.status ===
        LicenseStatus.EXPIRING
    )?.count ?? 0;

  const expiredLicenses =
    licensesByStatus.find(
      (item) =>
        item.status ===
        LicenseStatus.EXPIRED
    )?.count ?? 0;

  /* -------------------------------------------------------
     Return report data
  ------------------------------------------------------- */

  return {
    totals: {
      assets: totalAssets,
      employees: totalEmployees,
      licenses: totalLicenses,
      maintenance: totalMaintenance,
    },

    assetSummary: {
      available: availableAssets,
      assigned: assignedAssets,
      inRepair: repairAssets,
      returnRequested:
        returnRequestedAssets,
      retired: retiredAssets,
    },

    licenseSummary: {
      active: activeLicenses,
      expiring: expiringLicenses,
      expired: expiredLicenses,
    },

    assetsByStatus,

    assetsByType,

    licensesByStatus,

    maintenanceByStatus,

    assetsByCategory,

    employeesByDepartment,
  };
}