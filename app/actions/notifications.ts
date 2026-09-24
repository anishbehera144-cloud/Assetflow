"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth";

export async function getNotifications() {
  const session = await requireSession();

  return prisma.notification.findMany({
    where: {
      userId: session.userId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 30,
  });
}

export async function getUnreadNotificationCount() {
  const session = await requireSession();

  return prisma.notification.count({
    where: {
      userId: session.userId,
      isRead: false,
    },
  });
}

export async function markNotificationAsRead(
  notificationId: string
) {
  const session = await requireSession();

  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId: session.userId,
    },
  });

  if (!notification) {
    return {
      success: false,
      error: "Notification not found.",
    };
  }

  await prisma.notification.update({
    where: {
      id: notificationId,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  revalidatePath("/dashboard");

  return {
    success: true,
  };
}

export async function markAllNotificationsAsRead() {
  const session = await requireSession();

  await prisma.notification.updateMany({
    where: {
      userId: session.userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  revalidatePath("/dashboard");

  return {
    success: true,
  };
}