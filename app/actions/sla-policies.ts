'use server';

import { db } from '@/lib/db';
import { slaPolicies, priorities } from '@/lib/db/schema';
import { eq, and, or, desc, count, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { revalidatePath } from 'next/cache';

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session.user;
}

export async function getSLAPolicies(params?: {
  requestType?: string;
  priorityId?: number;
  isActive?: boolean | null;
  page?: number;
  limit?: number;
}) {
  await checkAdminAuth();

  const {
    requestType,
    priorityId,
    isActive = null,
    page = 1,
    limit = 20,
  } = params || {};

  const offset = (page - 1) * limit;
  const conditions = [];

  if (requestType) {
    conditions.push(eq(slaPolicies.requestType, requestType as 'new_application' | 'rfc'));
  }

  if (priorityId) {
    conditions.push(eq(slaPolicies.priorityId, priorityId));
  }

  if (isActive !== null) {
    conditions.push(eq(slaPolicies.isActive, isActive));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  const [policiesList, totalCountResult] = await Promise.all([
    db
      .select({
        id: slaPolicies.id,
        requestType: slaPolicies.requestType,
        priorityId: slaPolicies.priorityId,
        priorityName: priorities.name,
        priorityCode: priorities.code,
        targetHours: slaPolicies.targetHours,
        isActive: slaPolicies.isActive,
        effectiveFrom: slaPolicies.effectiveFrom,
        effectiveTo: slaPolicies.effectiveTo,
        createdAt: slaPolicies.createdAt,
        updatedAt: slaPolicies.updatedAt,
      })
      .from(slaPolicies)
      .leftJoin(priorities, eq(slaPolicies.priorityId, priorities.id))
      .where(whereClause)
      .orderBy(desc(slaPolicies.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: count() }).from(slaPolicies).where(whereClause),
  ]);

  return {
    policies: policiesList,
    total: totalCountResult[0]?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalCountResult[0]?.count || 0) / limit),
  };
}

export async function getSLAPolicyById(id: number) {
  await checkAdminAuth();

  const result = await db
    .select({
      id: slaPolicies.id,
      requestType: slaPolicies.requestType,
      priorityId: slaPolicies.priorityId,
      priorityName: priorities.name,
      targetHours: slaPolicies.targetHours,
      isActive: slaPolicies.isActive,
      effectiveFrom: slaPolicies.effectiveFrom,
      effectiveTo: slaPolicies.effectiveTo,
      createdAt: slaPolicies.createdAt,
      updatedAt: slaPolicies.updatedAt,
    })
    .from(slaPolicies)
    .leftJoin(priorities, eq(slaPolicies.priorityId, priorities.id))
    .where(eq(slaPolicies.id, id))
    .limit(1);

  return result[0] || null;
}

export async function createSLAPolicy(data: {
  requestType: 'new_application' | 'rfc';
  priorityId: number;
  targetHours: number;
  effectiveFrom?: string | null;
  effectiveTo?: string | null;
}) {
  await checkAdminAuth();

  // Check for overlapping policies
  const overlap = await checkSLAPolicyOverlap(
    data.requestType,
    data.priorityId,
    data.effectiveFrom || null,
    data.effectiveTo || null
  );

  if (overlap) {
    throw new Error('An active SLA policy already exists for this type and priority with overlapping dates');
  }

  const result = await db.insert(slaPolicies).values({
    requestType: data.requestType as 'new_application' | 'rfc',
    priorityId: data.priorityId,
    targetHours: data.targetHours,
    effectiveFrom: data.effectiveFrom ? new Date(data.effectiveFrom) : null,
    effectiveTo: data.effectiveTo ? new Date(data.effectiveTo) : null,
    isActive: true,
  });

  revalidatePath('/admin/settings/sla-policies');

  return { success: true, id: result[0].insertId };
}

export async function updateSLAPolicy(
  id: number,
  data: {
    requestType?: 'new_application' | 'rfc';
    priorityId?: number;
    targetHours?: number;
    effectiveFrom?: string | null;
    effectiveTo?: string | null;
    isActive?: boolean;
  }
) {
  await checkAdminAuth();

  // If changing type, priority, or dates, check for overlaps
  if (data.requestType || data.priorityId || data.effectiveFrom !== undefined || data.effectiveTo !== undefined) {
    const current = await getSLAPolicyById(id);
    if (current) {
      const overlap = await checkSLAPolicyOverlap(
        data.requestType || current.requestType!,
        data.priorityId || current.priorityId!,
        data.effectiveFrom !== undefined ? data.effectiveFrom : (current.effectiveFrom ? current.effectiveFrom.toString() : null),
        data.effectiveTo !== undefined ? data.effectiveTo : (current.effectiveTo ? current.effectiveTo.toString() : null),
        id
      );

      if (overlap) {
        throw new Error('An active SLA policy already exists for this type and priority with overlapping dates');
      }
    }
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };
  
  if (data.requestType) updateData.requestType = data.requestType as 'new_application' | 'rfc';
  if (data.priorityId) updateData.priorityId = data.priorityId;
  if (data.targetHours) updateData.targetHours = data.targetHours;
  if (data.effectiveFrom !== undefined) updateData.effectiveFrom = data.effectiveFrom ? new Date(data.effectiveFrom) : null;
  if (data.effectiveTo !== undefined) updateData.effectiveTo = data.effectiveTo ? new Date(data.effectiveTo) : null;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;

  await db
    .update(slaPolicies)
    .set(updateData)
    .where(eq(slaPolicies.id, id));

  revalidatePath('/admin/settings/sla-policies');

  return { success: true };
}

export async function toggleSLAPolicyActive(id: number, isActive: boolean) {
  await checkAdminAuth();

  await db
    .update(slaPolicies)
    .set({ isActive, updatedAt: new Date() })
    .where(eq(slaPolicies.id, id));

  revalidatePath('/admin/settings/sla-policies');

  return { success: true };
}

async function checkSLAPolicyOverlap(
  requestType: 'new_application' | 'rfc',
  priorityId: number,
  effectiveFrom: string | null,
  effectiveTo: string | null,
  excludeId?: number
): Promise<boolean> {
  const conditions = [
    eq(slaPolicies.requestType, requestType),
    eq(slaPolicies.priorityId, priorityId),
    eq(slaPolicies.isActive, true),
  ];

  if (excludeId) {
    conditions.push(sql`${slaPolicies.id} != ${excludeId}`);
  }

  // Check for date overlap
  // Case 1: New policy has no end date (indefinite) - check if any existing policy overlaps
  // Case 2: New policy has date range - check if it overlaps with existing ranges
  if (!effectiveTo) {
    // Indefinite policy - check if any active policy exists (with or without end date)
    if (effectiveFrom) {
      conditions.push(
        or(
          sql`${slaPolicies.effectiveTo} IS NULL`,
          sql`${slaPolicies.effectiveTo} >= ${effectiveFrom}`
        )!
      );
    }
  } else {
    // Has end date - check for overlap
    const fromCondition = effectiveFrom
      ? sql`(${slaPolicies.effectiveTo} IS NULL OR ${slaPolicies.effectiveTo} >= ${effectiveFrom})`
      : sql`TRUE`;
    const toCondition = sql`(${slaPolicies.effectiveFrom} IS NULL OR ${slaPolicies.effectiveFrom} <= ${effectiveTo})`;
    
    conditions.push(and(fromCondition, toCondition)!);
  }

  const existing = await db
    .select({ id: slaPolicies.id })
    .from(slaPolicies)
    .where(and(...conditions))
    .limit(1);

  return existing.length > 0;
}

export async function getPrioritiesForSLA() {
  await checkAdminAuth();

  const prioritiesList = await db
    .select({
      id: priorities.id,
      name: priorities.name,
      code: priorities.code,
    })
    .from(priorities)
    .where(eq(priorities.isActive, true))
    .orderBy(priorities.sortOrder);

  return prioritiesList;
}
