"use server";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export type GlobalSearchResult = {
  assets: Array<{
    id: string;
    assetTag: string;
    model: string | null;
    manufacturer: string | null;
    serialNumber: string | null;
    status: string;
    department: string | null;
  }>;

  employees: Array<{
    id: string;
    employeeCode: string;
    firstName: string;
    lastName: string;
    email: string;
    jobTitle: string | null;
    status: string;
    department: string | null;
  }>;

  licenses: Array<{
    id: string;
    name: string;
    publisher: string | null;
    licenseKey: string | null;
    totalSeats: number;
    availableSeats: number;
    status: string;
  }>;
};

export async function globalSearch(
  query: string
): Promise<GlobalSearchResult> {
  await requireSession();

  const search = query.trim();

  if (!search) {
    return {
      assets: [],
      employees: [],
      licenses: [],
    };
  }

  const [assets, employees, licenses] =
    await Promise.all([
      prisma.asset.findMany({
        where: {
          OR: [
            {
              assetTag: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              serialNumber: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              model: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              manufacturer: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              department: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
            {
              allocations: {
                some: {
                  status: "ACTIVE",
                  employee: {
                    OR: [
                      {
                        firstName: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                      {
                        lastName: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                      {
                        employeeCode: {
                          contains: search,
                          mode: "insensitive",
                        },
                      },
                    ],
                  },
                },
              },
            },
          ],
        },
        select: {
          id: true,
          assetTag: true,
          model: true,
          manufacturer: true,
          serialNumber: true,
          status: true,
          department: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),

      prisma.employee.findMany({
        where: {
          OR: [
            {
              employeeCode: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              firstName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              lastName: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              email: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              jobTitle: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              department: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          ],
        },
        select: {
          id: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          email: true,
          jobTitle: true,
          status: true,
          department: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          firstName: "asc",
        },
        take: 6,
      }),

      prisma.softwareLicense.findMany({
        where: {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              publisher: {
                contains: search,
                mode: "insensitive",
              },
            },
            {
              licenseKey: {
                contains: search,
                mode: "insensitive",
              },
            },
          ],
        },
        select: {
          id: true,
          name: true,
          publisher: true,
          licenseKey: true,
          totalSeats: true,
          availableSeats: true,
          status: true,
        },
        orderBy: {
          name: "asc",
        },
        take: 6,
      }),
    ]);

  return {
    assets: assets.map((asset) => ({
      id: asset.id,
      assetTag: asset.assetTag,
      model: asset.model,
      manufacturer: asset.manufacturer,
      serialNumber: asset.serialNumber,
      status: asset.status,
      department: asset.department?.name ?? null,
    })),

    employees: employees.map((employee) => ({
      id: employee.id,
      employeeCode: employee.employeeCode,
      firstName: employee.firstName,
      lastName: employee.lastName,
      email: employee.email,
      jobTitle: employee.jobTitle,
      status: employee.status,
      department: employee.department?.name ?? null,
    })),

    licenses: licenses.map((license) => ({
      id: license.id,
      name: license.name,
      publisher: license.publisher,
      licenseKey: license.licenseKey,
      totalSeats: license.totalSeats,
      availableSeats: license.availableSeats,
      status: license.status,
    })),
  };
}