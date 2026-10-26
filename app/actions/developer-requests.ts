'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { requests, requestTeamAssignments, requestProgress, requestStatusHistories, users, priorities, units, devteamUnits, developerRoles } from '@/lib/db/schema';
import { eq, and, or, desc, sql, inArray } from 'drizzle-orm';
import { logAudit } from '@/lib/utils/audit';
import { AUDIT_MODULES, AUDIT_ACTIONS, REQUEST_STATUSES, ROLES } from '@/lib/constants';
import { validateTransitionWithContext } from '@/lib/validations/status-transitions';
import { notifyProgressUpdated, notifyRequestCompleted } from '@/lib/notifications/templates';
import { getActiveHolidays, calculateActualDurationBusinessHours, evaluateSla } from '@/lib/utils/sla';

async function checkDeveloperAuth() {
  const session = await auth();
  if (!session?.user) {
    return { authorized: false, error: 'Unauthorized', userId: null };
  }
  if (session.user.roleCode !== 'developer') {
    return { authorized: false, error: 'Forbidden: Developer access required', userId: null };
  }
  return { authorized: true, error: null, userId: session.user.id };
}

async function checkRequestAssignment(requestId: number, developerId: number) {
  const [assignment] = await db
    .select()
    .from(requestTeamAssignments)
    .where(
      and(
        eq(requestTeamAssignments.requestId, requestId),
        eq(requestTeamAssignments.assignedUserId, developerId),
        sql`${requestTeamAssignments.unassignedAt} IS NULL`
      )
    )
    .limit(1);

  if (assignment) return true;

  // Allow access if developer is the team leader or technical writer of the request
  const [request] = await db
    .select({
      teamLeaderId: requests.teamLeaderId,
      technicalWriterId: requests.technicalWriterId,
    })
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);

  if (!request) return false;
  return request.teamLeaderId == developerId || request.technicalWriterId == developerId;
}

export async function getDeveloperDashboardStats() {
  const authCheck = await checkDeveloperAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    // Get developer role information
    const [developerInfo] = await db
      .select({
        developerRoleId: users.developerRoleId,
        developerRoleCode: developerRoles.code,
        developerRoleName: developerRoles.name,
      })
      .from(users)
      .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
      .where(eq(users.id, authCheck.userId!))
      .limit(1);

    const dashboardFilter = or(
      and(eq(requestTeamAssignments.assignedUserId, authCheck.userId!), sql`${requestTeamAssignments.unassignedAt} IS NULL`),
      eq(requests.teamLeaderId, authCheck.userId!),
      eq(requests.technicalWriterId, authCheck.userId!)
    );

    const [stats] = await db
      .select({
        ongoing: sql<number>`SUM(CASE WHEN ${requests.status} = 'ongoing' THEN 1 ELSE 0 END)`,
        onHold: sql<number>`SUM(CASE WHEN ${requests.status} = 'on_hold' THEN 1 ELSE 0 END)`,
        completedThisMonth: sql<number>`SUM(CASE WHEN ${requests.status} = 'done' AND MONTH(${requests.completedAt}) = MONTH(CURRENT_DATE()) AND YEAR(${requests.completedAt}) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END)`,
        total: sql<number>`COUNT(DISTINCT ${requests.id})`,
      })
      .from(requests)
      .leftJoin(
        requestTeamAssignments,
        and(
          eq(requests.id, requestTeamAssignments.requestId),
          eq(requestTeamAssignments.assignedUserId, authCheck.userId!),
          sql`${requestTeamAssignments.unassignedAt} IS NULL`
        )
      )
      .where(dashboardFilter);

    const overdueRequests = await db
      .select({
        id: requests.id,
        requestNo: requests.requestNo,
        title: requests.title,
        status: requests.status,
        submittedAt: requests.submittedAt,
        targetSlaHours: requests.targetSlaHours,
      })
      .from(requests)
      .leftJoin(
        requestTeamAssignments,
        and(
          eq(requests.id, requestTeamAssignments.requestId),
          eq(requestTeamAssignments.assignedUserId, authCheck.userId!),
          sql`${requestTeamAssignments.unassignedAt} IS NULL`
        )
      )
      .where(
        and(
          dashboardFilter,
          inArray(requests.status, ['ongoing']),
          sql`${requests.targetSlaHours} IS NOT NULL`,
          sql`TIMESTAMPDIFF(HOUR, ${requests.submittedAt}, NOW()) > ${requests.targetSlaHours}`
        )
      )
      .orderBy(desc(requests.submittedAt))
      .limit(10);

    return {
      success: true,
      stats: {
        ongoing: Number(stats?.ongoing || 0),
        onHold: Number(stats?.onHold || 0),
        completedThisMonth: Number(stats?.completedThisMonth || 0),
        total: Number(stats?.total || 0),
        overdue: overdueRequests.length,
      },
      developerRole: developerInfo ? {
        code: developerInfo.developerRoleCode,
        name: developerInfo.developerRoleName,
      } : null,
      overdueRequests,
    };
  } catch (error) {
    console.error('Get developer stats error:', error);
    return { success: false, error: 'Gagal mengambil statistik' };
  }
}

export async function getAssignedRequests(params?: {
  status?: string[];
  priorityId?: number[];
  requestType?: string[];
  search?: string;
  page?: number;
  limit?: number;
}) {
  const authCheck = await checkDeveloperAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    // Fetch current developer's own role (used as fallback for team leader/technical writer)
    const [me] = await db
      .select({ developerRoleCode: developerRoles.code, developerRoleName: developerRoles.name })
      .from(users)
      .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
      .where(eq(users.id, authCheck.userId!))
      .limit(1);

    // Filter condition: request is assigned to current user as developer, OR user is team leader, OR user is technical writer
    const assignmentFilter = or(
      and(eq(requestTeamAssignments.assignedUserId, authCheck.userId!), sql`${requestTeamAssignments.unassignedAt} IS NULL`),
      eq(requests.teamLeaderId, authCheck.userId!),
      eq(requests.technicalWriterId, authCheck.userId!)
    );

    const conditions = [assignmentFilter!];

    if (params?.status && params.status.length > 0) {
      conditions.push(inArray(requests.status, params.status as ('submitted' | 'in_review' | 'rejected' | 'approved' | 'ongoing' | 'done' | 'on_hold')[]));
    }

    if (params?.priorityId && params.priorityId.length > 0) {
      conditions.push(inArray(requests.priorityId, params.priorityId));
    }

    if (params?.requestType && params.requestType.length > 0) {
      conditions.push(inArray(requests.requestType, params.requestType as ('new_application' | 'rfc')[]));
    }

    if (params?.search) {
      conditions.push(
        or(
          sql`${requests.requestNo} LIKE ${`%${params.search}%`}`,
          sql`${requests.title} LIKE ${`%${params.search}%`}`
        )!
      );
    }

    const results = await db
      .selectDistinct({
        id: requests.id,
        requestNo: requests.requestNo,
        requestType: requests.requestType,
        title: requests.title,
        status: requests.status,
        priorityId: requests.priorityId,
        priorityName: priorities.name,
        submittedAt: requests.submittedAt,
        targetSlaHours: requests.targetSlaHours,
        requesterName: sql<string>`COALESCE(${users.name}, ${requests.requesterName})`,
        unitName: units.name,
        myRoleCode: sql<string | null>`COALESCE(${developerRoles.code}, ${me?.developerRoleCode ?? null})`,
        myRoleName: sql<string | null>`COALESCE(${developerRoles.name}, ${me?.developerRoleName ?? null})`,
      })
      .from(requests)
      .leftJoin(requestTeamAssignments, and(eq(requests.id, requestTeamAssignments.requestId), eq(requestTeamAssignments.assignedUserId, authCheck.userId!), sql`${requestTeamAssignments.unassignedAt} IS NULL`))
      .leftJoin(priorities, eq(requests.priorityId, priorities.id))
      .leftJoin(users, eq(requests.requesterId, users.id))
      .leftJoin(units, eq(requests.requesterUnitId, units.id))
      .leftJoin(developerRoles, eq(requestTeamAssignments.developerRoleId, developerRoles.id))
      .where(and(...conditions))
      .orderBy(desc(requests.submittedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`COUNT(DISTINCT ${requests.id})` })
      .from(requests)
      .leftJoin(requestTeamAssignments, and(eq(requests.id, requestTeamAssignments.requestId), eq(requestTeamAssignments.assignedUserId, authCheck.userId!), sql`${requestTeamAssignments.unassignedAt} IS NULL`))
      .where(and(...conditions));

    return {
      success: true,
      data: results,
      pagination: {
        page,
        limit,
        total: Number(count),
        totalPages: Math.ceil(Number(count) / limit),
      },
    };
  } catch (error) {
    console.error('Get assigned requests error:', error);
    return { success: false, error: 'Gagal mengambil data request' };
  }
}

export async function getRequestByIdDeveloper(requestId: number) {
  const authCheck = await checkDeveloperAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const isAssigned = await checkRequestAssignment(requestId, authCheck.userId!);
    if (!isAssigned) {
      return { success: false, error: 'Request tidak di-assign ke Anda' };
    }

    const [request] = await db
      .select({
        id: requests.id,
        requestNo: requests.requestNo,
        requestType: requests.requestType,
        title: requests.title,
        description: requests.description,
        businessNeed: requests.businessNeed,
        objective: requests.objective,
        expectedOutput: requests.expectedOutput,
        urgency: requests.urgency,
        status: requests.status,
        priorityId: requests.priorityId,
        priorityName: priorities.name,
        submittedAt: requests.submittedAt,
        approvedAt: requests.approvedAt,
        completedAt: requests.completedAt,
        targetSlaHours: requests.targetSlaHours,
        requesterId: requests.requesterId,
        requesterName: sql<string>`COALESCE(${users.name}, ${requests.requesterName})`,
        requesterEmail: sql<string>`COALESCE(${users.email}, ${requests.requesterEmail})`,
        phoneNumber: requests.requesterPhone,
        unitId: requests.requesterUnitId,
        unitName: units.name,
        rejectionNote: requests.rejectionNote,
        devtiUrusan: devteamUnits.name,
        teamLeaderId: requests.teamLeaderId,
        technicalWriterId: requests.technicalWriterId,
      })
      .from(requests)
      .leftJoin(priorities, eq(requests.priorityId, priorities.id))
      .leftJoin(users, eq(requests.requesterId, users.id))
      .leftJoin(units, eq(requests.requesterUnitId, units.id))
      .leftJoin(devteamUnits, eq(requests.devtiUrusanId, devteamUnits.id))
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    // Get team leader info
    let teamLeader = null;
    if (request.teamLeaderId) {
      const [leader] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, request.teamLeaderId))
        .limit(1);
      teamLeader = leader || null;
    }

    // Get technical writer info
    let technicalWriter = null;
    if (request.technicalWriterId) {
      const [writer] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          developerRoleCode: developerRoles.code,
          developerRoleName: developerRoles.name,
        })
        .from(users)
        .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
        .where(eq(users.id, request.technicalWriterId))
        .limit(1);
      technicalWriter = writer || null;
    }

    // Get all team members (developers)
    const teamMembers = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        developerRoleCode: developerRoles.code,
        developerRoleName: developerRoles.name,
        assignedAt: requestTeamAssignments.assignedAt,
        isCurrentUser: sql<boolean>`${users.id} = ${authCheck.userId!}`,
      })
      .from(requestTeamAssignments)
      .innerJoin(users, eq(requestTeamAssignments.assignedUserId, users.id))
      .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
      .where(
        and(
          eq(requestTeamAssignments.requestId, requestId),
          sql`${requestTeamAssignments.unassignedAt} IS NULL`
        )
      )
      .orderBy(desc(requestTeamAssignments.assignedAt));

    return { 
      success: true, 
      data: {
        ...request,
        teamLeader,
        technicalWriter,
        teamMembers,
      }
    };
  } catch (error) {
    console.error('Get request by id error:', error);
    return { success: false, error: 'Gagal mengambil detail request' };
  }
}

export async function startRequest(params: { requestId: number; note?: string }) {
  const authCheck = await checkDeveloperAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const { requestId, note } = params;

    const isAssigned = await checkRequestAssignment(requestId, authCheck.userId!);
    if (!isAssigned) {
      return { success: false, error: 'Request tidak di-assign ke Anda' };
    }

    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    if (request.status !== 'ongoing') {
      return { success: false, error: 'Hanya request dengan status ONGOING yang dapat dimulai' };
    }

    const session = await auth();
    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: 'ongoing',
      toStatus: 'ongoing',
      changedBy: authCheck.userId!,
      changedByName: session?.user?.name || 'Developer',
      note: note || 'Developer memulai pekerjaan',
    });

    await db.insert(requestProgress).values({
      requestId,
      progressPercent: 0,
      updateNote: note || 'Pekerjaan dimulai',
      updatedBy: authCheck.userId!,
      updatedByName: session?.user?.name || 'Developer',
    });

    logAudit({
      actorUserId: authCheck.userId!,
      actorName: session?.user?.name || 'Developer',
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.START,
      beforeData: { status: request.status },
      afterData: { status: 'ongoing', note },
    });

    return { success: true, message: 'Request berhasil dimulai' };
  } catch (error) {
    console.error('Start request error:', error);
    return { success: false, error: 'Gagal memulai request' };
  }
}

export async function updateProgress(params: { 
  requestId: number; 
  progressPercent: number; 
  note: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { requestId, progressPercent, note } = params;

    if (progressPercent < 0 || progressPercent > 100) {
      return { success: false, error: 'Progress harus antara 0-100%' };
    }

    if (!note || note.trim().length < 10) {
      return { success: false, error: 'Note minimal 10 karakter' };
    }

    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const isAdmin = session.user.roleCode === 'admin';
    const isTeamLead = request.teamLeaderId == session.user.id;

    if (!isAdmin && !isTeamLead) {
      return { success: false, error: 'Hanya admin dan team lead yang dapat update progress' };
    }

    if (request.status !== 'ongoing') {
      return { success: false, error: 'Hanya request ONGOING yang dapat diupdate progressnya' };
    }

    await db.insert(requestProgress).values({
      requestId,
      progressPercent,
      updateNote: note.trim(),
      updatedBy: session.user.id,
      updatedByName: session.user.name || (isAdmin ? 'Admin' : 'Team Lead'),
    });

    logAudit({
      actorUserId: session.user.id,
      actorName: session.user.name || (isAdmin ? 'Admin' : 'Team Lead'),
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.PROGRESS,
      afterData: { progressPercent, note: note.trim() },
    });

    notifyProgressUpdated({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterId: request.requesterId,
      percent: progressPercent,
      note: note.trim(),
    });

    return { success: true, message: 'Progress berhasil diupdate' };
  } catch (error) {
    console.error('Update progress error:', error);
    return { success: false, error: 'Gagal update progress' };
  }
}

export async function completeRequest(params: { requestId: number; finalNote: string }) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const { requestId, finalNote } = params;

    if (!finalNote || finalNote.trim().length < 20) {
      return { success: false, error: 'Final note minimal 20 karakter' };
    }

    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const isAdmin = session.user.roleCode === 'admin';
    const isTeamLead = request.teamLeaderId == session.user.id;

    if (!isAdmin && !isTeamLead) {
      return { success: false, error: 'Hanya admin dan team lead yang dapat menyelesaikan request' };
    }

    const completeValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.DONE,
      isAdmin ? ROLES.ADMIN : ROLES.DEVELOPER
    );
    if (!completeValidation.valid) {
      return { success: false, error: completeValidation.error || 'Transisi status tidak valid' };
    }

    const completedAt = new Date();
    // PHASE 4: Actual duration in business-day hours (excludes weekends/holidays),
    // minus accumulated on-hold (pause) hours. Unified with admin completion logic.
    const submittedAt = request.submittedAt ? new Date(request.submittedAt) : completedAt;
    const holidays = await getActiveHolidays();
    const actualHours = calculateActualDurationBusinessHours(
      submittedAt,
      completedAt,
      request.slaPausedDurationHours || 0,
      holidays
    );
    const slaMet = evaluateSla(actualHours, request.targetSlaHours);

    await db.update(requests)
      .set({ 
        status: 'done',
        completedAt,
        actualDurationHours: actualHours,
        slaMet,
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: 'ongoing',
      toStatus: 'done',
      changedBy: session.user.id,
      changedByName: session.user.name || (isAdmin ? 'Admin' : 'Team Lead'),
      note: finalNote.trim(),
    });

    await db.insert(requestProgress).values({
      requestId,
      progressPercent: 100,
      updateNote: finalNote.trim(),
      updatedBy: session.user.id,
      updatedByName: session.user.name || (isAdmin ? 'Admin' : 'Team Lead'),
    });

    logAudit({
      actorUserId: session.user.id,
      actorName: session.user.name || (isAdmin ? 'Admin' : 'Team Lead'),
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.COMPLETE,
      beforeData: { status: request.status },
      afterData: { status: 'done', finalNote: finalNote.trim() },
    });

    notifyRequestCompleted({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterId: request.requesterId,
    });

    return { success: true, message: 'Request berhasil diselesaikan' };
  } catch (error) {
    console.error('Complete request error:', error);
    return { success: false, error: 'Gagal menyelesaikan request' };
  }
}

export async function getProgressHistory(requestId: number) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: 'Unauthorized' };
  }

  try {
    const isAdmin = session.user.roleCode === 'admin';
    if (!isAdmin) {
      const isAssigned = await checkRequestAssignment(requestId, session.user.id);
      if (!isAssigned) {
        return { success: false, error: 'Request tidak di-assign ke Anda' };
      }
    }

    const progressHistory = await db
      .select({
        id: requestProgress.id,
        progressPercent: requestProgress.progressPercent,
        updateNote: requestProgress.updateNote,
        updatedByName: requestProgress.updatedByName,
        createdAt: requestProgress.createdAt,
      })
      .from(requestProgress)
      .where(eq(requestProgress.requestId, requestId))
      .orderBy(desc(requestProgress.createdAt));

    return { success: true, data: progressHistory };
  } catch (error) {
    console.error('Get progress history error:', error);
    return { success: false, error: 'Gagal mengambil riwayat progress' };
  }
}
