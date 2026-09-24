'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';
import { eq, and, desc, sql, count } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function getUnreadCount() {
  const session = await auth();
  if (!session?.user) return 0;

  const [result] = await db
    .select({ count: count() })
    .from(notifications)
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));

  return result.count;
}

export async function getNotifications(params?: {
  page?: number;
  limit?: number;
  isRead?: boolean | null;
}) {
  const session = await auth();
  if (!session?.user) return { data: [], total: 0, page: 1, limit: 20 };

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(notifications.userId, session.user.id)];
  if (params?.isRead !== null && params?.isRead !== undefined) {
    conditions.push(eq(notifications.isRead, params.isRead));
  }

  const whereClause = and(...conditions);

  const [data, totalResult] = await Promise.all([
    db
      .select()
      .from(notifications)
      .where(whereClause)
      .orderBy(desc(notifications.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(notifications).where(whereClause),
  ]);

  return {
    data,
    total: totalResult[0].count,
    page,
    limit,
  };
}

export async function getRecentNotifications() {
  const session = await auth();
  if (!session?.user) return [];

  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, session.user.id))
    .orderBy(desc(notifications.createdAt))
    .limit(10);
}

export async function markAsRead(notificationId: number) {
  const session = await auth();
  if (!session?.user) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.id, notificationId), eq(notifications.userId, session.user.id)));
}

export async function markAllAsRead() {
  const session = await auth();
  if (!session?.user) return;

  await db
    .update(notifications)
    .set({ isRead: true })
    .where(and(eq(notifications.userId, session.user.id), eq(notifications.isRead, false)));
}
