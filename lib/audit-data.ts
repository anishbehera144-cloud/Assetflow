import { prisma } from "@/lib/prisma";

export type AuditFilters = {
  search?: string;
  action?: string;
  entity?: string;
  from?: string;
  to?: string;
  page?: number;
  pageSize?: number;
};

export async function getAuditLogs(filters: AuditFilters = {}) {
  const {
    search = "",
    action = "",
    entity = "",
    from = "",
    to = "",
    page = 1,
    pageSize = 15,
  } = filters;

  const currentPage = Math.max(1, page);
  const safePageSize = Math.min(Math.max(1, pageSize), 50);

  const where = {
    ...(search
      ? {
          OR: [
            {
              action: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              entity: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              entityId: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              user: {
                OR: [
                  {
                    name: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                  {
                    email: {
                      contains: search,
                      mode: "insensitive" as const,
                    },
                  },
                ],
              },
            },
          ],
        }
      : {}),

    ...(action
      ? {
          action: {
            equals: action,
          },
        }
      : {}),

    ...(entity
      ? {
          entity: {
            equals: entity,
          },
        }
      : {}),

    ...(from || to
      ? {
          createdAt: {
            ...(from
              ? {
                  gte: new Date(`${from}T00:00:00`),
                }
              : {}),
            ...(to
              ? {
                  lte: new Date(`${to}T23:59:59.999`),
                }
              : {}),
          },
        }
      : {}),
  };

  const skip = (currentPage - 1) * safePageSize;

  const [logs, total] = await prisma.$transaction([
    prisma.auditLog.findMany({
      where,
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
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: safePageSize,
    }),

    prisma.auditLog.count({
      where,
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / safePageSize));

  return {
    logs,
    pagination: {
      page: currentPage,
      pageSize: safePageSize,
      total,
      totalPages,
    },
  };
}