import type { SessionPayload } from "@/lib/auth";

export type Permission =
  | "dashboard.read"
  | "asset.read"
  | "asset.create"
  | "asset.update"
  | "asset.allocate"
  | "employee.read"
  | "employee.create"
  | "employee.update"
  | "return.read"
  | "return.process"
  | "maintenance.read"
  | "maintenance.create"
  | "maintenance.update"
  | "license.read"
  | "license.create"
  | "license.update"
  | "license.assign"
  | "report.read"
  | "audit.read"
  | "settings.read"
  | "settings.update";

const rolePermissions: Record<
  SessionPayload["role"],
  Permission[]

> = {
  ADMIN: [
    "dashboard.read",

    "asset.read",
    "asset.create",
    "asset.update",
    "asset.allocate",

    "employee.read",
    "employee.create",
    "employee.update",

    "return.read",
    "return.process",

    "maintenance.read",
    "maintenance.create",
    "maintenance.update",

    "license.read",
    "license.create",
    "license.update",
    "license.assign",

    "report.read",
    "audit.read",

    "settings.read",
    "settings.update",
  ],

  IT_MANAGER: [
    "dashboard.read",

    "asset.read",
    "asset.create",
    "asset.update",
    "asset.allocate",

    "employee.read",
    "employee.create",
    "employee.update",

    "return.read",
    "return.process",

    "maintenance.read",
    "maintenance.create",
    "maintenance.update",

    "license.read",
    "license.create",
    "license.update",
    "license.assign",

    "report.read",
    "audit.read",

    "settings.read",
  ],

  IT_STAFF: [
    "dashboard.read",

    "asset.read",
    "asset.create",
    "asset.update",
    "asset.allocate",

    "employee.read",
    "employee.update",

    "return.read",
    "return.process",

    "maintenance.read",
    "maintenance.create",
    "maintenance.update",

    "license.read",
    "license.update",
    "license.assign",

    "report.read",
  ],

  EMPLOYEE: [
    "dashboard.read",
    "asset.read",
    "return.read",
  ],

  AUDITOR: [
    "dashboard.read",
    "asset.read",
    "employee.read",
    "return.read",
    "maintenance.read",
    "license.read",
    "report.read",
    "audit.read",
  ],
};

export function hasPermission(
  role: SessionPayload["role"],
  permission: Permission
) {
  return rolePermissions[role]?.includes(permission) ?? false;
}

export function getPermissions(
  role: SessionPayload["role"]
) {
  return rolePermissions[role] ?? [];
}

export function requirePermission(
  role: SessionPayload["role"],
  permission: Permission
) {
  if (!hasPermission(role, permission)) {
    throw new Error(
      `Permission denied: ${permission}`
    );
  }
}