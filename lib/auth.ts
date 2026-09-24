import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import {
  type Permission,
  hasPermission,
} from "@/lib/permissions";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "assetflow_session";

const authSecret = process.env.AUTH_SECRET;

if (!authSecret) {
  throw new Error(
    "AUTH_SECRET is not configured. Add AUTH_SECRET to your .env file."
  );
}

const secret = new TextEncoder().encode(authSecret);

export type SessionPayload = {
  userId: string;
  email: string;
  name: string;
  role:
    | "ADMIN"
    | "IT_MANAGER"
    | "IT_STAFF"
    | "EMPLOYEE"
    | "AUDITOR";
};

export async function createSession(
  payload: SessionPayload
) {
  const token = await new SignJWT({
    userId: payload.userId,
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(
      token,
      secret
    );

    if (
      typeof payload.userId !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      userId: payload.userId,
      email: payload.email,
      name: payload.name,
      role: payload.role as SessionPayload["role"],
    };
  } catch {
    return null;
  }
}

export async function requireSession() {
  const session = await getSession();

  if (!session) {
    throw new Error("Authentication required");
  }

  return session;
}

export async function requireRole(
  allowedRoles: SessionPayload["role"][]
) {
  const session = await requireSession();

  if (!allowedRoles.includes(session.role)) {
    throw new Error("Insufficient permissions");
  }

  return session;
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      id: session.userId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      employeeId: true,
      createdAt: true,
    },
  });
}
export async function requirePermission(
  permission: Permission
) {
  const session = await requireSession();

  if (!hasPermission(session.role, permission)) {
    throw new Error(
      `Permission denied: ${permission}`
    );
  }

  return session;
}