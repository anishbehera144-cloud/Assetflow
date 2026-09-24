"use server";

import {
  AssetStatus,
  EmployeeStatus,
  NotificationPriority,
  NotificationType,
  Role,
} from "@prisma/client";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { createNotification } from "@/lib/notifications";
import { prisma } from "@/lib/prisma";
import { assetSchema } from "@/lib/validations";

async function notifyMaintenanceITUsers(input: {
  title: string;
  message: string;
  priority?: NotificationPriority;
  entityId: string;
  href: string;
}) {
  const users = await prisma.user.findMany({
    where: {
      role: {
        in: [Role.ADMIN, Role.IT_MANAGER, Role.IT_STAFF],
      },
    },
    select: { id: true },
  });

  await Promise.all(
    users.map((user) =>
      createNotification({
        userId: user.id,
        type: NotificationType.MAINTENANCE,
        priority: input.priority ?? NotificationPriority.NORMAL,
        title: input.title,
        message: input.message,
        entity: "MaintenanceRecord",
        entityId: input.entityId,
        href: input.href,
      })
    )
  );
}

async function notifyMaintenanceEmployee(input: {
  employeeId: string | null;
  title: string;
  message: string;
  priority?: NotificationPriority;
  entityId: string;
  href: string;
}) {
  if (!input.employeeId) return;

  const user = await prisma.user.findUnique({
    where: { employeeId: input.employeeId },
    select: { id: true },
  });

  if (!user) return;

  await createNotification({
    userId: user.id,
    type: NotificationType.MAINTENANCE,
    priority: input.priority ?? NotificationPriority.NORMAL,
    title: input.title,
    message: input.message,
    entity: "MaintenanceRecord",
    entityId: input.entityId,
    href: input.href,
  });
}

export type CreateAssetState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createAsset(
  _previousState: CreateAssetState,
  formData: FormData
): Promise<CreateAssetState> {
  await requirePermission("asset.create");
  const rawData = {
    assetTag: String(formData.get("assetTag") || ""),
    assetType: String(formData.get("assetType") || ""),
    categoryId: String(formData.get("categoryId") || ""),
    manufacturer:
      String(formData.get("manufacturer") || "") || undefined,
    model:
      String(formData.get("model") || "") || undefined,
    serialNumber:
      String(formData.get("serialNumber") || "") || undefined,
    purchaseDate:
      String(formData.get("purchaseDate") || "") || undefined,
    purchasePrice:
      String(formData.get("purchasePrice") || "") || undefined,
    warrantyExpiry:
      String(formData.get("warrantyExpiry") || "") || undefined,
    departmentId:
      String(formData.get("departmentId") || "") || undefined,
    locationId:
      String(formData.get("locationId") || "") || undefined,
    notes:
      String(formData.get("notes") || "") || undefined,
  };

  const parsed = assetSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existingAsset = await prisma.asset.findUnique({
      where: {
        assetTag: data.assetTag,
      },
    });

    if (existingAsset) {
      return {
        success: false,
        message: "An asset with this asset tag already exists.",
        errors: {
          assetTag: ["Asset tag must be unique."],
        },
      };
    }

    if (data.serialNumber) {
      const existingSerial = await prisma.asset.findUnique({
        where: {
          serialNumber: data.serialNumber,
        },
      });

      if (existingSerial) {
        return {
          success: false,
          message:
            "An asset with this serial number already exists.",
          errors: {
            serialNumber: ["Serial number must be unique."],
          },
        };
      }
    }

    const asset = await prisma.asset.create({
      data: {
        assetTag: data.assetTag,
        assetType: data.assetType,
        categoryId: data.categoryId,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : undefined,
        purchasePrice:
          data.purchasePrice !== undefined
            ? data.purchasePrice
            : undefined,
        warrantyExpiry: data.warrantyExpiry
          ? new Date(data.warrantyExpiry)
          : undefined,
        departmentId: data.departmentId || undefined,
        locationId: data.locationId || undefined,
        notes: data.notes,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "CREATE",
        entity: "Asset",
        entityId: asset.id,
        newValue: {
          assetTag: asset.assetTag,
          assetType: asset.assetType,
          status: asset.status,
        },
      },
    });

    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Asset created successfully.",
    };
  } catch (error) {
    console.error("CREATE_ASSET_ERROR", error);

    return {
      success: false,
      message: "Unable to create the asset. Please try again.",
    };
  }
}

export type UpdateAssetState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateAsset(
  assetId: string,
  _previousState: UpdateAssetState,
  formData: FormData
): Promise<UpdateAssetState> {
  await requirePermission("asset.update");
  const rawData = {
    assetTag: String(formData.get("assetTag") || ""),
    assetType: String(formData.get("assetType") || ""),
    categoryId: String(formData.get("categoryId") || ""),
    manufacturer:
      String(formData.get("manufacturer") || "") || undefined,
    model:
      String(formData.get("model") || "") || undefined,
    serialNumber:
      String(formData.get("serialNumber") || "") || undefined,
    purchaseDate:
      String(formData.get("purchaseDate") || "") || undefined,
    purchasePrice:
      String(formData.get("purchasePrice") || "") || undefined,
    warrantyExpiry:
      String(formData.get("warrantyExpiry") || "") || undefined,
    departmentId:
      String(formData.get("departmentId") || "") || undefined,
    locationId:
      String(formData.get("locationId") || "") || undefined,
    notes:
      String(formData.get("notes") || "") || undefined,
  };

  const parsed = assetSchema.safeParse(rawData);

  if (!parsed.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const data = parsed.data;

  try {
    const existingAsset = await prisma.asset.findUnique({
      where: {
        id: assetId,
      },
    });

    if (!existingAsset) {
      return {
        success: false,
        message: "Asset not found.",
      };
    }

    const duplicateAssetTag = await prisma.asset.findFirst({
      where: {
        assetTag: data.assetTag,
        NOT: {
          id: assetId,
        },
      },
    });

    if (duplicateAssetTag) {
      return {
        success: false,
        message: "An asset with this asset tag already exists.",
        errors: {
          assetTag: ["Asset tag must be unique."],
        },
      };
    }

    if (data.serialNumber) {
      const duplicateSerial = await prisma.asset.findFirst({
        where: {
          serialNumber: data.serialNumber,
          NOT: {
            id: assetId,
          },
        },
      });

      if (duplicateSerial) {
        return {
          success: false,
          message:
            "An asset with this serial number already exists.",
          errors: {
            serialNumber: ["Serial number must be unique."],
          },
        };
      }
    }

    const updatedAsset = await prisma.asset.update({
      where: {
        id: assetId,
      },
      data: {
        assetTag: data.assetTag,
        assetType: data.assetType,
        categoryId: data.categoryId,
        manufacturer: data.manufacturer,
        model: data.model,
        serialNumber: data.serialNumber,
        purchaseDate: data.purchaseDate
          ? new Date(data.purchaseDate)
          : null,
        purchasePrice:
          data.purchasePrice !== undefined
            ? data.purchasePrice
            : null,
        warrantyExpiry: data.warrantyExpiry
          ? new Date(data.warrantyExpiry)
          : null,
        departmentId: data.departmentId || null,
        locationId: data.locationId || null,
        notes: data.notes || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "Asset",
        entityId: updatedAsset.id,
        oldValue: {
          assetTag: existingAsset.assetTag,
          assetType: existingAsset.assetType,
          categoryId: existingAsset.categoryId,
          manufacturer: existingAsset.manufacturer,
          model: existingAsset.model,
          serialNumber: existingAsset.serialNumber,
          departmentId: existingAsset.departmentId,
          locationId: existingAsset.locationId,
          notes: existingAsset.notes,
        },
        newValue: {
          assetTag: updatedAsset.assetTag,
          assetType: updatedAsset.assetType,
          categoryId: updatedAsset.categoryId,
          manufacturer: updatedAsset.manufacturer,
          model: updatedAsset.model,
          serialNumber: updatedAsset.serialNumber,
          departmentId: updatedAsset.departmentId,
          locationId: updatedAsset.locationId,
          notes: updatedAsset.notes,
        },
      },
    });

    revalidatePath("/assets");
    revalidatePath(`/assets/${assetId}`);
    revalidatePath(`/assets/${assetId}/edit`);
    revalidatePath("/dashboard");

    return {
      success: true,
      message: "Asset updated successfully.",
    };
  } catch (error) {
    console.error("UPDATE_ASSET_ERROR", error);

    return {
      success: false,
      message: "Unable to update the asset. Please try again.",
    };
  }
}

export type AllocateAssetState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function allocateAsset(
  assetId: string,
  _previousState: AllocateAssetState,
  formData: FormData
): Promise<AllocateAssetState> {
  await requirePermission("asset.allocate");

  const employeeId = String(
    formData.get("employeeId") || ""
  );

  const conditionAtCheckout =
    String(formData.get("conditionAtCheckout") || "") ||
    undefined;

  const notes =
    String(formData.get("notes") || "") || undefined;

  if (!employeeId) {
    return {
      success: false,
      message: "Please select an employee.",
      errors: {
        employeeId: ["Employee is required."],
      },
    };
  }

  try {
    const allocationResult = await prisma.$transaction(
      async (tx) => {
        const asset = await tx.asset.findUnique({
          where: {
            id: assetId,
          },
        });

        if (!asset) {
          throw new Error("ASSET_NOT_FOUND");
        }

        if (asset.status !== AssetStatus.AVAILABLE) {
          throw new Error(
            `ASSET_NOT_AVAILABLE:${asset.status}`
          );
        }

        const employee = await tx.employee.findUnique({
          where: {
            id: employeeId,
          },
        });

        if (!employee) {
          throw new Error("EMPLOYEE_NOT_FOUND");
        }

        if (employee.status !== EmployeeStatus.ACTIVE) {
          throw new Error("EMPLOYEE_INACTIVE");
        }

        const existingAllocation =
          await tx.allocation.findFirst({
            where: {
              assetId,
              status: "ACTIVE",
            },
          });

        if (existingAllocation) {
          throw new Error("ACTIVE_ALLOCATION_EXISTS");
        }

        await tx.allocation.create({
          data: {
            assetId,
            employeeId,
            conditionAtCheckout,
            notes,
            status: "ACTIVE",
          },
        });

        await tx.asset.update({
          where: {
            id: assetId,
          },
          data: {
            status: AssetStatus.ASSIGNED,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "ALLOCATE",
            entity: "Asset",
            entityId: assetId,
            oldValue: {
              status: asset.status,
            },
            newValue: {
              status: AssetStatus.ASSIGNED,
              employeeId,
              conditionAtCheckout,
            },
          },
        });

        return {
          employeeId,
          assetTag: asset.assetTag,
        };
      }
    );

    // Notifications are intentionally created after the transaction
    // succeeds so a failed allocation never creates a false alert.
    try {
      const employeeUser = await prisma.user.findUnique({
        where: {
          employeeId: allocationResult.employeeId,
        },
        select: {
          id: true,
        },
      });

      if (employeeUser) {
        await createNotification({
          userId: employeeUser.id,
          type: "ASSET_ASSIGNED",
          priority: NotificationPriority.NORMAL,
          title: "Asset Assigned",
          message: `${allocationResult.assetTag} has been assigned to you.`,
          entity: "Asset",
          entityId: assetId,
          href: `/assets/${assetId}`,
        });
      }
    } catch (notificationError) {
      console.error(
        "ALLOCATE_ASSET_NOTIFICATION_ERROR",
        notificationError
      );
    }

    revalidatePath("/assets");
    revalidatePath(`/assets/${assetId}`);
    revalidatePath(`/assets/${assetId}/allocate`);
    revalidatePath("/dashboard");
    revalidatePath("/allocations");

    return {
      success: true,
      message: "Asset allocated successfully.",
    };
  } catch (error) {
    console.error("ALLOCATE_ASSET_ERROR", error);

    if (
      error instanceof Error &&
      error.message === "ASSET_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "Asset not found.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "Selected employee was not found.",
      };
    }

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_INACTIVE"
    ) {
      return {
        success: false,
        message:
          "This employee is inactive and cannot receive new asset allocations.",
        errors: {
          employeeId: [
            "Select an active employee.",
          ],
        },
      };
    }

    if (
      error instanceof Error &&
      error.message === "ACTIVE_ALLOCATION_EXISTS"
    ) {
      return {
        success: false,
        message:
          "This asset already has an active allocation.",
      };
    }

    if (
      error instanceof Error &&
      error.message.startsWith("ASSET_NOT_AVAILABLE:")
    ) {
      const currentStatus =
        error.message.split(":")[1];

      return {
        success: false,
        message: `This asset cannot be allocated because its current status is ${currentStatus.replaceAll(
          "_",
          " "
        )}.`,
      };
    }

    return {
      success: false,
      message:
        "Unable to allocate the asset. Please try again.",
    };
  }
}


export type ReturnAssetState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function requestAssetReturn(
  assetId: string,
  _previousState: ReturnAssetState,
  formData: FormData
): Promise<ReturnAssetState> {
  await requirePermission("return.read");

  const reason = String(
    formData.get("reason") || ""
  ).trim();

  const condition =
    String(formData.get("condition") || "").trim() ||
    undefined;

  const notes =
    String(formData.get("notes") || "").trim() ||
    undefined;

  if (!reason) {
    return {
      success: false,
      message: "Please provide a return reason.",
      errors: {
        reason: ["Return reason is required."],
      },
    };
  }

  if (reason.length < 5) {
    return {
      success: false,
      message: "Return reason is too short.",
      errors: {
        reason: [
          "Please provide at least 5 characters.",
        ],
      },
    };
  }

  try {
    const returnResult = await prisma.$transaction(
      async (tx) => {
        const asset = await tx.asset.findUnique({
          where: { id: assetId },
        });

        if (!asset) {
          throw new Error("ASSET_NOT_FOUND");
        }

        if (asset.status !== AssetStatus.ASSIGNED) {
          throw new Error(
            `ASSET_NOT_ASSIGNED:${asset.status}`
          );
        }

        const activeAllocation =
          await tx.allocation.findFirst({
            where: {
              assetId,
              status: "ACTIVE",
            },
          });

        if (!activeAllocation) {
          throw new Error(
            "ACTIVE_ALLOCATION_NOT_FOUND"
          );
        }

        const existingPendingRequest =
          await tx.returnRequest.findFirst({
            where: {
              assetId,
              status: "PENDING",
            },
          });

        if (existingPendingRequest) {
          throw new Error("PENDING_RETURN_EXISTS");
        }

        const createdReturnRequest =
          await tx.returnRequest.create({
            data: {
              assetId,
              employeeId: activeAllocation.employeeId,
              reason,
              condition,
              notes,
              status: "PENDING",
            },
          });

        await tx.asset.update({
          where: { id: assetId },
          data: {
            status: AssetStatus.RETURN_REQUESTED,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "RETURN_REQUEST",
            entity: "Asset",
            entityId: assetId,
            oldValue: {
              status: asset.status,
            },
            newValue: {
              status: AssetStatus.RETURN_REQUESTED,
              employeeId: activeAllocation.employeeId,
              reason,
              condition,
            },
          },
        });

        return {
          returnRequestId: createdReturnRequest.id,
          employeeId: activeAllocation.employeeId,
          assetTag: asset.assetTag,
        };
      }
    );

    // Notify the IT team only after the return transaction succeeds.
    try {
      const itUsers = await prisma.user.findMany({
        where: {
          role: {
            in: [
              Role.ADMIN,
              Role.IT_MANAGER,
              Role.IT_STAFF,
            ],
          },
        },
        select: {
          id: true,
        },
      });

      const employee = await prisma.employee.findUnique({
        where: {
          id: returnResult.employeeId,
        },
        select: {
          firstName: true,
          lastName: true,
        },
      });

      if (employee && itUsers.length > 0) {
        await Promise.all(
          itUsers.map((user) =>
            createNotification({
              userId: user.id,
              type: "RETURN_REQUEST",
              priority: NotificationPriority.HIGH,
              title: "Asset Return Requested",
              message: `${returnResult.assetTag} has been requested for return by ${employee.firstName} ${employee.lastName}.`,
              entity: "ReturnRequest",
              entityId: returnResult.returnRequestId,
              href: `/return-requests/${returnResult.returnRequestId}`,
            })
          )
        );
      }
    } catch (notificationError) {
      console.error(
        "RETURN_REQUEST_NOTIFICATION_ERROR",
        notificationError
      );
    }

    revalidatePath("/assets");
    revalidatePath(`/assets/${assetId}`);
    revalidatePath(`/assets/${assetId}/return`);
    revalidatePath("/return-requests");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Return request submitted successfully.",
    };
  } catch (error) {
    console.error(
      "REQUEST_ASSET_RETURN_ERROR",
      error
    );

    if (error instanceof Error) {
      if (error.message === "ASSET_NOT_FOUND") {
        return {
          success: false,
          message: "Asset not found.",
        };
      }

      if (
        error.message.startsWith(
          "ASSET_NOT_ASSIGNED:"
        )
      ) {
        const currentStatus = error.message
          .split(":")[1]
          .replaceAll("_", " ");

        return {
          success: false,
          message: `This asset cannot accept a return request because its current status is ${currentStatus}.`,
        };
      }

      if (
        error.message ===
        "ACTIVE_ALLOCATION_NOT_FOUND"
      ) {
        return {
          success: false,
          message:
            "No active allocation was found for this asset. The return request cannot be created.",
        };
      }

      if (
        error.message === "PENDING_RETURN_EXISTS"
      ) {
        return {
          success: false,
          message:
            "A pending return request already exists for this asset.",
        };
      }
    }

    return {
      success: false,
      message:
        "Unable to submit the return request. Please try again.",
    };
  }
}


export type ProcessReturnState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function processAssetReturn(
  returnRequestId: string,
  _previousState: ProcessReturnState,
  formData: FormData
): Promise<ProcessReturnState> {
  await requirePermission("return.process");

  const destination = String(
    formData.get("destination") || ""
  );

  const conditionAtReturn =
    String(
      formData.get("conditionAtReturn") || ""
    ).trim() || undefined;

  const notes =
    String(formData.get("notes") || "").trim() ||
    undefined;

  if (
    destination !== "AVAILABLE" &&
    destination !== "IN_REPAIR"
  ) {
    return {
      success: false,
      message:
        "Please select a valid return destination.",
      errors: {
        destination: [
          "Destination must be Available or In Repair.",
        ],
      },
    };
  }

  try {
    const processResult = await prisma.$transaction(
      async (tx) => {
        const returnRequest =
          await tx.returnRequest.findUnique({
            where: {
              id: returnRequestId,
            },
            include: {
              asset: true,
            },
          });

        if (!returnRequest) {
          throw new Error(
            "RETURN_REQUEST_NOT_FOUND"
          );
        }

        if (returnRequest.status !== "PENDING") {
          throw new Error(
            `RETURN_REQUEST_NOT_PENDING:${returnRequest.status}`
          );
        }

        if (
          returnRequest.asset.status !==
          AssetStatus.RETURN_REQUESTED
        ) {
          throw new Error(
            `ASSET_NOT_RETURN_REQUESTED:${returnRequest.asset.status}`
          );
        }

        const activeAllocation =
          await tx.allocation.findFirst({
            where: {
              assetId: returnRequest.assetId,
              status: "ACTIVE",
            },
          });

        if (!activeAllocation) {
          throw new Error(
            "ACTIVE_ALLOCATION_NOT_FOUND"
          );
        }

        await tx.allocation.update({
          where: {
            id: activeAllocation.id,
          },
          data: {
            status: "RETURNED",
            returnedAt: new Date(),
            conditionAtReturn,
          },
        });

        const nextStatus =
          destination === "AVAILABLE"
            ? AssetStatus.AVAILABLE
            : AssetStatus.IN_REPAIR;

        await tx.asset.update({
          where: {
            id: returnRequest.assetId,
          },
          data: {
            status: nextStatus,
          },
        });

        await tx.returnRequest.update({
          where: {
            id: returnRequestId,
          },
          data: {
            status: "PROCESSED",
            processedAt: new Date(),
            notes,
          },
        });

        await tx.auditLog.create({
          data: {
            action: "PROCESS_RETURN",
            entity: "Asset",
            entityId: returnRequest.assetId,
            oldValue: {
              status: AssetStatus.RETURN_REQUESTED,
              returnRequestId,
              employeeId: activeAllocation.employeeId,
            },
            newValue: {
              status: nextStatus,
              conditionAtReturn,
              notes,
            },
          },
        });

        return {
          employeeId: activeAllocation.employeeId,
          assetId: returnRequest.assetId,
          assetTag: returnRequest.asset.assetTag,
          nextStatus,
        };
      }
    );

    // Notify the employee only after the return transaction succeeds.
    try {
      const employeeUser =
        await prisma.user.findUnique({
          where: {
            employeeId: processResult.employeeId,
          },
          select: {
            id: true,
          },
        });

      if (employeeUser) {
        const destinationLabel =
          processResult.nextStatus ===
          AssetStatus.AVAILABLE
            ? "Available"
            : "In Repair";

        await createNotification({
          userId: employeeUser.id,
          type: "ASSET_RETURNED",
          priority:
            processResult.nextStatus ===
            AssetStatus.IN_REPAIR
              ? "HIGH"
              : "NORMAL",
          title: "Asset Return Processed",
          message: `${processResult.assetTag} has been returned and is now ${destinationLabel}.`,
          entity: "Asset",
          entityId: processResult.assetId,
          href: `/assets/${processResult.assetId}`,
        });
      }
    } catch (notificationError) {
      console.error(
        "PROCESS_RETURN_NOTIFICATION_ERROR",
        notificationError
      );
    }

    revalidatePath("/assets");
    revalidatePath(`/assets/${processResult.assetId}`);
    revalidatePath("/return-requests");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Asset return processed successfully.",
    };
  } catch (error) {
    console.error(
      "PROCESS_ASSET_RETURN_ERROR",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "RETURN_REQUEST_NOT_FOUND"
      ) {
        return {
          success: false,
          message: "Return request not found.",
        };
      }

      if (
        error.message.startsWith(
          "RETURN_REQUEST_NOT_PENDING:"
        )
      ) {
        return {
          success: false,
          message:
            "This return request has already been processed.",
        };
      }

      if (
        error.message.startsWith(
          "ASSET_NOT_RETURN_REQUESTED:"
        )
      ) {
        return {
          success: false,
          message:
            "This asset is not currently waiting for return processing.",
        };
      }

      if (
        error.message ===
        "ACTIVE_ALLOCATION_NOT_FOUND"
      ) {
        return {
          success: false,
          message:
            "No active allocation was found for this asset.",
        };
      }
    }

    return {
      success: false,
      message:
        "Unable to process the return request. Please try again.",
    };
  }
}


export type CreateMaintenanceState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createMaintenanceRecord(
  assetId: string,
  _previousState: CreateMaintenanceState,
  formData: FormData
): Promise<CreateMaintenanceState> {
  await requirePermission("maintenance.create");
  const issueDescription = String(
    formData.get("issueDescription") || ""
  ).trim();

  const vendor =
    String(formData.get("vendor") || "").trim() ||
    undefined;

  const costValue = String(
    formData.get("cost") || ""
  ).trim();

  const cost = costValue
    ? Number(costValue)
    : undefined;

  if (!issueDescription) {
    return {
      success: false,
      message:
        "Please describe the maintenance issue.",
      errors: {
        issueDescription: [
          "Issue description is required.",
        ],
      },
    };
  }

  if (issueDescription.length < 5) {
    return {
      success: false,
      message: "Issue description is too short.",
      errors: {
        issueDescription: [
          "Please provide at least 5 characters.",
        ],
      },
    };
  }

  if (
    cost !== undefined &&
    (!Number.isFinite(cost) || cost < 0)
  ) {
    return {
      success: false,
      message:
        "Please enter a valid maintenance cost.",
      errors: {
        cost: [
          "Cost must be a valid positive number.",
        ],
      },
    };
  }

  try {
    let createdMaintenanceId = "";
    let createdAssetTag = "";

    await prisma.$transaction(async (tx) => {
      const asset = await tx.asset.findUnique({
        where: {
          id: assetId,
        },
      });

      if (!asset) {
        throw new Error("ASSET_NOT_FOUND");
      }

      if (
        asset.status !== AssetStatus.IN_REPAIR
      ) {
        throw new Error(
          `ASSET_NOT_IN_REPAIR:${asset.status}`
        );
      }

      const openMaintenance =
        await tx.maintenanceRecord.findFirst({
          where: {
            assetId,
            status: {
              in: ["OPEN", "IN_PROGRESS"],
            },
          },
        });

      if (openMaintenance) {
        throw new Error(
          "OPEN_MAINTENANCE_EXISTS"
        );
      }

      const createdMaintenance =
        await tx.maintenanceRecord.create({
          data: {
            assetId,
            issueDescription,
            vendor,
            cost,
            status: "OPEN",
          },
        });

      createdMaintenanceId = createdMaintenance.id;
      createdAssetTag = asset.assetTag;

      await tx.auditLog.create({
        data: {
          action: "CREATE_MAINTENANCE",
          entity: "MaintenanceRecord",
          entityId: createdMaintenanceId,
          newValue: {
            issueDescription,
            vendor,
            cost,
            status: "OPEN",
          },
        },
      });
    });

    await notifyMaintenanceITUsers({
      title: "Maintenance Created",
      message: `${createdAssetTag} has a new maintenance record: ${issueDescription}`,
      priority: NotificationPriority.NORMAL,
      entityId: createdMaintenanceId,
      href: `/maintenance/${createdMaintenanceId}`,
    });

    revalidatePath("/assets");
    revalidatePath(`/assets/${assetId}`);
    revalidatePath(`/maintenance/${createdMaintenanceId}`);
    revalidatePath("/maintenance");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Maintenance record created successfully.",
    };
  } catch (error) {
    console.error(
      "CREATE_MAINTENANCE_ERROR",
      error
    );

    if (
      error instanceof Error &&
      error.message === "ASSET_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "Asset not found.",
      };
    }

    if (
      error instanceof Error &&
      error.message.startsWith(
        "ASSET_NOT_IN_REPAIR:"
      )
    ) {
      return {
        success: false,
        message:
          "Maintenance can only be opened for an asset currently in repair.",
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "OPEN_MAINTENANCE_EXISTS"
    ) {
      return {
        success: false,
        message:
          "This asset already has an active maintenance record.",
      };
    }

    return {
      success: false,
      message:
        "Unable to create the maintenance record. Please try again.",
    };
  }
}

export type MaintenanceActionState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function startMaintenance(
  maintenanceId: string,
  _previousState: MaintenanceActionState,
  _formData: FormData
): Promise<MaintenanceActionState> {
  await requirePermission("maintenance.update");
  try {
    let startedAssetTag = "";
    let startedEmployeeId: string | null = null;

    await prisma.$transaction(async (tx) => {
      const maintenance =
        await tx.maintenanceRecord.findUnique({
          where: {
            id: maintenanceId,
          },
          include: {
            asset: true,
          },
        });

      if (!maintenance) {
        throw new Error(
          "MAINTENANCE_NOT_FOUND"
        );
      }

      if (maintenance.status !== "OPEN") {
        throw new Error(
          `INVALID_MAINTENANCE_STATUS:${maintenance.status}`
        );
      }

      if (
        maintenance.asset.status !==
        AssetStatus.IN_REPAIR
      ) {
        throw new Error(
          `ASSET_NOT_IN_REPAIR:${maintenance.asset.status}`
        );
      }

      const activeAllocation =
        await tx.allocation.findFirst({
          where: {
            assetId: maintenance.assetId,
            status: "ACTIVE",
          },
          select: { employeeId: true },
        });

      startedAssetTag = maintenance.asset.assetTag;
      startedEmployeeId = activeAllocation?.employeeId ?? null;

      await tx.maintenanceRecord.update({
        where: {
          id: maintenanceId,
        },
        data: {
          status: "IN_PROGRESS",
        },
      });

      await tx.auditLog.create({
        data: {
          action: "START_MAINTENANCE",
          entity: "MaintenanceRecord",
          entityId: maintenanceId,
          oldValue: {
            status: "OPEN",
          },
          newValue: {
            status: "IN_PROGRESS",
          },
        },
      });
    });

    await notifyMaintenanceITUsers({
      title: "Maintenance Started",
      message: `${startedAssetTag} maintenance is now in progress.`,
      priority: NotificationPriority.NORMAL,
      entityId: maintenanceId,
      href: `/maintenance/${maintenanceId}`,
    });

    await notifyMaintenanceEmployee({
      employeeId: startedEmployeeId,
      title: "Asset Maintenance Started",
      message: `${startedAssetTag} is now undergoing maintenance.`,
      priority: NotificationPriority.NORMAL,
      entityId: maintenanceId,
      href: `/maintenance/${maintenanceId}`,
    });

    revalidatePath("/maintenance");
    revalidatePath(
      `/maintenance/${maintenanceId}`
    );
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Maintenance service started successfully.",
    };
  } catch (error) {
    console.error(
      "START_MAINTENANCE_ERROR",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "MAINTENANCE_NOT_FOUND"
      ) {
        return {
          success: false,
          message:
            "Maintenance record not found.",
        };
      }

      if (
        error.message.startsWith(
          "INVALID_MAINTENANCE_STATUS:"
        )
      ) {
        return {
          success: false,
          message:
            "This maintenance record cannot be started.",
        };
      }

      if (
        error.message.startsWith(
          "ASSET_NOT_IN_REPAIR:"
        )
      ) {
        return {
          success: false,
          message:
            "The associated asset is no longer in repair.",
        };
      }
    }

    return {
      success: false,
      message:
        "Unable to start maintenance service. Please try again.",
    };
  }
}

export async function completeMaintenance(
  maintenanceId: string,
  _previousState: MaintenanceActionState,
  formData: FormData
): Promise<MaintenanceActionState> {
  await requirePermission("maintenance.update");

  const resolutionNotes = String(
    formData.get("resolutionNotes") || ""
  ).trim();

  if (!resolutionNotes) {
    return {
      success: false,
      message: "Please provide resolution notes.",
      errors: {
        resolutionNotes: [
          "Resolution notes are required when completing maintenance.",
        ],
      },
    };
  }

  if (resolutionNotes.length < 5) {
    return {
      success: false,
      message: "Resolution notes are too short.",
      errors: {
        resolutionNotes: [
          "Please provide at least 5 characters.",
        ],
      },
    };
  }

  try {
    let completedAssetTag = "";
    let completedEmployeeId: string | null = null;

    await prisma.$transaction(async (tx) => {
      const maintenance =
        await tx.maintenanceRecord.findUnique({
          where: {
            id: maintenanceId,
          },
          include: {
            asset: true,
          },
        });

      if (!maintenance) {
        throw new Error(
          "MAINTENANCE_NOT_FOUND"
        );
      }

      if (maintenance.status !== "IN_PROGRESS") {
        throw new Error(
          `INVALID_MAINTENANCE_STATUS:${maintenance.status}`
        );
      }

      if (
        maintenance.asset.status !==
        AssetStatus.IN_REPAIR
      ) {
        throw new Error(
          `ASSET_NOT_IN_REPAIR:${maintenance.asset.status}`
        );
      }

      const activeAllocation =
        await tx.allocation.findFirst({
          where: {
            assetId: maintenance.assetId,
            status: "ACTIVE",
          },
          select: { employeeId: true },
        });

      completedAssetTag = maintenance.asset.assetTag;
      completedEmployeeId = activeAllocation?.employeeId ?? null;

      await tx.maintenanceRecord.update({
        where: {
          id: maintenanceId,
        },
        data: {
          status: "COMPLETED",
          resolutionNotes,
          resolvedAt: new Date(),
        },
      });

      await tx.asset.update({
        where: {
          id: maintenance.assetId,
        },
        data: {
          status: AssetStatus.AVAILABLE,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "COMPLETE_MAINTENANCE",
          entity: "MaintenanceRecord",
          entityId: maintenanceId,
          oldValue: {
            maintenanceStatus: "IN_PROGRESS",
            assetStatus: AssetStatus.IN_REPAIR,
          },
          newValue: {
            maintenanceStatus: "COMPLETED",
            assetStatus: AssetStatus.AVAILABLE,
            resolutionNotes,
          },
        },
      });
    });

    await notifyMaintenanceITUsers({
      title: "Maintenance Completed",
      message: `${completedAssetTag} maintenance has been completed and the asset is available again.`,
      priority: NotificationPriority.NORMAL,
      entityId: maintenanceId,
      href: `/maintenance/${maintenanceId}`,
    });

    await notifyMaintenanceEmployee({
      employeeId: completedEmployeeId,
      title: "Asset Maintenance Completed",
      message: `${completedAssetTag} maintenance has been completed and the asset is available again.`,
      priority: NotificationPriority.NORMAL,
      entityId: maintenanceId,
      href: `/maintenance/${maintenanceId}`,
    });

    revalidatePath("/maintenance");
    revalidatePath(
      `/maintenance/${maintenanceId}`
    );
    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Maintenance completed and asset returned to available inventory.",
    };
  } catch (error) {
    console.error(
      "COMPLETE_MAINTENANCE_ERROR",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "MAINTENANCE_NOT_FOUND"
      ) {
        return {
          success: false,
          message:
            "Maintenance record not found.",
        };
      }

      if (
        error.message.startsWith(
          "INVALID_MAINTENANCE_STATUS:"
        )
      ) {
        return {
          success: false,
          message:
            "Only an in-progress maintenance record can be completed.",
        };
      }

      if (
        error.message.startsWith(
          "ASSET_NOT_IN_REPAIR:"
        )
      ) {
        return {
          success: false,
          message:
            "The associated asset is no longer in repair.",
        };
      }
    }

    return {
      success: false,
      message:
        "Unable to complete maintenance. Please try again.",
    };
  }
}

export async function cancelMaintenance(
  maintenanceId: string,
  _previousState: MaintenanceActionState,
  _formData: FormData
): Promise<MaintenanceActionState> {
  await requirePermission("maintenance.update");
  try {
    let cancelledAssetTag = "";
    let cancelledEmployeeId: string | null = null;

    await prisma.$transaction(async (tx) => {
      const maintenance =
        await tx.maintenanceRecord.findUnique({
          where: {
            id: maintenanceId,
          },
          include: {
            asset: true,
          },
        });

      if (!maintenance) {
        throw new Error(
          "MAINTENANCE_NOT_FOUND"
        );
      }

      if (maintenance.status !== "OPEN") {
        throw new Error(
          `INVALID_MAINTENANCE_STATUS:${maintenance.status}`
        );
      }

      if (
        maintenance.asset.status !==
        AssetStatus.IN_REPAIR
      ) {
        throw new Error(
          `ASSET_NOT_IN_REPAIR:${maintenance.asset.status}`
        );
      }

      const activeAllocation =
        await tx.allocation.findFirst({
          where: {
            assetId: maintenance.assetId,
            status: "ACTIVE",
          },
          select: { employeeId: true },
        });

      cancelledAssetTag = maintenance.asset.assetTag;
      cancelledEmployeeId = activeAllocation?.employeeId ?? null;

      await tx.maintenanceRecord.update({
        where: {
          id: maintenanceId,
        },
        data: {
          status: "CANCELLED",
        },
      });

      await tx.asset.update({
        where: {
          id: maintenance.assetId,
        },
        data: {
          status: AssetStatus.AVAILABLE,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "CANCEL_MAINTENANCE",
          entity: "MaintenanceRecord",
          entityId: maintenanceId,
          oldValue: {
            maintenanceStatus: "OPEN",
            assetStatus: AssetStatus.IN_REPAIR,
          },
          newValue: {
            maintenanceStatus: "CANCELLED",
            assetStatus: AssetStatus.AVAILABLE,
          },
        },
      });
    });

    await notifyMaintenanceITUsers({
      title: "Maintenance Cancelled",
      message: `${cancelledAssetTag} maintenance has been cancelled and the asset is available again.`,
      priority: NotificationPriority.HIGH,
      entityId: maintenanceId,
      href: `/maintenance/${maintenanceId}`,
    });

    await notifyMaintenanceEmployee({
      employeeId: cancelledEmployeeId,
      title: "Asset Maintenance Cancelled",
      message: `${cancelledAssetTag} maintenance has been cancelled and the asset is available again.`,
      priority: NotificationPriority.HIGH,
      entityId: maintenanceId,
      href: `/maintenance/${maintenanceId}`,
    });

    revalidatePath("/maintenance");
    revalidatePath(
      `/maintenance/${maintenanceId}`
    );
    revalidatePath("/assets");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Maintenance cancelled and asset returned to available inventory.",
    };
  } catch (error) {
    console.error(
      "CANCEL_MAINTENANCE_ERROR",
      error
    );

    if (error instanceof Error) {
      if (
        error.message ===
        "MAINTENANCE_NOT_FOUND"
      ) {
        return {
          success: false,
          message:
            "Maintenance record not found.",
        };
      }

      if (
        error.message.startsWith(
          "INVALID_MAINTENANCE_STATUS:"
        )
      ) {
        return {
          success: false,
          message:
            "Only an open maintenance record can be cancelled.",
        };
      }

      if (
        error.message.startsWith(
          "ASSET_NOT_IN_REPAIR:"
        )
      ) {
        return {
          success: false,
          message:
            "The associated asset is no longer in repair.",
        };
      }
    }

    return {
      success: false,
      message:
        "Unable to cancel maintenance. Please try again.",
    };
  }
}

export type CreateEmployeeState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function createEmployee(
  _previousState: CreateEmployeeState,
  formData: FormData
): Promise<CreateEmployeeState> {
    await requirePermission("employee.create");
  const employeeCode = String(
    formData.get("employeeCode") || ""
  )
    .trim()
    .toUpperCase();

  const firstName = String(
    formData.get("firstName") || ""
  ).trim();

  const lastName = String(
    formData.get("lastName") || ""
  ).trim();

  const email = String(
    formData.get("email") || ""
  )
    .trim()
    .toLowerCase();

  const phone =
    String(formData.get("phone") || "").trim() ||
    undefined;

  const jobTitle =
    String(formData.get("jobTitle") || "").trim() ||
    undefined;

  const departmentId =
    String(formData.get("departmentId") || "").trim() ||
    undefined;

  const errors: Record<string, string[]> = {};

  // ---------------------------------------------------------
  // Employee Code Validation
  // ---------------------------------------------------------

  if (!employeeCode) {
    errors.employeeCode = [
      "Employee code is required.",
    ];
  } else if (employeeCode.length < 3) {
    errors.employeeCode = [
      "Employee code must be at least 3 characters.",
    ];
  } else if (employeeCode.length > 30) {
    errors.employeeCode = [
      "Employee code cannot exceed 30 characters.",
    ];
  }

  // ---------------------------------------------------------
  // First Name Validation
  // ---------------------------------------------------------

  if (!firstName) {
    errors.firstName = [
      "First name is required.",
    ];
  } else if (firstName.length > 50) {
    errors.firstName = [
      "First name cannot exceed 50 characters.",
    ];
  }

  // ---------------------------------------------------------
  // Last Name Validation
  // ---------------------------------------------------------

  if (!lastName) {
    errors.lastName = [
      "Last name is required.",
    ];
  } else if (lastName.length > 50) {
    errors.lastName = [
      "Last name cannot exceed 50 characters.",
    ];
  }

  // ---------------------------------------------------------
  // Email Validation
  // ---------------------------------------------------------

  if (!email) {
    errors.email = [
      "Email address is required.",
    ];
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = [
      "Enter a valid email address.",
    ];
  }

  // ---------------------------------------------------------
  // Phone Validation
  // ---------------------------------------------------------

  if (phone && phone.length > 30) {
    errors.phone = [
      "Phone number cannot exceed 30 characters.",
    ];
  }

  // ---------------------------------------------------------
  // Job Title Validation
  // ---------------------------------------------------------

  if (jobTitle && jobTitle.length > 100) {
    errors.jobTitle = [
      "Job title cannot exceed 100 characters.",
    ];
  }

  // ---------------------------------------------------------
  // Return Validation Errors
  // ---------------------------------------------------------

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      errors,
    };
  }

  try {
    await prisma.$transaction(async (tx) => {
      // -----------------------------------------------------
      // Check Employee Code
      // -----------------------------------------------------

      const existingCode =
        await tx.employee.findUnique({
          where: {
            employeeCode,
          },
          select: {
            id: true,
          },
        });

      if (existingCode) {
        throw new Error(
          "EMPLOYEE_CODE_EXISTS"
        );
      }

      // -----------------------------------------------------
      // Check Email
      // -----------------------------------------------------

      const existingEmail =
        await tx.employee.findUnique({
          where: {
            email,
          },
          select: {
            id: true,
          },
        });

      if (existingEmail) {
        throw new Error(
          "EMPLOYEE_EMAIL_EXISTS"
        );
      }

      // -----------------------------------------------------
      // Validate Department
      // -----------------------------------------------------

      if (departmentId) {
        const department =
          await tx.department.findUnique({
            where: {
              id: departmentId,
            },
            select: {
              id: true,
            },
          });

        if (!department) {
          throw new Error(
            "DEPARTMENT_NOT_FOUND"
          );
        }
      }

      // -----------------------------------------------------
      // Create Employee
      // -----------------------------------------------------

      const employee =
        await tx.employee.create({
          data: {
            employeeCode,
            firstName,
            lastName,
            email,
            phone,
            jobTitle,
            departmentId,

            // New employees are ACTIVE by default.
            status: EmployeeStatus.ACTIVE,
          },
        });

      // -----------------------------------------------------
      // Audit Log
      // -----------------------------------------------------

      await tx.auditLog.create({
        data: {
          action: "CREATE",
          entity: "Employee",
          entityId: employee.id,

          newValue: {
            employeeCode,
            firstName,
            lastName,
            email,
            phone,
            jobTitle,
            departmentId,
            status: employee.status,
          },
        },
      });
    });

    // -------------------------------------------------------
    // Revalidate Pages
    // -------------------------------------------------------

    revalidatePath("/employees");
    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Employee created successfully.",
    };
  } catch (error) {
    console.error(
      "CREATE_EMPLOYEE_ERROR",
      error
    );

    if (
      error instanceof Error &&
      error.message ===
        "EMPLOYEE_CODE_EXISTS"
    ) {
      return {
        success: false,
        message:
          "An employee with this employee code already exists.",
        errors: {
          employeeCode: [
            "This employee code is already in use.",
          ],
        },
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "EMPLOYEE_EMAIL_EXISTS"
    ) {
      return {
        success: false,
        message:
          "An employee with this email already exists.",
        errors: {
          email: [
            "This email address is already in use.",
          ],
        },
      };
    }

    if (
      error instanceof Error &&
      error.message ===
        "DEPARTMENT_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "The selected department could not be found.",
        errors: {
          departmentId: [
            "Please select a valid department.",
          ],
        },
      };
    }

    return {
      success: false,
      message:
        "Unable to create the employee. Please try again.",
    };
  }
}

// ============================================================
// UPDATE EMPLOYEE
// ============================================================

export type UpdateEmployeeState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function updateEmployee(
 
  employeeId: string,
  _previousState: UpdateEmployeeState,
  formData: FormData
): Promise<UpdateEmployeeState> {
  // ----------------------------------------------------------
  // Read Form Data
  // ----------------------------------------------------------
  await requirePermission("employee.update");
  const employeeCode = String(
    formData.get("employeeCode") || ""
  )
    .trim()
    .toUpperCase();

  const firstName = String(
    formData.get("firstName") || ""
  ).trim();

  const lastName = String(
    formData.get("lastName") || ""
  ).trim();

  const email = String(
    formData.get("email") || ""
  )
    .trim()
    .toLowerCase();

  const phone =
    String(formData.get("phone") || "").trim() ||
    undefined;

  const jobTitle =
    String(formData.get("jobTitle") || "").trim() ||
    undefined;

  const departmentId =
    String(formData.get("departmentId") || "").trim() ||
    undefined;

  // ----------------------------------------------------------
  // Employee Status
  // ----------------------------------------------------------
  // The form sends either ACTIVE or INACTIVE.
  // If the form does not send a value, we default to ACTIVE.
  // ----------------------------------------------------------

  const statusValue = String(
    formData.get("status") || "ACTIVE"
  ).trim();

  const errors: Record<string, string[]> = {};

  // ----------------------------------------------------------
  // Employee Code Validation
  // ----------------------------------------------------------

  if (!employeeCode) {
    errors.employeeCode = [
      "Employee code is required.",
    ];
  } else if (employeeCode.length < 3) {
    errors.employeeCode = [
      "Employee code must be at least 3 characters.",
    ];
  } else if (employeeCode.length > 30) {
    errors.employeeCode = [
      "Employee code cannot exceed 30 characters.",
    ];
  }

  // ----------------------------------------------------------
  // First Name Validation
  // ----------------------------------------------------------

  if (!firstName) {
    errors.firstName = [
      "First name is required.",
    ];
  } else if (firstName.length > 50) {
    errors.firstName = [
      "First name cannot exceed 50 characters.",
    ];
  }

  // ----------------------------------------------------------
  // Last Name Validation
  // ----------------------------------------------------------

  if (!lastName) {
    errors.lastName = [
      "Last name is required.",
    ];
  } else if (lastName.length > 50) {
    errors.lastName = [
      "Last name cannot exceed 50 characters.",
    ];
  }

  // ----------------------------------------------------------
  // Email Validation
  // ----------------------------------------------------------

  if (!email) {
    errors.email = [
      "Email address is required.",
    ];
  } else if (
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    errors.email = [
      "Enter a valid email address.",
    ];
  }

  // ----------------------------------------------------------
  // Phone Validation
  // ----------------------------------------------------------

  if (phone && phone.length > 30) {
    errors.phone = [
      "Phone number cannot exceed 30 characters.",
    ];
  }

  // ----------------------------------------------------------
  // Job Title Validation
  // ----------------------------------------------------------

  if (jobTitle && jobTitle.length > 100) {
    errors.jobTitle = [
      "Job title cannot exceed 100 characters.",
    ];
  }

  // ----------------------------------------------------------
  // Employee Status Validation
  // ----------------------------------------------------------

  if (
    statusValue !== "ACTIVE" &&
    statusValue !== "INACTIVE"
  ) {
    errors.status = [
      "Please select a valid employee status.",
    ];
  }

  // ----------------------------------------------------------
  // Stop if Validation Failed
  // ----------------------------------------------------------

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message:
        "Please correct the highlighted fields.",
      errors,
    };
  }

  // ----------------------------------------------------------
  // Convert Valid String to Prisma Enum
  // ----------------------------------------------------------

  const status =
    statusValue === "INACTIVE"
      ? EmployeeStatus.INACTIVE
      : EmployeeStatus.ACTIVE;

  try {
    await prisma.$transaction(async (tx) => {
      // ------------------------------------------------------
      // Find Existing Employee
      // ------------------------------------------------------

      const employee =
        await tx.employee.findUnique({
          where: {
            id: employeeId,
          },
        });

      if (!employee) {
        throw new Error(
          "EMPLOYEE_NOT_FOUND"
        );
      }

      // ------------------------------------------------------
      // Check Duplicate Employee Code
      // ------------------------------------------------------

      const existingCode =
        await tx.employee.findFirst({
          where: {
            employeeCode,
            NOT: {
              id: employeeId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingCode) {
        throw new Error(
          "EMPLOYEE_CODE_EXISTS"
        );
      }

      // ------------------------------------------------------
      // Check Duplicate Email
      // ------------------------------------------------------

      const existingEmail =
        await tx.employee.findFirst({
          where: {
            email,
            NOT: {
              id: employeeId,
            },
          },
          select: {
            id: true,
          },
        });

      if (existingEmail) {
        throw new Error(
          "EMPLOYEE_EMAIL_EXISTS"
        );
      }

      // ------------------------------------------------------
      // Validate Department
      // ------------------------------------------------------

      if (departmentId) {
        const department =
          await tx.department.findUnique({
            where: {
              id: departmentId,
            },
            select: {
              id: true,
            },
          });

        if (!department) {
          throw new Error(
            "DEPARTMENT_NOT_FOUND"
          );
        }
      }

      // ------------------------------------------------------
      // UPDATE EMPLOYEE
      // ------------------------------------------------------

      const updatedEmployee =
        await tx.employee.update({
          where: {
            id: employeeId,
          },

          data: {
            employeeCode,
            firstName,
            lastName,
            email,
            phone,
            jobTitle,
            departmentId,

            // Save ACTIVE / INACTIVE status
            status,
          },
        });

      // ------------------------------------------------------
      // AUDIT LOG
      // ------------------------------------------------------
      // Store both the previous and new status so that the
      // audit history can show when an employee was activated
      // or deactivated.
      // ------------------------------------------------------

      await tx.auditLog.create({
        data: {
          action: "UPDATE",
          entity: "Employee",
          entityId: updatedEmployee.id,

          oldValue: {
            employeeCode:
              employee.employeeCode,

            firstName:
              employee.firstName,

            lastName:
              employee.lastName,

            email:
              employee.email,

            phone:
              employee.phone,

            jobTitle:
              employee.jobTitle,

            departmentId:
              employee.departmentId,

            // Previous status
            status:
              employee.status,
          },

          newValue: {
            employeeCode,

            firstName,

            lastName,

            email,

            phone,

            jobTitle,

            departmentId,

            // New status
            status:
              updatedEmployee.status,
          },
        },
      });
    });

    // --------------------------------------------------------
    // Revalidate Employee Pages
    // --------------------------------------------------------

    revalidatePath("/employees");

    revalidatePath(
      `/employees/${employeeId}`
    );

    revalidatePath(
      `/employees/${employeeId}/edit`
    );

    revalidatePath("/dashboard");

    return {
      success: true,
      message:
        "Employee updated successfully.",
    };
  } catch (error) {
    console.error(
      "UPDATE_EMPLOYEE_ERROR",
      error
    );

    // --------------------------------------------------------
    // Employee Not Found
    // --------------------------------------------------------

    if (
      error instanceof Error &&
      error.message ===
        "EMPLOYEE_NOT_FOUND"
    ) {
      return {
        success: false,
        message: "Employee not found.",
      };
    }

    // --------------------------------------------------------
    // Duplicate Employee Code
    // --------------------------------------------------------

    if (
      error instanceof Error &&
      error.message ===
        "EMPLOYEE_CODE_EXISTS"
    ) {
      return {
        success: false,
        message:
          "An employee with this employee code already exists.",
        errors: {
          employeeCode: [
            "This employee code is already in use.",
          ],
        },
      };
    }

    // --------------------------------------------------------
    // Duplicate Email
    // --------------------------------------------------------

    if (
      error instanceof Error &&
      error.message ===
        "EMPLOYEE_EMAIL_EXISTS"
    ) {
      return {
        success: false,
        message:
          "An employee with this email already exists.",
        errors: {
          email: [
            "This email address is already in use.",
          ],
        },
      };
    }

    // --------------------------------------------------------
    // Department Not Found
    // --------------------------------------------------------

    if (
      error instanceof Error &&
      error.message ===
        "DEPARTMENT_NOT_FOUND"
    ) {
      return {
        success: false,
        message:
          "The selected department could not be found.",
        errors: {
          departmentId: [
            "Please select a valid department.",
          ],
        },
      };
    }

    // --------------------------------------------------------
    // Generic Error
    // --------------------------------------------------------

    return {
      success: false,
      message:
        "Unable to update the employee. Please try again.",
    };
  }
}
