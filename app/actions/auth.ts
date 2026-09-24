"use server";

import bcrypt, { compare } from "bcryptjs";
import { Role, EmployeeStatus } from "@prisma/client";
import { redirect } from "next/navigation";

import {
  createSession,
  clearSession,
} from "@/lib/auth";

import { prisma } from "@/lib/prisma";
export type LoginState = {
  error?: string;
};
export async function login(
  _previousState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  const password = String(
    formData.get("password") ?? ""
  );

  if (!email || !password) {
    return {
      error: "Email and password are required.",
    };
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    return {
      error: "Invalid email or password.",
    };
  }

  const passwordValid = await compare(
    password,
    user.password
  );

  if (!passwordValid) {
    return {
      error: "Invalid email or password.",
    };
  }

  await createSession({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      action: "LOGIN",
      entity: "User",
      entityId: user.id,
    },
  });

  redirect("/dashboard");
}

export async function logout() {
  const sessionCookieUser = await import("@/lib/auth").then(
    ({ getSession }) => getSession()
  );

  if (sessionCookieUser) {
    await prisma.auditLog.create({
      data: {
        userId: sessionCookieUser.userId,
        action: "LOGOUT",
        entity: "User",
        entityId: sessionCookieUser.userId,
      },
    });
  }

  await clearSession();

  redirect("/login");
}
export type RegisterState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function registerEmployee(
  _previousState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const firstName = String(
    formData.get("firstName") || ""
  ).trim();

  const lastName = String(
    formData.get("lastName") || ""
  ).trim();

  const employeeCode = String(
    formData.get("employeeCode") || ""
  )
    .trim()
    .toUpperCase();

  const email = String(
    formData.get("email") || ""
  )
    .trim()
    .toLowerCase();

  const phone = String(
    formData.get("phone") || ""
  ).trim();

  const jobTitle = String(
    formData.get("jobTitle") || ""
  ).trim();

  const departmentId = String(
    formData.get("departmentId") || ""
  ).trim();

  const password = String(
    formData.get("password") || ""
  );

  const confirmPassword = String(
    formData.get("confirmPassword") || ""
  );

  const errors: Record<string, string[]> = {};

  if (!firstName) {
    errors.firstName = ["First name is required."];
  }

  if (!lastName) {
    errors.lastName = ["Last name is required."];
  }

  if (!employeeCode) {
    errors.employeeCode = ["Employee ID is required."];
  } else if (employeeCode.length < 3) {
    errors.employeeCode = [
      "Employee ID must be at least 3 characters.",
    ];
  }

  if (!email) {
    errors.email = ["Email address is required."];
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = ["Enter a valid email address."];
  }

  if (!departmentId) {
    errors.departmentId = ["Please select a department."];
  }

  if (!password) {
    errors.password = ["Password is required."];
  } else if (password.length < 8) {
    errors.password = [
      "Password must contain at least 8 characters.",
    ];
  }

  if (password !== confirmPassword) {
    errors.confirmPassword = [
      "Passwords do not match.",
    ];
  }

  if (Object.keys(errors).length > 0) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors,
    };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existingEmployee = await tx.employee.findFirst({
        where: {
          OR: [
            {
              employeeCode,
            },
            {
              email,
            },
          ],
        },
      });

      if (existingEmployee) {
        if (
          existingEmployee.employeeCode.toLowerCase() ===
          employeeCode.toLowerCase()
        ) {
          throw new Error("EMPLOYEE_CODE_EXISTS");
        }

        throw new Error("EMPLOYEE_EMAIL_EXISTS");
      }

      const existingUser = await tx.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        throw new Error("USER_EMAIL_EXISTS");
      }

      const department = await tx.department.findUnique({
        where: {
          id: departmentId,
        },
      });

      if (!department) {
        throw new Error("DEPARTMENT_NOT_FOUND");
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const employee = await tx.employee.create({
        data: {
          employeeCode,
          firstName,
          lastName,
          email,
          phone: phone || null,
          jobTitle: jobTitle || null,
          departmentId,
          status: EmployeeStatus.ACTIVE,
        },
      });

      const user = await tx.user.create({
        data: {
          email,
          name: `${firstName} ${lastName}`,
          password: passwordHash,

          // IMPORTANT:
          // Public registration can ONLY create employees.
          role: Role.EMPLOYEE,

          employeeId: employee.id,
        },
      });

      await tx.auditLog.create({
        data: {
          action: "REGISTER",
          entity: "User",
          entityId: user.id,
          newValue: {
            employeeId: employee.id,
            employeeCode,
            email,
            role: Role.EMPLOYEE,
          },
        },
      });

      return {
        employeeId: employee.id,
        userId: user.id,
      };
    });

    return {
      success: true,
      message:
        "Employee account created successfully. You can now sign in.",
    };
  } catch (error) {
    console.error("REGISTER_EMPLOYEE_ERROR", error);

    if (
      error instanceof Error &&
      error.message === "EMPLOYEE_CODE_EXISTS"
    ) {
      return {
        success: false,
        message:
          "An employee with this employee ID already exists.",
        errors: {
          employeeCode: [
            "This employee ID is already registered.",
          ],
        },
      };
    }

    if (
      error instanceof Error &&
      (error.message === "EMPLOYEE_EMAIL_EXISTS" ||
        error.message === "USER_EMAIL_EXISTS")
    ) {
      return {
        success: false,
        message:
          "An account with this email address already exists.",
        errors: {
          email: [
            "This email address is already registered.",
          ],
        },
      };
    }

    if (
      error instanceof Error &&
      error.message === "DEPARTMENT_NOT_FOUND"
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
        "Unable to create your account. Please try again.",
    };
  }
}