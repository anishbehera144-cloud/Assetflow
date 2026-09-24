"use server";

import { prisma } from "@/lib/prisma";

export async function assignLicenseToEmployee(
  licenseId: string,
  employeeId: string,
  notes?: string
) {
  try {
    const license = await prisma.softwareLicense.findUnique({
      where: {
        id: licenseId,
      },
    });

    if (!license) {
      return {
        success: false,
        error: "License not found",
      };
    }

    if (license.availableSeats <= 0) {
      return {
        success: false,
        error: "No available seats for this license",
      };
    }

    const employee = await prisma.employee.findUnique({
      where: {
        id: employeeId,
      },
    });

    if (!employee) {
      return {
        success: false,
        error: "Employee not found",
      };
    }

    if (employee.status !== "ACTIVE") {
      return {
        success: false,
        error: "Only active employees can be assigned licenses",
      };
    }

    const existingAssignment =
      await prisma.licenseAssignment.findFirst({
        where: {
          licenseId,
          employeeId,
          revokedAt: null,
        },
      });

    if (existingAssignment) {
      return {
        success: false,
        error: "This employee already has this license",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.licenseAssignment.create({
        data: {
          licenseId,
          employeeId,
          notes: notes?.trim() || undefined,
        },
      });

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
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error("assignLicenseToEmployee error:", error);

    return {
      success: false,
      error: "Failed to assign license",
    };
  }
}
export async function revokeLicenseAssignment(
  assignmentId: string
) {
  try {
    const assignment =
      await prisma.licenseAssignment.findUnique({
        where: {
          id: assignmentId,
        },
        include: {
          license: true,
          employee: true,
        },
      });

    if (!assignment) {
      return {
        success: false,
        error: "License assignment not found",
      };
    }

    if (assignment.revokedAt) {
      return {
        success: false,
        error: "This license assignment has already been revoked",
      };
    }

    await prisma.$transaction(async (tx) => {
      await tx.licenseAssignment.update({
        where: {
          id: assignmentId,
        },
        data: {
          revokedAt: new Date(),
        },
      });

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
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(
      "revokeLicenseAssignment error:",
      error
    );

    return {
      success: false,
      error: "Failed to revoke license assignment",
    };
  }
}
export async function updateLicense(
  licenseId: string,
  data: {
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
  }
) {
  try {
    const license =
      await prisma.softwareLicense.findUnique({
        where: {
          id: licenseId,
        },
      });

    if (!license) {
      return {
        success: false,
        error: "License not found",
      };
    }

    const activeAssignments =
      license.totalSeats - license.availableSeats;

    if (data.totalSeats < activeAssignments) {
      return {
        success: false,
        error: `Total seats cannot be lower than the ${activeAssignments} active assigned seats.`,
      };
    }

    const cleanName = data.name.trim();

    if (!cleanName) {
      return {
        success: false,
        error: "License name is required",
      };
    }

    if (data.totalSeats < 1) {
      return {
        success: false,
        error: "Total seats must be at least 1",
      };
    }

    const newAvailableSeats =
      data.totalSeats - activeAssignments;

    await prisma.softwareLicense.update({
      where: {
        id: licenseId,
      },
      data: {
        name: cleanName,
        publisher:
          data.publisher?.trim() || null,
        licenseKey:
          data.licenseKey?.trim() || null,
        totalSeats: data.totalSeats,
        availableSeats: newAvailableSeats,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : null,
        renewalDate: data.renewalDate
          ? new Date(data.renewalDate)
          : null,
        status: data.status,
        notes: data.notes?.trim() || null,
      },
    });

    return {
      success: true,
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