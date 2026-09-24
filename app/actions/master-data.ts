'use server';

import { db } from '@/lib/db';
import { units, priorities, teams } from '@/lib/db/schema';
import { eq, and, or, like, desc, asc, count, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/utils/audit';
import { AUDIT_MODULES, AUDIT_ACTIONS } from '@/lib/constants';

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

// ==================== UNITS ====================

export async function getUnits(params?: {
  isActive?: boolean | null;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await checkAdminAuth();

  const {
    isActive = null,
    search = '',
    page = 1,
    limit = 20,
  } = params || {};

  const offset = (page - 1) * limit;
  const conditions = [];

  if (isActive !== null) {
    conditions.push(eq(units.isActive, isActive));
  }

  if (search) {
    conditions.push(
      or(like(units.name, `%${search}%`), like(units.code, `%${search}%`))
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [unitsList, totalCountResult] = await Promise.all([
    db.select().from(units).where(whereClause).orderBy(desc(units.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(units).where(whereClause),
  ]);

  return {
    units: unitsList,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
  };
}

export async function createUnit(data: { code: string; name: string }) {
  const adminUser = await checkAdminAuth();

  const existing = await db
    .select({ id: units.id })
    .from(units)
    .where(eq(units.code, data.code))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Unit code already exists');
  }

  const result = await db.insert(units).values({
    code: data.code,
    name: data.name,
    isActive: true,
  });

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'unit',
    entityId: String(result[0].insertId),
    action: AUDIT_ACTIONS.CREATE,
    afterData: { code: data.code, name: data.name },
  });

  revalidatePath('/admin/settings/units');

  return { success: true, id: result[0].insertId };
}

export async function updateUnit(id: number, data: { code?: string; name?: string; isActive?: boolean }) {
  const adminUser = await checkAdminAuth();

  if (data.code) {
    const existing = await db
      .select({ id: units.id })
      .from(units)
      .where(and(eq(units.code, data.code), sql`${units.id} != ${id}`))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Unit code already exists');
    }
  }

  await db
    .update(units)
    .set({
      ...(data.code && { code: data.code }),
      ...(data.name && { name: data.name }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(units.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'unit',
    entityId: String(id),
    action: AUDIT_ACTIONS.UPDATE,
    afterData: data,
  });

  revalidatePath('/admin/settings/units');

  return { success: true };
}

export async function toggleUnitActive(id: number, isActive: boolean) {
  const adminUser = await checkAdminAuth();

  await db.update(units).set({ isActive, updatedAt: new Date() }).where(eq(units.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'unit',
    entityId: String(id),
    action: AUDIT_ACTIONS.TOGGLE_ACTIVE,
    afterData: { isActive },
  });

  revalidatePath('/admin/settings/units');

  return { success: true };
}

// ==================== PRIORITIES ====================

export async function getPriorities(params?: {
  isActive?: boolean | null;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await checkAdminAuth();

  const {
    isActive = null,
    search = '',
    page = 1,
    limit = 20,
  } = params || {};

  const offset = (page - 1) * limit;
  const conditions = [];

  if (isActive !== null) {
    conditions.push(eq(priorities.isActive, isActive));
  }

  if (search) {
    conditions.push(
      or(like(priorities.name, `%${search}%`), like(priorities.code, `%${search}%`))
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [prioritiesList, totalCountResult] = await Promise.all([
    db.select().from(priorities).where(whereClause).orderBy(asc(priorities.sortOrder)).limit(limit).offset(offset),
    db.select({ count: count() }).from(priorities).where(whereClause),
  ]);

  return {
    priorities: prioritiesList,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
  };
}

export async function createPriority(data: { code: string; name: string; sortOrder?: number }) {
  const adminUser = await checkAdminAuth();

  const existing = await db
    .select({ id: priorities.id })
    .from(priorities)
    .where(eq(priorities.code, data.code))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Priority code already exists');
  }

  let sortOrder = data.sortOrder || 0;
  if (!data.sortOrder) {
    const maxResult = await db
      .select({ max: sql<number>`MAX(${priorities.sortOrder})` })
      .from(priorities);
    sortOrder = (maxResult[0]?.max || 0) + 1;
  }

  const result = await db.insert(priorities).values({
    code: data.code,
    name: data.name,
    sortOrder,
    isActive: true,
  });

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'priority',
    entityId: String(result[0].insertId),
    action: AUDIT_ACTIONS.CREATE,
    afterData: { code: data.code, name: data.name, sortOrder },
  });

  revalidatePath('/admin/settings/priorities');

  return { success: true, id: result[0].insertId };
}

export async function updatePriority(
  id: number,
  data: { code?: string; name?: string; sortOrder?: number; isActive?: boolean }
) {
  const adminUser = await checkAdminAuth();

  if (data.code) {
    const existing = await db
      .select({ id: priorities.id })
      .from(priorities)
      .where(and(eq(priorities.code, data.code), sql`${priorities.id} != ${id}`))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Priority code already exists');
    }
  }

  await db
    .update(priorities)
    .set({
      ...(data.code && { code: data.code }),
      ...(data.name && { name: data.name }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    })
    .where(eq(priorities.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'priority',
    entityId: String(id),
    action: AUDIT_ACTIONS.UPDATE,
    afterData: data,
  });

  revalidatePath('/admin/settings/priorities');

  return { success: true };
}

export async function reorderPriorities(reorderedIds: number[]) {
  await checkAdminAuth();

  // Update sort order based on array index
  for (let i = 0; i < reorderedIds.length; i++) {
    await db
      .update(priorities)
      .set({ sortOrder: i })
      .where(eq(priorities.id, reorderedIds[i]));
  }

  revalidatePath('/admin/settings/priorities');

  return { success: true };
}

export async function togglePriorityActive(id: number, isActive: boolean) {
  const adminUser = await checkAdminAuth();

  await db.update(priorities).set({ isActive }).where(eq(priorities.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'priority',
    entityId: String(id),
    action: AUDIT_ACTIONS.TOGGLE_ACTIVE,
    afterData: { isActive },
  });

  revalidatePath('/admin/settings/priorities');

  return { success: true };
}

// ==================== TEAMS ====================

export async function getTeams(params?: {
  isActive?: boolean | null;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await checkAdminAuth();

  const {
    isActive = null,
    search = '',
    page = 1,
    limit = 20,
  } = params || {};

  const offset = (page - 1) * limit;
  const conditions = [];

  if (isActive !== null) {
    conditions.push(eq(teams.isActive, isActive));
  }

  if (search) {
    conditions.push(
      or(like(teams.name, `%${search}%`), like(teams.code, `%${search}%`))
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [teamsList, totalCountResult] = await Promise.all([
    db.select().from(teams).where(whereClause).orderBy(desc(teams.createdAt)).limit(limit).offset(offset),
    db.select({ count: count() }).from(teams).where(whereClause),
  ]);

  return {
    teams: teamsList,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
  };
}

export async function createTeam(data: { code: string; name: string }) {
  const adminUser = await checkAdminAuth();

  const existing = await db
    .select({ id: teams.id })
    .from(teams)
    .where(eq(teams.code, data.code))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Team code already exists');
  }

  const result = await db.insert(teams).values({
    code: data.code,
    name: data.name,
    isActive: true,
  });

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'team',
    entityId: String(result[0].insertId),
    action: AUDIT_ACTIONS.CREATE,
    afterData: { code: data.code, name: data.name },
  });

  revalidatePath('/admin/settings/teams');

  return { success: true, id: result[0].insertId };
}

export async function updateTeam(id: number, data: { code?: string; name?: string; isActive?: boolean }) {
  const adminUser = await checkAdminAuth();

  if (data.code) {
    const existing = await db
      .select({ id: teams.id })
      .from(teams)
      .where(and(eq(teams.code, data.code), sql`${teams.id} != ${id}`))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Team code already exists');
    }
  }

  await db
    .update(teams)
    .set({
      ...(data.code && { code: data.code }),
      ...(data.name && { name: data.name }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(teams.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'team',
    entityId: String(id),
    action: AUDIT_ACTIONS.UPDATE,
    afterData: data,
  });

  revalidatePath('/admin/settings/teams');

  return { success: true };
}

export async function toggleTeamActive(id: number, isActive: boolean) {
  const adminUser = await checkAdminAuth();

  await db.update(teams).set({ isActive, updatedAt: new Date() }).where(eq(teams.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'team',
    entityId: String(id),
    action: AUDIT_ACTIONS.TOGGLE_ACTIVE,
    afterData: { isActive },
  });

  revalidatePath('/admin/settings/teams');

  return { success: true };
}
