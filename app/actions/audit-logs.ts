'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { auditLogs, users } from '@/lib/db/schema';
import { eq, and, desc, gte, lte, like, or, sql, count, inArray } from 'drizzle-orm';

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

export async function getAuditLogs(params?: {
  page?: number;
  limit?: number;
  search?: string;
  module?: string[];
  action?: string[];
  actorUserId?: number;
  dateFrom?: string;
  dateTo?: string;
}) {
  await checkAdminAuth();

  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [];

  if (params?.module && params.module.length > 0) {
    conditions.push(inArray(auditLogs.module, params.module));
  }

  if (params?.action && params.action.length > 0) {
    conditions.push(inArray(auditLogs.action, params.action));
  }

  if (params?.actorUserId) {
    conditions.push(eq(auditLogs.actorUserId, params.actorUserId));
  }

  if (params?.dateFrom) {
    conditions.push(gte(auditLogs.createdAt, new Date(params.dateFrom)));
  }

  if (params?.dateTo) {
    conditions.push(lte(auditLogs.createdAt, new Date(params.dateTo)));
  }

  if (params?.search) {
    conditions.push(
      or(
        like(auditLogs.actorName, `%${params.search}%`),
        like(auditLogs.entityType, `%${params.search}%`),
        like(auditLogs.entityId, `%${params.search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [logs, totalResult] = await Promise.all([
    db
      .select()
      .from(auditLogs)
      .where(whereClause)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(auditLogs).where(whereClause),
  ]);

  return {
    logs,
    total: totalResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalResult[0]?.count || 0) / limit),
  };
}

export async function getAuditLogById(id: number) {
  await checkAdminAuth();

  const [log] = await db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.id, id))
    .limit(1);

  return log || null;
}

export async function getAuditLogFilterOptions() {
  await checkAdminAuth();

  const [modules, actions, actors] = await Promise.all([
    db
      .selectDistinct({ module: auditLogs.module })
      .from(auditLogs)
      .orderBy(auditLogs.module),
    db
      .selectDistinct({ action: auditLogs.action })
      .from(auditLogs)
      .orderBy(auditLogs.action),
    db
      .select({
        id: users.id,
        name: users.name,
      })
      .from(users)
      .innerJoin(auditLogs, eq(users.id, auditLogs.actorUserId))
      .groupBy(users.id, users.name)
      .orderBy(users.name),
  ]);

  return {
    modules: modules.map((m) => m.module),
    actions: actions.map((a) => a.action),
    actors,
  };
}

export async function getAuditLogStats() {
  await checkAdminAuth();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [totalResult, todayResult] = await Promise.all([
    db.select({ count: count() }).from(auditLogs),
    db
      .select({ count: count() })
      .from(auditLogs)
      .where(gte(auditLogs.createdAt, today)),
  ]);

  return {
    total: totalResult[0]?.count || 0,
    today: todayResult[0]?.count || 0,
  };
}
