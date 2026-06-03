import { prisma } from "@/lib/prisma";
import type { NotificationType } from "@prisma/client";

export async function createUserNotification(input: {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  href?: string;
  accordId?: string;
  dedupeKey: string;
}) {
  const existing = await prisma.userNotification.findUnique({
    where: { dedupeKey: input.dedupeKey },
  });
  if (existing) return { notification: existing, created: false };

  const notification = await prisma.userNotification.create({
    data: input,
  });
  return { notification, created: true };
}

export async function getUnreadNotificationCount(userId: string) {
  return prisma.userNotification.count({
    where: { userId, readAt: null },
  });
}

export async function listUserNotifications(userId: string, limit = 20) {
  return prisma.userNotification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markNotificationRead(id: string, userId: string) {
  return prisma.userNotification.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  });
}

export async function markAllNotificationsRead(userId: string) {
  return prisma.userNotification.updateMany({
    where: { userId, readAt: null },
    data: { readAt: new Date() },
  });
}
