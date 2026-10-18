'use server';

import { db } from '@/lib/db';
import { units, priorities, developerRoles, users, requestApplications, requests, slaHolidays } from '@/lib/db/schema';
import { eq, and, or, like, desc, asc, count, sql, gte, lte, between } from 'drizzle-orm';
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

// ==================== DEVELOPER ROLES ====================

export async function getDeveloperRoles(params?: {
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
    conditions.push(eq(developerRoles.isActive, isActive));
  }

  if (search) {
    conditions.push(
      or(
        like(developerRoles.name, `%${search}%`),
        like(developerRoles.code, `%${search}%`),
        like(developerRoles.description, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [rolesList, totalCountResult] = await Promise.all([
    db
      .select()
      .from(developerRoles)
      .where(whereClause)
      .orderBy(asc(developerRoles.sortOrder), asc(developerRoles.name))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(developerRoles).where(whereClause),
  ]);

  return {
    roles: rolesList,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
  };
}

export async function createDeveloperRole(data: {
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
}) {
  const adminUser = await checkAdminAuth();

  // Check if code already exists
  const existing = await db
    .select({ id: developerRoles.id })
    .from(developerRoles)
    .where(eq(developerRoles.code, data.code))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Developer role code already exists');
  }

  // Auto-assign sort order if not provided
  let sortOrder = data.sortOrder || 0;
  if (!data.sortOrder) {
    const maxResult = await db
      .select({ max: sql<number>`MAX(${developerRoles.sortOrder})` })
      .from(developerRoles);
    sortOrder = (maxResult[0]?.max || 0) + 1;
  }

  const result = await db.insert(developerRoles).values({
    code: data.code,
    name: data.name,
    description: data.description || null,
    sortOrder,
    isActive: true,
  });

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'developer_role',
    entityId: String(result[0].insertId),
    action: AUDIT_ACTIONS.CREATE,
    afterData: { code: data.code, name: data.name, description: data.description, sortOrder },
  });

  revalidatePath('/admin/settings/developer-roles');

  return { success: true, id: result[0].insertId };
}

export async function updateDeveloperRole(
  id: number,
  data: {
    code?: string;
    name?: string;
    description?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  const adminUser = await checkAdminAuth();

  // Check if code already exists (excluding current role)
  if (data.code) {
    const existing = await db
      .select({ id: developerRoles.id })
      .from(developerRoles)
      .where(and(eq(developerRoles.code, data.code), sql`${developerRoles.id} != ${id}`))
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Developer role code already exists');
    }
  }

  await db
    .update(developerRoles)
    .set({
      ...(data.code && { code: data.code }),
      ...(data.name && { name: data.name }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(developerRoles.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'developer_role',
    entityId: String(id),
    action: AUDIT_ACTIONS.UPDATE,
    afterData: data,
  });

  revalidatePath('/admin/settings/developer-roles');

  return { success: true };
}

export async function reorderDeveloperRoles(reorderedIds: number[]) {
  await checkAdminAuth();

  // Update sort order based on array index
  for (let i = 0; i < reorderedIds.length; i++) {
    await db
      .update(developerRoles)
      .set({ sortOrder: i })
      .where(eq(developerRoles.id, reorderedIds[i]));
  }

  revalidatePath('/admin/settings/developer-roles');

  return { success: true };
}

export async function toggleDeveloperRoleActive(id: number, isActive: boolean) {
  const adminUser = await checkAdminAuth();

  // Check if role is in use by any developer
  if (!isActive) {
    const usersWithRole = await db
      .select({ count: count() })
      .from(users)
      .where(eq(users.developerRoleId, id));

    if (usersWithRole[0]?.count > 0) {
      throw new Error(
        `Cannot deactivate: ${usersWithRole[0].count} developer(s) currently have this role`
      );
    }
  }

  await db
    .update(developerRoles)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(developerRoles.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'developer_role',
    entityId: String(id),
    action: AUDIT_ACTIONS.TOGGLE_ACTIVE,
    afterData: { isActive },
  });

  revalidatePath('/admin/settings/developer-roles');

  return { success: true };
}

export async function deleteDeveloperRole(id: number) {
  const adminUser = await checkAdminAuth();

  // Check if role is in use by any developer
  const usersWithRole = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.developerRoleId, id));

  if (usersWithRole[0]?.count > 0) {
    throw new Error(
      `Cannot delete: ${usersWithRole[0].count} developer(s) currently have this role. Please reassign them first.`
    );
  }

  await db.delete(developerRoles).where(eq(developerRoles.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'developer_role',
    entityId: String(id),
    action: AUDIT_ACTIONS.DELETE,
  });

  revalidatePath('/admin/settings/developer-roles');

  return { success: true };
}

// ==================== APPLICATION MASTER ====================

export async function getApplications(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  await checkAdminAuth();

  const {
    search = '',
    page = 1,
    limit = 20,
  } = params || {};

  const offset = (page - 1) * limit;
  const conditions = [];

  if (search) {
    conditions.push(
      or(
        like(requestApplications.applicationName, `%${search}%`),
        like(requestApplications.description, `%${search}%`)
      )
    );
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  // Get applications with creator info and RFC count
  const [applicationsList, totalCountResult] = await Promise.all([
    db
      .select({
        id: requestApplications.id,
        applicationName: requestApplications.applicationName,
        description: requestApplications.description,
        currentVersion: requestApplications.currentVersion,
        createdBy: requestApplications.createdBy,
        createdAt: requestApplications.createdAt,
        updatedAt: requestApplications.updatedAt,
        creatorName: users.name,
        creatorEmail: users.email,
      })
      .from(requestApplications)
      .leftJoin(users, eq(requestApplications.createdBy, users.id))
      .where(whereClause)
      .orderBy(desc(requestApplications.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(requestApplications).where(whereClause),
  ]);

  // Get RFC counts for each application
  const applicationsWithCounts = await Promise.all(
    applicationsList.map(async (app) => {
      const rfcCount = await db
        .select({ count: count() })
        .from(requests)
        .where(
          and(
            eq(requests.applicationId, app.id),
            eq(requests.requestType, 'rfc')
          )
        );

      return {
        ...app,
        rfcCount: rfcCount[0]?.count || 0,
      };
    })
  );

  return {
    applications: applicationsWithCounts,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
  };
}

export async function getApplicationHistory(applicationId: number) {
  await checkAdminAuth();

  // Get application details
  const application = await db
    .select({
      id: requestApplications.id,
      applicationName: requestApplications.applicationName,
      description: requestApplications.description,
      currentVersion: requestApplications.currentVersion,
      createdAt: requestApplications.createdAt,
    })
    .from(requestApplications)
    .where(eq(requestApplications.id, applicationId))
    .limit(1);

  if (application.length === 0) {
    throw new Error('Application not found');
  }

  // Get all related requests (NEW_APPLICATION + RFCs)
  const relatedRequests = await db
    .select({
      id: requests.id,
      requestNo: requests.requestNo,
      requestType: requests.requestType,
      title: requests.title,
      requestedVersion: requests.requestedVersion,
      status: requests.status,
      submittedAt: requests.submittedAt,
      approvedAt: requests.approvedAt,
      completedAt: requests.completedAt,
      requesterName: users.name,
    })
    .from(requests)
    .leftJoin(users, eq(requests.requesterId, users.id))
    .where(
      or(
        and(
          eq(requests.applicationId, applicationId),
          eq(requests.requestType, 'rfc')
        ),
        and(
          eq(requests.applicationId, applicationId),
          eq(requests.requestType, 'new_application')
        )
      )
    )
    .orderBy(desc(requests.submittedAt));

  return {
    application: application[0],
    history: relatedRequests,
  };
}

// ==================== SLA HOLIDAYS ====================

export async function getSLAHolidays(params?: {
  year?: number;
  isActive?: boolean | null;
  search?: string;
  page?: number;
  limit?: number;
}) {
  await checkAdminAuth();

  const {
    year = new Date().getFullYear(),
    isActive = null,
    search = '',
    page = 1,
    limit = 100, // Show more holidays per page
  } = params || {};

  const offset = (page - 1) * limit;
  const conditions = [];

  // Filter by year
  if (year) {
    const startDate = new Date(`${year}-01-01`);
    const endDate = new Date(`${year}-12-31`);
    conditions.push(
      between(slaHolidays.holidayDate, startDate, endDate)
    );
  }

  if (isActive !== null) {
    conditions.push(eq(slaHolidays.isActive, isActive));
  }

  if (search) {
    conditions.push(like(slaHolidays.description, `%${search}%`));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [holidaysList, totalCountResult] = await Promise.all([
    db
      .select()
      .from(slaHolidays)
      .where(whereClause)
      .orderBy(asc(slaHolidays.holidayDate))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(slaHolidays).where(whereClause),
  ]);

  return {
    holidays: holidaysList,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
    year,
  };
}

export async function createSLAHoliday(data: {
  holidayDate: string;
  description: string;
}) {
  const adminUser = await checkAdminAuth();

  // Check if holiday date already exists
  const existing = await db
    .select({ id: slaHolidays.id })
    .from(slaHolidays)
    .where(eq(slaHolidays.holidayDate, new Date(data.holidayDate)))
    .limit(1);

  if (existing.length > 0) {
    throw new Error('Holiday date already exists');
  }

  const result = await db.insert(slaHolidays).values({
    holidayDate: new Date(data.holidayDate),
    description: data.description,
    isActive: true,
  });

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'sla_holiday',
    entityId: String(result[0].insertId),
    action: AUDIT_ACTIONS.CREATE,
    afterData: { holidayDate: data.holidayDate, description: data.description },
  });

  revalidatePath('/admin/settings/sla-holidays');

  return { success: true, id: result[0].insertId };
}

export async function updateSLAHoliday(
  id: number,
  data: {
    holidayDate?: string;
    description?: string;
    isActive?: boolean;
  }
) {
  const adminUser = await checkAdminAuth();

  // Check if new date already exists (excluding current holiday)
  if (data.holidayDate) {
    const existing = await db
      .select({ id: slaHolidays.id })
      .from(slaHolidays)
      .where(
        and(
          eq(slaHolidays.holidayDate, new Date(data.holidayDate)),
          sql`${slaHolidays.id} != ${id}`
        )
      )
      .limit(1);

    if (existing.length > 0) {
      throw new Error('Holiday date already exists');
    }
  }

  await db
    .update(slaHolidays)
    .set({
      ...(data.holidayDate && { holidayDate: new Date(data.holidayDate) }),
      ...(data.description && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
      updatedAt: new Date(),
    })
    .where(eq(slaHolidays.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'sla_holiday',
    entityId: String(id),
    action: AUDIT_ACTIONS.UPDATE,
    afterData: data,
  });

  revalidatePath('/admin/settings/sla-holidays');

  return { success: true };
}

export async function deleteSLAHoliday(id: number) {
  const adminUser = await checkAdminAuth();

  await db.delete(slaHolidays).where(eq(slaHolidays.id, id));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'sla_holiday',
    entityId: String(id),
    action: AUDIT_ACTIONS.DELETE,
  });

  revalidatePath('/admin/settings/sla-holidays');

  return { success: true };
}

export async function bulkDeleteSLAHolidays(year: number) {
  const adminUser = await checkAdminAuth();

  const startDate = new Date(`${year}-01-01`);
  const endDate = new Date(`${year}-12-31`);

  // Get count before delete for audit
  const countResult = await db
    .select({ count: count() })
    .from(slaHolidays)
    .where(between(slaHolidays.holidayDate, startDate, endDate));

  const deletedCount = countResult[0]?.count || 0;

  if (deletedCount === 0) {
    throw new Error(`No holidays found for year ${year}`);
  }

  await db
    .delete(slaHolidays)
    .where(between(slaHolidays.holidayDate, startDate, endDate));

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'sla_holiday',
    entityId: `bulk_delete_${year}`,
    action: AUDIT_ACTIONS.DELETE,
    afterData: { year, deletedCount },
  });

  revalidatePath('/admin/settings/sla-holidays');

  return { success: true, deletedCount };
}

export async function bulkImportSLAHolidays(holidays: Array<{
  holidayDate: string;
  description: string;
}>) {
  const adminUser = await checkAdminAuth();

  if (holidays.length === 0) {
    throw new Error('No holidays to import');
  }

  if (holidays.length > 500) {
    throw new Error('Cannot import more than 500 holidays at once');
  }

  // Validate date format
  const invalidDates = holidays.filter((h) => {
    const datePattern = /^\d{4}-\d{2}-\d{2}$/;
    return !datePattern.test(h.holidayDate);
  });

  if (invalidDates.length > 0) {
    throw new Error(
      `Invalid date format. Expected YYYY-MM-DD. Found: ${invalidDates[0].holidayDate}`
    );
  }

  // Get existing dates to avoid duplicates
  const existingDates = await db
    .select({ date: slaHolidays.holidayDate })
    .from(slaHolidays);

  const existingDateSet = new Set(existingDates.map((d) => d.date.toISOString().split('T')[0]));

  // Filter out duplicates
  const newHolidays = holidays.filter((h) => !existingDateSet.has(h.holidayDate));

  if (newHolidays.length === 0) {
    throw new Error('All holidays already exist in the database');
  }

  // Bulk insert
  await db.insert(slaHolidays).values(
    newHolidays.map((h) => ({
      holidayDate: new Date(h.holidayDate),
      description: h.description,
      isActive: true,
    }))
  );

  logAudit({
    actorUserId: adminUser.id,
    actorName: adminUser.name,
    module: AUDIT_MODULES.SETTINGS,
    entityType: 'sla_holiday',
    entityId: 'bulk_import',
    action: AUDIT_ACTIONS.CREATE,
    afterData: {
      totalSubmitted: holidays.length,
      imported: newHolidays.length,
      skipped: holidays.length - newHolidays.length,
    },
  });

  revalidatePath('/admin/settings/sla-holidays');

  return {
    success: true,
    imported: newHolidays.length,
    skipped: holidays.length - newHolidays.length,
  };
}

// Indonesian national holidays preset (2024-2030)
export async function importIndonesianHolidays(year: number) {
  const adminUser = await checkAdminAuth();

  const indonesianHolidays: Record<number, Array<{ date: string; description: string }>> = {
    2024: [
      { date: '2024-01-01', description: 'Tahun Baru Masehi' },
      { date: '2024-02-08', description: 'Isra Mikraj Nabi Muhammad SAW' },
      { date: '2024-02-10', description: 'Tahun Baru Imlek 2575 Kongzili' },
      { date: '2024-02-14', description: 'Pemilu Serentak' },
      { date: '2024-03-11', description: 'Hari Raya Nyepi Tahun Baru Saka 1946' },
      { date: '2024-03-29', description: 'Wafat Isa Al Masih' },
      { date: '2024-04-10', description: 'Hari Raya Idul Fitri 1445 H' },
      { date: '2024-04-11', description: 'Hari Raya Idul Fitri 1445 H' },
      { date: '2024-05-01', description: 'Hari Buruh Internasional' },
      { date: '2024-05-09', description: 'Kenaikan Isa Al Masih' },
      { date: '2024-05-23', description: 'Hari Raya Waisak 2568 BE' },
      { date: '2024-06-01', description: 'Hari Lahir Pancasila' },
      { date: '2024-06-17', description: 'Hari Raya Idul Adha 1445 H' },
      { date: '2024-07-07', description: 'Tahun Baru Islam 1446 H' },
      { date: '2024-08-17', description: 'Hari Kemerdekaan RI' },
      { date: '2024-09-16', description: 'Maulid Nabi Muhammad SAW' },
      { date: '2024-12-25', description: 'Hari Raya Natal' },
    ],
    2025: [
      { date: '2025-01-01', description: 'Tahun Baru Masehi' },
      { date: '2025-01-29', description: 'Tahun Baru Imlek 2576 Kongzili' },
      { date: '2025-02-27', description: 'Isra Mikraj Nabi Muhammad SAW' },
      { date: '2025-03-29', description: 'Hari Raya Nyepi Tahun Baru Saka 1947' },
      { date: '2025-03-31', description: 'Hari Raya Idul Fitri 1446 H' },
      { date: '2025-04-01', description: 'Hari Raya Idul Fitri 1446 H' },
      { date: '2025-04-18', description: 'Wafat Isa Al Masih' },
      { date: '2025-05-01', description: 'Hari Buruh Internasional' },
      { date: '2025-05-12', description: 'Hari Raya Waisak 2569 BE' },
      { date: '2025-05-29', description: 'Kenaikan Isa Al Masih' },
      { date: '2025-06-01', description: 'Hari Lahir Pancasila' },
      { date: '2025-06-06', description: 'Hari Raya Idul Adha 1446 H' },
      { date: '2025-06-26', description: 'Tahun Baru Islam 1447 H' },
      { date: '2025-08-17', description: 'Hari Kemerdekaan RI' },
      { date: '2025-09-05', description: 'Maulid Nabi Muhammad SAW' },
      { date: '2025-12-25', description: 'Hari Raya Natal' },
    ],
    2026: [
      { date: '2026-01-01', description: 'Tahun Baru Masehi' },
      { date: '2026-02-17', description: 'Tahun Baru Imlek 2577 Kongzili' },
      { date: '2026-02-17', description: 'Isra Mikraj Nabi Muhammad SAW' },
      { date: '2026-03-19', description: 'Hari Raya Nyepi Tahun Baru Saka 1948' },
      { date: '2026-03-20', description: 'Hari Raya Idul Fitri 1447 H' },
      { date: '2026-03-21', description: 'Hari Raya Idul Fitri 1447 H' },
      { date: '2026-04-03', description: 'Wafat Isa Al Masih' },
      { date: '2026-05-01', description: 'Hari Buruh Internasional' },
      { date: '2026-05-01', description: 'Hari Raya Waisak 2570 BE' },
      { date: '2026-05-14', description: 'Kenaikan Isa Al Masih' },
      { date: '2026-05-27', description: 'Hari Raya Idul Adha 1447 H' },
      { date: '2026-06-01', description: 'Hari Lahir Pancasila' },
      { date: '2026-06-16', description: 'Tahun Baru Islam 1448 H' },
      { date: '2026-08-17', description: 'Hari Kemerdekaan RI' },
      { date: '2026-08-25', description: 'Maulid Nabi Muhammad SAW' },
      { date: '2026-12-25', description: 'Hari Raya Natal' },
    ],
  };

  const holidays = indonesianHolidays[year];

  if (!holidays) {
    throw new Error(`Indonesian holidays not available for year ${year}. Available: 2024-2026`);
  }

  // Use bulk import function
  return await bulkImportSLAHolidays(
    holidays.map((h) => ({
      holidayDate: h.date,
      description: h.description,
    }))
  );
}
