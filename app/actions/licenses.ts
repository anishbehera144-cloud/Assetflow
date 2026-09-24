"use server";
import { requirePermission } from "@/lib/auth";
import { LicenseStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { licenseSchema } from "@/lib/validations";

/* =========================================================
   CREATE LICENSE
========================================================= */
await requirePermission("license.create");
export async function createLicense(
  formData: FormData
): Promise<

  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      licenseId: string;
    }
> {
  try {
    const rawData = {
      name: String(formData.get("name") ?? ""),
      publisher: String(formData.get("publisher") ?? ""),
      licenseKey: String(formData.get("licenseKey") ?? ""),
      totalSeats: formData.get("totalSeats"),
      purchaseDate: String(
        formData.get("purchaseDate") ?? ""
      ),
      renewalDate: String(
        formData.get("renewalDate") ?? ""
      ),
      status: String(
        formData.get("status") ?? "ACTIVE"
      ),
      notes: String(formData.get("notes") ?? ""),
    };

    const parsed = licenseSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Invalid license data",
      };
    }

    const data = parsed.data;

    /* -----------------------------------------------------
       Duplicate license check
    ----------------------------------------------------- */

    const existing = await prisma.softwareLicense.findFirst({
      where: {
        OR: [
          {
            name: {
              equals: data.name,
              mode: "insensitive",
            },
          },

          ...(data.licenseKey
            ? [
                {
                  licenseKey: {
                    equals: data.licenseKey,
                    mode: "insensitive" as const,
                  },
                },
              ]
            : []),
        ],
      },
    });

    if (existing) {
      const sameLicenseKey =
        existing.licenseKey &&
        data.licenseKey &&
        existing.licenseKey.toLowerCase() ===
          data.licenseKey.toLowerCase();

      return {
        success: false,
        error: sameLicenseKey
          ? "A license with this license key already exists"
          : "A license with this name already exists",
      };
    }

    /* -----------------------------------------------------
       Create license
    ----------------------------------------------------- */

    const license =
      await prisma.softwareLicense.create({
        data: {
          name: data.name,
          publisher: data.publisher || null,
          licenseKey: data.licenseKey || null,

          totalSeats: data.totalSeats,
          availableSeats: data.totalSeats,

          purchaseDate: data.purchaseDate
            ? new Date(data.purchaseDate)
            : null,

          renewalDate: data.renewalDate
            ? new Date(data.renewalDate)
            : null,

          status: data.status as LicenseStatus,

          notes: data.notes || null,
        },
      });

    /* -----------------------------------------------------
       Audit log

       IMPORTANT:
       AuditLog does NOT have a "details" field.
    ----------------------------------------------------- */

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "SoftwareLicense",
        entityId: license.id,
      },
    });

    revalidatePath("/licenses");
    revalidatePath(`/licenses/${license.id}`);

    return {
      success: true,
      licenseId: license.id,
    };
  } catch (error) {
    console.error(
      "createLicense error:",
      error
    );

    return {
      success: false,
      error: "Failed to create license",
    };
  }
}


/* =========================================================
   UPDATE LICENSE
========================================================= */
await requirePermission("license.update");
type UpdateLicenseData = {
  name: string;
  publisher?: string;
  licenseKey?: string;
  totalSeats: number;
  purchaseDate?: string;
  renewalDate?: string;
  status:
    | "ACTIVE"
    | "EXPIRING"
    | "EXPIRED"
    | "SUSPENDED";
  notes?: string;
};

export async function updateLicense(
  licenseId: string,
  formData: UpdateLicenseData
): Promise<
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      licenseId: string;
    }
> {
  try {
    /* -----------------------------------------------------
       Convert the object from the client form into the
       structure expected by licenseSchema.
    ----------------------------------------------------- */

    const rawData = {
      name: formData.name,
      publisher: formData.publisher ?? "",
      licenseKey: formData.licenseKey ?? "",
      totalSeats: formData.totalSeats,
      purchaseDate: formData.purchaseDate ?? "",
      renewalDate: formData.renewalDate ?? "",
      status: formData.status,
      notes: formData.notes ?? "",
    };

    const parsed = licenseSchema.safeParse(rawData);

    if (!parsed.success) {
      return {
        success: false,
        error:
          parsed.error.issues[0]?.message ??
          "Invalid license data",
      };
    }

    const data = parsed.data;

    /* -----------------------------------------------------
       Find existing license and active assignments
    ----------------------------------------------------- */

    const existingLicense =
      await prisma.softwareLicense.findUnique({
        where: {
          id: licenseId,
        },
        include: {
          assignments: {
            where: {
              revokedAt: null,
            },
          },
        },
      });

    if (!existingLicense) {
      return {
        success: false,
        error: "License not found",
      };
    }

    const usedSeats =
      existingLicense.assignments.length;

    /* -----------------------------------------------------
       Prevent reducing seats below active assignments
    ----------------------------------------------------- */

    if (data.totalSeats < usedSeats) {
      return {
        success: false,
        error: `Total seats cannot be lower than the ${usedSeats} currently assigned seats`,
      };
    }

    /* -----------------------------------------------------
       Duplicate license key check
    ----------------------------------------------------- */

    if (data.licenseKey) {
      const duplicateKey =
        await prisma.softwareLicense.findFirst({
          where: {
            licenseKey: {
              equals: data.licenseKey,
              mode: "insensitive",
            },

            NOT: {
              id: licenseId,
            },
          },
        });

      if (duplicateKey) {
        return {
          success: false,
          error:
            "Another license already uses this license key",
        };
      }
    }

    /* -----------------------------------------------------
       Duplicate license name check
    ----------------------------------------------------- */

    const duplicateName =
      await prisma.softwareLicense.findFirst({
        where: {
          name: {
            equals: data.name,
            mode: "insensitive",
          },

          NOT: {
            id: licenseId,
          },
        },
      });

    if (duplicateName) {
      return {
        success: false,
        error:
          "Another license already uses this name",
      };
    }

    /* -----------------------------------------------------
       Calculate available seats

       available = total - active assignments
    ----------------------------------------------------- */

    const availableSeats =
      data.totalSeats - usedSeats;

    /* -----------------------------------------------------
       Update license
    ----------------------------------------------------- */
  
    const updatedLicense =
      await prisma.softwareLicense.update({
        where: {
          id: licenseId,
        },

        data: {
          name: data.name,

          publisher:
            data.publisher || null,

          licenseKey:
            data.licenseKey || null,

          totalSeats: data.totalSeats,

          availableSeats,

          purchaseDate: data.purchaseDate
            ? new Date(data.purchaseDate)
            : null,

          renewalDate: data.renewalDate
            ? new Date(data.renewalDate)
            : null,

          status:
            data.status as LicenseStatus,

          notes:
            data.notes || null,
        },
      });

    /* -----------------------------------------------------
       Audit log
    ----------------------------------------------------- */

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "SoftwareLicense",
        entityId: updatedLicense.id,
      },
    });

    /* -----------------------------------------------------
       Revalidate pages
    ----------------------------------------------------- */

    revalidatePath("/licenses");

    revalidatePath(
      `/licenses/${licenseId}`
    );

    revalidatePath(
      `/licenses/${licenseId}/edit`
    );

    return {
      success: true,
      licenseId: updatedLicense.id,
    };
  } catch (error) {
    console.error(
      "updateLicense error:",
      error
    );

    return {
      success: false,
      error: "Failed to update license",
    };
  }
}


/* =========================================================
   ASSIGN LICENSE TO EMPLOYEE
========================================================= */
await requirePermission("license.assign");
export async function assignLicenseToEmployee(
  licenseId: string,
  employeeId: string,
  notes: string = ""
): Promise<
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      licenseId: string;
      assignmentId: string;
    }
> {
  try {
    const result =
      await prisma.$transaction(async (tx) => {
        /* -------------------------------------------------
           Find license
        ------------------------------------------------- */

        const license =
          await tx.softwareLicense.findUnique({
            where: {
              id: licenseId,
            },
          });

        if (!license) {
          throw new Error(
            "License not found"
          );
        }

        /* -------------------------------------------------
           Check available seats
        ------------------------------------------------- */

        if (license.availableSeats <= 0) {
          throw new Error(
            "No available seats remain for this license"
          );
        }

        /* -------------------------------------------------
           Find employee
        ------------------------------------------------- */

        const employee =
          await tx.employee.findUnique({
            where: {
              id: employeeId,
            },
          });

        if (!employee) {
          throw new Error(
            "Employee not found"
          );
        }

        /* -------------------------------------------------
           Only active employees
        ------------------------------------------------- */

        if (employee.status !== "ACTIVE") {
          throw new Error(
            "License can only be assigned to an active employee"
          );
        }

        /* -------------------------------------------------
           Prevent duplicate active assignment
        ------------------------------------------------- */

        const existingAssignment =
          await tx.licenseAssignment.findFirst({
            where: {
              licenseId,
              employeeId,
              revokedAt: null,
            },
          });

        if (existingAssignment) {
          throw new Error(
            "This employee already has an active assignment for this license"
          );
        }

        /* -------------------------------------------------
           Decrease available seats
        ------------------------------------------------- */

        const updatedLicense =
          await tx.softwareLicense.update({
            where: {
              id: licenseId,
            },

            data: {
              availableSeats: {
                decrement: 1,
              },
            },
          });

        /* -------------------------------------------------
           Create assignment
        ------------------------------------------------- */

        const assignment =
          await tx.licenseAssignment.create({
            data: {
              licenseId,
              employeeId,
              assignedAt: new Date(),
              notes: notes.trim() || null,
            },
          });

        /* -------------------------------------------------
           Audit log
        ------------------------------------------------- */

        await tx.auditLog.create({
          data: {
            action: "CREATE",
            entity: "LicenseAssignment",
            entityId: assignment.id,
          },
        });

        return {
          licenseId: updatedLicense.id,
          assignmentId: assignment.id,
        };
      });

    /* -----------------------------------------------------
       Revalidate
    ----------------------------------------------------- */

    revalidatePath("/licenses");

    revalidatePath(
      `/licenses/${licenseId}`
    );

    revalidatePath(
      `/licenses/${licenseId}/assign`
    );

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error(
      "assignLicenseToEmployee error:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to assign license",
    };
  }
}


/* =========================================================
   REVOKE LICENSE ASSIGNMENT
========================================================= */
await requirePermission("license.assign");
export async function revokeLicenseAssignment(
  assignmentId: string
): Promise<
  | {
      success: false;
      error: string;
    }
  | {
      success: true;
      licenseId: string;
      assignmentId: string;
    }
> {
  try {
    const result =
      await prisma.$transaction(
        async (tx) => {
          /* -----------------------------------------------
             Find assignment
          ------------------------------------------------ */

          const assignment =
            await tx.licenseAssignment.findUnique({
              where: {
                id: assignmentId,
              },

              include: {
                license: true,
                employee: true,
              },
            });

          if (!assignment) {
            throw new Error(
              "License assignment not found"
            );
          }

          /* -----------------------------------------------
             Prevent double revoke
          ------------------------------------------------ */

          if (assignment.revokedAt) {
            throw new Error(
              "This license assignment has already been revoked"
            );
          }

          /* -----------------------------------------------
             Revoke assignment
          ------------------------------------------------ */

          const updatedAssignment =
            await tx.licenseAssignment.update({
              where: {
                id: assignmentId,
              },

              data: {
                revokedAt: new Date(),
              },
            });

          /* -----------------------------------------------
             Return seat to license
          ------------------------------------------------ */

          await tx.softwareLicense.update({
            where: {
              id: assignment.licenseId,
            },

            data: {
              availableSeats: {
                increment: 1,
              },
            },
          });

          /* -----------------------------------------------
             Audit log
          ------------------------------------------------ */

          await tx.auditLog.create({
            data: {
              action: "UPDATE",
              entity: "LicenseAssignment",
              entityId: assignment.id,
            },
          });

          return {
            licenseId:
              assignment.licenseId,

            assignmentId:
              updatedAssignment.id,
          };
        }
      );

    /* -----------------------------------------------------
       Revalidate pages
    ----------------------------------------------------- */

    revalidatePath("/licenses");

    revalidatePath(
      `/licenses/${result.licenseId}`
    );

    revalidatePath(
      `/licenses/${result.licenseId}/assign`
    );

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    console.error(
      "revokeLicenseAssignment error:",
      error
    );

    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to revoke license",
    };
  }
}