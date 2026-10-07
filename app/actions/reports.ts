'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { requests, priorities, units, requestTeamAssignments, developerRoles } from '@/lib/db/schema';
import { eq, and, gte, lte, sql, isNull } from 'drizzle-orm';
import { getQuarterFromDate, calculateAchievementRate, generateMonthlyTrend } from '@/lib/utils/report-calculations';

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    throw new Error('Unauthorized: Admin access required');
  }
  return session;
}

export async function getLaptriData(filters: {
  year: number;
  quarter?: 1 | 2 | 3 | 4;
  requestType?: 'new_application' | 'rfc';
}) {
  await checkAdminAuth();

  const conditions = [
    eq(requests.status, 'completed'),
    sql`YEAR(${requests.completedAt}) = ${filters.year}`,
  ];

  if (filters.quarter) {
    const quarterStart = (filters.quarter - 1) * 3 + 1;
    const quarterEnd = filters.quarter * 3;
    conditions.push(
      sql`MONTH(${requests.completedAt}) >= ${quarterStart} AND MONTH(${requests.completedAt}) <= ${quarterEnd}`
    );
  }

  if (filters.requestType) {
    conditions.push(eq(requests.requestType, filters.requestType));
  }

  const result = await db
    .select({
      id: requests.id,
      requestNo: requests.requestNo,
      requestType: requests.requestType,
      title: requests.title,
      priorityId: requests.priorityId,
      priorityName: priorities.name,
      requesterName: requests.requesterName,
      requesterUnitId: requests.requesterUnitId,
      unitName: units.name,
      completedAt: requests.completedAt,
      actualDurationHours: requests.actualDurationHours,
    })
    .from(requests)
    .leftJoin(priorities, eq(requests.priorityId, priorities.id))
    .leftJoin(units, eq(requests.requesterUnitId, units.id))
    .where(and(...conditions))
    .orderBy(sql`${requests.completedAt} DESC`);

  return result;
}

export async function getLaptriSummary(year: number) {
  await checkAdminAuth();

  const allCompleted = await db
    .select({
      requestType: requests.requestType,
      priorityId: requests.priorityId,
      completedAt: requests.completedAt,
      actualDurationHours: requests.actualDurationHours,
    })
    .from(requests)
    .where(
      and(
        eq(requests.status, 'completed'),
        sql`YEAR(${requests.completedAt}) = ${year}`
      )
    );

  const quarterCounts = { Q1: 0, Q2: 0, Q3: 0, Q4: 0 };
  const typeBreakdown = { new_application: 0, rfc: 0 };
  const typeDurations = { new_application: [] as number[], rfc: [] as number[] };
  const priorityDurations = { low: [] as number[], medium: [] as number[], high: [] as number[], critical: [] as number[] };

  allCompleted.forEach((req) => {
    if (!req.completedAt) return;

    const quarter = getQuarterFromDate(req.completedAt);
    quarterCounts[`Q${quarter}` as keyof typeof quarterCounts]++;

    if (req.requestType === 'new_application') {
      typeBreakdown.new_application++;
      if (req.actualDurationHours) typeDurations.new_application.push(req.actualDurationHours);
    } else if (req.requestType === 'rfc') {
      typeBreakdown.rfc++;
      if (req.actualDurationHours) typeDurations.rfc.push(req.actualDurationHours);
    }

    if (req.actualDurationHours) {
      if (req.priorityId === 1) priorityDurations.low.push(req.actualDurationHours);
      else if (req.priorityId === 2) priorityDurations.medium.push(req.actualDurationHours);
      else if (req.priorityId === 3) priorityDurations.high.push(req.actualDurationHours);
      else if (req.priorityId === 4) priorityDurations.critical.push(req.actualDurationHours);
    }
  });

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgCompletionByType = {
    new_application: avg(typeDurations.new_application),
    rfc: avg(typeDurations.rfc),
  };

  const avgCompletionByPriority = {
    low: avg(priorityDurations.low),
    medium: avg(priorityDurations.medium),
    high: avg(priorityDurations.high),
    critical: avg(priorityDurations.critical),
  };

  const monthlyTrend = generateMonthlyTrend(allCompleted, year);

  // Get developer role distribution for completed requests
  const roleAssignments = await db
    .select({
      requestId: requestTeamAssignments.requestId,
      developerRoleCode: developerRoles.code,
      developerRoleName: developerRoles.name,
      actualDurationHours: requests.actualDurationHours,
      completedAt: requests.completedAt,
    })
    .from(requestTeamAssignments)
    .innerJoin(requests, eq(requestTeamAssignments.requestId, requests.id))
    .leftJoin(developerRoles, eq(requestTeamAssignments.developerRoleId, developerRoles.id))
    .where(
      and(
        eq(requests.status, 'completed'),
        sql`YEAR(${requests.completedAt}) = ${year}`,
        isNull(requestTeamAssignments.unassignedAt)
      )
    );

  // Aggregate by developer role
  const roleMetricsMap = new Map<string, { 
    code: string; 
    name: string; 
    count: number; 
    durations: number[];
    latestCompletedAt: Date | null;
  }>();

  roleAssignments.forEach((assignment) => {
    const roleCode = assignment.developerRoleCode || 'UNKNOWN';
    const roleName = assignment.developerRoleName || 'Unknown Role';
    
    if (!roleMetricsMap.has(roleCode)) {
      roleMetricsMap.set(roleCode, {
        code: roleCode,
        name: roleName,
        count: 0,
        durations: [],
        latestCompletedAt: null,
      });
    }
    
    const metrics = roleMetricsMap.get(roleCode)!;
    
    // Track unique requests per role (one role might appear multiple times if multiple devs of same role)
    // For simplicity, we count each assignment
    metrics.count++;
    
    if (assignment.actualDurationHours) {
      metrics.durations.push(assignment.actualDurationHours);
    }
    
    if (assignment.completedAt) {
      if (!metrics.latestCompletedAt || assignment.completedAt > metrics.latestCompletedAt) {
        metrics.latestCompletedAt = assignment.completedAt;
      }
    }
  });

  const developerRoleMetrics = Array.from(roleMetricsMap.values()).map((metrics) => ({
    roleCode: metrics.code,
    roleName: metrics.name,
    count: metrics.count,
    avgCompletionTime: avg(metrics.durations),
    latestCompletedAt: metrics.latestCompletedAt,
  }));

  return {
    quarterCounts,
    typeBreakdown,
    avgCompletionByType,
    avgCompletionByPriority,
    monthlyTrend,
    developerRoleMetrics,
  };
}

export async function getSLAReport(filters: {
  year: number;
  startDate?: Date;
  endDate?: Date;
  requestType?: 'new_application' | 'rfc';
  priorityId?: number;
  slaStatus?: 'met' | 'exceeded';
  page?: number;
  limit?: number;
}) {
  await checkAdminAuth();

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  const conditions = [eq(requests.status, 'completed')];

  if (filters.startDate && filters.endDate) {
    conditions.push(
      gte(requests.completedAt, filters.startDate),
      lte(requests.completedAt, filters.endDate)
    );
  } else {
    conditions.push(sql`YEAR(${requests.completedAt}) = ${filters.year}`);
  }

  if (filters.requestType) {
    conditions.push(eq(requests.requestType, filters.requestType));
  }

  if (filters.priorityId) {
    conditions.push(eq(requests.priorityId, filters.priorityId));
  }

  if (filters.slaStatus === 'met') {
    conditions.push(eq(requests.slaMet, true));
  } else if (filters.slaStatus === 'exceeded') {
    conditions.push(eq(requests.slaMet, false));
  }

  const [totalResult, data] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(and(...conditions)),
    db
      .select({
        id: requests.id,
        requestNo: requests.requestNo,
        requestType: requests.requestType,
        priorityId: requests.priorityId,
        priorityName: priorities.name,
        targetSlaHours: requests.targetSlaHours,
        actualDurationHours: requests.actualDurationHours,
        slaMet: requests.slaMet,
        submittedAt: requests.submittedAt,
        completedAt: requests.completedAt,
      })
      .from(requests)
      .leftJoin(priorities, eq(requests.priorityId, priorities.id))
      .where(and(...conditions))
      .orderBy(sql`${requests.completedAt} DESC`)
      .limit(limit)
      .offset(offset),
  ]);

  const total = totalResult[0]?.count || 0;

  const result = data.map((req) => ({
    ...req,
    achievementRate: calculateAchievementRate(
      req.actualDurationHours || 0,
      req.targetSlaHours
    ),
  }));

  return {
    requests: result,
    total,
    page,
    limit,
  };
}

export async function getSLASummary(filters: {
  year: number;
  startDate?: Date;
  endDate?: Date;
}) {
  await checkAdminAuth();

  const conditions = [eq(requests.status, 'completed')];

  if (filters.startDate && filters.endDate) {
    conditions.push(
      gte(requests.completedAt, filters.startDate),
      lte(requests.completedAt, filters.endDate)
    );
  } else {
    conditions.push(sql`YEAR(${requests.completedAt}) = ${filters.year}`);
  }

  const allCompleted = await db
    .select({
      requestType: requests.requestType,
      priorityId: requests.priorityId,
      completedAt: requests.completedAt,
      actualDurationHours: requests.actualDurationHours,
      slaMet: requests.slaMet,
    })
    .from(requests)
    .where(and(...conditions));

  const totalRequests = allCompleted.length;
  const slaMetCount = allCompleted.filter((r) => r.slaMet === true).length;
  const slaExceededCount = allCompleted.filter((r) => r.slaMet === false).length;
  const achievementRate = totalRequests > 0 ? (slaMetCount / totalRequests) * 100 : 0;

  const typeDurations = { new_application: [] as number[], rfc: [] as number[] };
  const priorityDurations = { low: [] as number[], medium: [] as number[], high: [] as number[], critical: [] as number[] };

  allCompleted.forEach((req) => {
    if (req.actualDurationHours) {
      if (req.requestType === 'new_application') {
        typeDurations.new_application.push(req.actualDurationHours);
      } else if (req.requestType === 'rfc') {
        typeDurations.rfc.push(req.actualDurationHours);
      }

      if (req.priorityId === 1) priorityDurations.low.push(req.actualDurationHours);
      else if (req.priorityId === 2) priorityDurations.medium.push(req.actualDurationHours);
      else if (req.priorityId === 3) priorityDurations.high.push(req.actualDurationHours);
      else if (req.priorityId === 4) priorityDurations.critical.push(req.actualDurationHours);
    }
  });

  const avg = (arr: number[]) => arr.length > 0 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const avgCompletionByType = {
    new_application: avg(typeDurations.new_application),
    rfc: avg(typeDurations.rfc),
  };

  const avgCompletionByPriority = {
    low: avg(priorityDurations.low),
    medium: avg(priorityDurations.medium),
    high: avg(priorityDurations.high),
    critical: avg(priorityDurations.critical),
  };

  // Monthly trend with SLA metrics
  const monthlyData = generateMonthlyTrend(allCompleted, filters.year);
  const monthlyMap = new Map<string, { total: number; met: number; exceeded: number }>();

  allCompleted.forEach((req) => {
    if (!req.completedAt) return;
    const month = req.completedAt.toLocaleDateString('id-ID', { month: 'short' });
    if (!monthlyMap.has(month)) {
      monthlyMap.set(month, { total: 0, met: 0, exceeded: 0 });
    }
    const data = monthlyMap.get(month)!;
    data.total++;
    if (req.slaMet) data.met++;
    else data.exceeded++;
  });

  const monthlyTrend = monthlyData.map((item) => {
    const data = monthlyMap.get(item.month) || { total: 0, met: 0, exceeded: 0 };
    return {
      month: item.month,
      total: data.total,
      met: data.met,
      exceeded: data.exceeded,
      rate: data.total > 0 ? (data.met / data.total) * 100 : 0,
    };
  });

  // Get developer role SLA performance metrics
  const roleSLAAssignments = await db
    .select({
      requestId: requestTeamAssignments.requestId,
      developerRoleCode: developerRoles.code,
      developerRoleName: developerRoles.name,
      actualDurationHours: requests.actualDurationHours,
      slaMet: requests.slaMet,
    })
    .from(requestTeamAssignments)
    .innerJoin(requests, eq(requestTeamAssignments.requestId, requests.id))
    .leftJoin(developerRoles, eq(requestTeamAssignments.developerRoleId, developerRoles.id))
    .where(
      and(
        eq(requests.status, 'completed'),
        ...(filters.startDate && filters.endDate 
          ? [gte(requests.completedAt, filters.startDate), lte(requests.completedAt, filters.endDate)]
          : [sql`YEAR(${requests.completedAt}) = ${filters.year}`]
        ),
        isNull(requestTeamAssignments.unassignedAt)
      )
    );

  // Aggregate by developer role for SLA metrics
  const roleSLAMap = new Map<string, {
    code: string;
    name: string;
    totalRequests: number;
    slaMet: number;
    slaExceeded: number;
    durations: number[];
  }>();

  roleSLAAssignments.forEach((assignment) => {
    const roleCode = assignment.developerRoleCode || 'UNKNOWN';
    const roleName = assignment.developerRoleName || 'Unknown Role';
    
    if (!roleSLAMap.has(roleCode)) {
      roleSLAMap.set(roleCode, {
        code: roleCode,
        name: roleName,
        totalRequests: 0,
        slaMet: 0,
        slaExceeded: 0,
        durations: [],
      });
    }
    
    const metrics = roleSLAMap.get(roleCode)!;
    metrics.totalRequests++;
    
    if (assignment.slaMet === true) {
      metrics.slaMet++;
    } else if (assignment.slaMet === false) {
      metrics.slaExceeded++;
    }
    
    if (assignment.actualDurationHours) {
      metrics.durations.push(assignment.actualDurationHours);
    }
  });

  const developerRoleSLAMetrics = Array.from(roleSLAMap.values()).map((metrics) => ({
    roleCode: metrics.code,
    roleName: metrics.name,
    totalRequests: metrics.totalRequests,
    slaMet: metrics.slaMet,
    slaExceeded: metrics.slaExceeded,
    achievementRate: metrics.totalRequests > 0 ? (metrics.slaMet / metrics.totalRequests) * 100 : 0,
    avgCompletionTime: avg(metrics.durations),
  }));

  return {
    totalRequests,
    slaMetCount,
    slaExceededCount,
    achievementRate,
    avgCompletionByType,
    avgCompletionByPriority,
    monthlyTrend,
    developerRoleSLAMetrics,
  };
}
