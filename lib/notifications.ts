import {
  NotificationPriority,
  NotificationType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

type CreateNotificationInput = {
  userId: string;
  type: NotificationType;
  priority?: NotificationPriority;
  title: string;
  message: string;
  entity?: string;
  entityId?: string;
  href?: string;
};

export async function createNotification(
  input: CreateNotificationInput
) {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      priority: input.priority ?? NotificationPriority.NORMAL,
      title: input.title,
      message: input.message,
      entity: input.entity,
      entityId: input.entityId,
      href: input.href,
    },
  });
}