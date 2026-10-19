'use server';

import { db } from '@/lib/db';
import { users, roles, units, developerRoles } from '@/lib/db/schema';
import { eq, and, or, like, desc, asc, sql, count } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import bcrypt from 'bcryptjs';
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

export async function getAllUsers(params?: {
  roleIds?: number[];
  unitIds?: number[];
  isActive?: boolean | null;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'email' | 'lastLoginAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}) {
  await checkAdminAuth();

  const {
    roleIds = [],
    unitIds = [],
    isActive = null,
    search = '',
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params || {};

  const offset = (page - 1) * limit;
  const conditions = [];

  if (roleIds.length > 0) {
    conditions.push(sql`${users.roleId} IN (${sql.join(roleIds.map(id => sql`${id}`), sql`, `)})`);
  }

  if (unitIds.length > 0) {
    conditions.push(sql`${users.unitId} IN (${sql.join(unitIds.map(id => sql`${id}`), sql`, `)})`);
  }

  if (isActive !== null) {
    conditions.push(eq(users.isActive, isActive));
  }

  if (search) {
    conditions.push(
      or(
        like(users.name, `%${search}%`),
        like(users.email, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const sortColumn = {
    name: users.name,
    email: users.email,
    lastLoginAt: users.lastLoginAt,
    createdAt: users.createdAt,
  }[sortBy];

  const orderByClause = sortOrder === 'asc' ? asc(sortColumn) : desc(sortColumn);

  const [userList, totalCountResult] = await Promise.all([
    db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        roleName: roles.name,
        roleCode: roles.code,
        developerRoleId: users.developerRoleId,
        unitId: users.unitId,
        unitName: units.name,
        phone: users.phone,
        isActive: users.isActive,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .leftJoin(roles, eq(users.roleId, roles.id))
      .leftJoin(units, eq(users.unitId, units.id))
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset),
    db
      .select({ count: count() })
      .from(users)
      .where(whereClause)
  ]);

  return {
    users: userList,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
  };
}

export async function getUserById(id: number) {
  await checkAdminAuth();

  const result = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      roleId: users.roleId,
      roleName: roles.name,
      roleCode: roles.code,
      developerRoleId: users.developerRoleId,
      unitId: users.unitId,
      unitName: units.name,
      phone: users.phone,
      isActive: users.isActive,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(units, eq(users.unitId, units.id))
    .where(eq(users.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createUser(data: {
  name: string;
  email: string;
  password: string;
  roleId: number;
  developerRoleId?: number | null;
  unitId?: number | null;
  phone?: string | null;
}) {
  const adminUser = await checkAdminAuth();

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existingUser.length > 0) {
    throw new Error('Email already exists');
  }

  // Validate developer role requirement
  const role = await db.select().from(roles).where(eq(roles.id, data.roleId)).limit(1);
  if (role[0]?.code === 'DEVELOPER' && !data.developerRoleId) {
    throw new Error('Developer role is required when creating a Developer user');
  }

  const passwordHash = await bcrypt.hash(data.password, 10);

  const result = await db.insert(users).values({
    name: data.name,
    email: data.email,
    passwordHash,
    roleId: data.roleId,
    developerRoleId: data.developerRoleId || null,
    unitId: data.unitId || null,
    phone: data.phone || null,
    isActive: true,
  });

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.USERS,
    entityType: 'user',
    entityId: String(result[0].insertId),
    action: AUDIT_ACTIONS.CREATE,
    afterData: { name: data.name, email: data.email, roleId: data.roleId, developerRoleId: data.developerRoleId, unitId: data.unitId },
  });

  revalidatePath('/admin/settings/users');

  return { success: true, id: result[0].insertId };
}

export async function updateUser(
  id: number,
  data: {
    name?: string;
    email?: string;
    roleId?: number;
    developerRoleId?: number | null;
    unitId?: number | null;
    phone?: string | null;
    isActive?: boolean;
  }
) {
  const adminUser = await checkAdminAuth();

  if (id === adminUser.id && data.roleId && data.roleId !== adminUser.roleId) {
    throw new Error('Cannot change your own role');
  }

  if (id === adminUser.id && data.isActive === false) {
    throw new Error('Cannot deactivate your own account');
  }

  if (data.email) {
    const existingUser = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, data.email), sql`${users.id} != ${id}`))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('Email already exists');
    }
  }

  // Validate developer role requirement
  if (data.roleId) {
    const role = await db.select().from(roles).where(eq(roles.id, data.roleId)).limit(1);
    if (role[0]?.code === 'DEVELOPER' && !data.developerRoleId) {
      throw new Error('Developer role is required when role is Developer');
    }
  }

  const [currentUser] = await db.select().from(users).where(eq(users.id, id)).limit(1);

  await db
    .update(users)
    .set({
      ...(data.name && { name: data.name }),
      ...(data.email && { email: data.email }),
      ...(data.roleId && { roleId: data.roleId }),
      ...(data.developerRoleId !== undefined && { developerRoleId: data.developerRoleId }),
      ...(data.unitId !== undefined && { unitId: data.unitId }),
      ...(data.phone !== undefined && { phone: data.phone }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(users.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.USERS,
    entityType: 'user',
    entityId: String(id),
    action: AUDIT_ACTIONS.UPDATE,
    beforeData: { name: currentUser.name, email: currentUser.email, roleId: currentUser.roleId, developerRoleId: currentUser.developerRoleId, isActive: currentUser.isActive },
    afterData: data,
  });

  revalidatePath('/admin/settings/users');

  return { success: true };
}

export async function toggleUserActive(id: number, isActive: boolean) {
  const adminUser = await checkAdminAuth();

  if (id === adminUser.id && !isActive) {
    throw new Error('Cannot deactivate your own account');
  }

  await db.update(users).set({ isActive, updatedAt: new Date() }).where(eq(users.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.USERS,
    entityType: 'user',
    entityId: String(id),
    action: AUDIT_ACTIONS.TOGGLE_ACTIVE,
    afterData: { isActive },
  });

  revalidatePath('/admin/settings/users');

  return { success: true };
}

export async function changePassword(id: number, newPassword: string) {
  const adminUser = await checkAdminAuth();

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await db
    .update(users)
    .set({ passwordHash, updatedAt: new Date() })
    .where(eq(users.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.USERS,
    entityType: 'user',
    entityId: String(id),
    action: AUDIT_ACTIONS.CHANGE_PASSWORD,
    afterData: { userId: id },
  });

  revalidatePath('/admin/settings/users');

  return { success: true };
}

export async function getUserStats(id: number) {
  await checkAdminAuth();

  const { requests } = await import('@/lib/db/schema');

  const stats = await db
    .select({
      status: requests.status,
      count: count(),
    })
    .from(requests)
    .where(eq(requests.requesterId, id))
    .groupBy(requests.status);

  const totalSubmitted = stats.reduce((sum, stat) => sum + stat.count, 0);
  const completed = stats.find(s => s.status === 'done')?.count || 0;
  const inProgress = stats.find(s => s.status === 'ongoing')?.count || 0;
  const pending = stats.filter(s => ['submitted', 'in_review', 'approved'].includes(s.status))
    .reduce((sum, stat) => sum + stat.count, 0);

  return {
    totalSubmitted,
    completed,
    inProgress,
    pending,
  };
}

export async function getRolesForDropdown() {
  await checkAdminAuth();

  const rolesList = await db.select({ id: roles.id, name: roles.name, code: roles.code }).from(roles);

  return rolesList;
}

export async function getUnitsForDropdown() {
  await checkAdminAuth();

  const unitsList = await db
    .select({ id: units.id, name: units.name, code: units.code })
    .from(units)
    .where(eq(units.isActive, true));

  return unitsList;
}

export async function getDeveloperRolesForDropdown() {
  await checkAdminAuth();

  const devRolesList = await db
    .select({ id: developerRoles.id, name: developerRoles.name, code: developerRoles.code })
    .from(developerRoles)
    .where(eq(developerRoles.isActive, true))
    .orderBy(asc(developerRoles.sortOrder));

  return devRolesList;
}
