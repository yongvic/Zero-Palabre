import { NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  getUnreadNotificationCount,
  listUserNotifications,
  markAllNotificationsRead,
} from "@/lib/notifications/store";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  const [items, unreadCount] = await Promise.all([
    listUserNotifications(session.user.id),
    getUnreadNotificationCount(session.user.id),
  ]);

  return NextResponse.json({
    data: {
      unreadCount,
      items: items.map((n) => ({
        id: n.id,
        type: n.type,
        title: n.title,
        body: n.body,
        href: n.href,
        accordId: n.accordId,
        read: Boolean(n.readAt),
        createdAt: n.createdAt.toISOString(),
      })),
    },
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: { message: "Non autorisé" } }, { status: 401 });
  }

  await markAllNotificationsRead(session.user.id);
  return NextResponse.json({ data: { ok: true } });
}
