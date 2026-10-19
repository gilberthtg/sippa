'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { requests, requestTeamAssignments, requestProgress, requestStatusHistories, users, priorities, units, developerRoles } from '@/lib/db/schema';
import { eq, and, or, desc, sql, inArray, aliasedTable } from 'drizzle-orm';
import { logAudit } from '@/lib/utils/audit';
import { AUDIT_MODULES, AUDIT_ACTIONS } from '@/lib/constants';
import { notifyProgressUpdated, notifyRequestCompleted } from '@/lib/notifications/templates';

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
  
  return !!assignment;
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

    const [stats] = await db
      .select({
        assigned: sql<number>`SUM(CASE WHEN ${requests.status} = 'assigned' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN ${requests.status} = 'in_progress' THEN 1 ELSE 0 END)`,
        completedThisMonth: sql<number>`SUM(CASE WHEN ${requests.status} = 'completed' AND MONTH(${requests.completedAt}) = MONTH(CURRENT_DATE()) AND YEAR(${requests.completedAt}) = YEAR(CURRENT_DATE()) THEN 1 ELSE 0 END)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(requests)
      .innerJoin(
        requestTeamAssignments,
        and(
          eq(requests.id, requestTeamAssignments.requestId),
          eq(requestTeamAssignments.assignedUserId, authCheck.userId!),
          sql`${requestTeamAssignments.unassignedAt} IS NULL`
        )
      );

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
      .innerJoin(
        requestTeamAssignments,
        and(
          eq(requests.id, requestTeamAssignments.requestId),
          eq(requestTeamAssignments.assignedUserId, authCheck.userId!),
          sql`${requestTeamAssignments.unassignedAt} IS NULL`
        )
      )
      .where(
        and(
          inArray(requests.status, ['assigned', 'in_progress']),
          sql`${requests.targetSlaHours} IS NOT NULL`,
          sql`TIMESTAMPDIFF(HOUR, ${requests.submittedAt}, NOW()) > ${requests.targetSlaHours}`
        )
      )
      .orderBy(desc(requests.submittedAt))
      .limit(10);

    return {
      success: true,
      stats: {
        assigned: Number(stats?.assigned || 0),
        inProgress: Number(stats?.inProgress || 0),
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

    const conditions = [
      eq(requestTeamAssignments.assignedUserId, authCheck.userId!),
      sql`${requestTeamAssignments.unassignedAt} IS NULL`,
    ];

    if (params?.status && params.status.length > 0) {
      conditions.push(inArray(requests.status, params.status as ('submitted' | 'verification' | 'rejected' | 'approved' | 'assigned' | 'in_progress' | 'completed')[]));
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
      .select({
        id: requests.id,
        requestNo: requests.requestNo,
        requestType: requests.requestType,
        title: requests.title,
        status: requests.status,
        priorityId: requests.priorityId,
        priorityName: priorities.name,
        submittedAt: requests.submittedAt,
        targetSlaHours: requests.targetSlaHours,
        requesterName: users.name,
        unitName: units.name,
        myRoleCode: developerRoles.code,
        myRoleName: developerRoles.name,
      })
      .from(requests)
      .innerJoin(requestTeamAssignments, eq(requests.id, requestTeamAssignments.requestId))
      .leftJoin(priorities, eq(requests.priorityId, priorities.id))
      .leftJoin(users, eq(requests.requesterId, users.id))
      .leftJoin(units, eq(requests.requesterUnitId, units.id))
      .leftJoin(developerRoles, eq(requestTeamAssignments.developerRoleId, developerRoles.id))
      .where(and(...conditions))
      .orderBy(desc(requests.submittedAt))
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .innerJoin(requestTeamAssignments, eq(requests.id, requestTeamAssignments.requestId))
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

    const devtiUnit = aliasedTable(units, 'devti_unit');

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
        requesterName: users.name,
        requesterEmail: users.email,
        phoneNumber: requests.requesterPhone,
        unitId: requests.requesterUnitId,
        unitName: units.name,
        rejectionNote: requests.rejectionNote,
        devtiUrusan: devtiUnit.name,
        teamLeaderId: requests.teamLeaderId,
        technicalWriterId: requests.technicalWriterId,
      })
      .from(requests)
      .leftJoin(priorities, eq(requests.priorityId, priorities.id))
      .leftJoin(users, eq(requests.requesterId, users.id))
      .leftJoin(units, eq(requests.requesterUnitId, units.id))
      .leftJoin(devtiUnit, eq(requests.devtiUrusanId, devtiUnit.id))
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

    if (request.status !== 'assigned') {
      return { success: false, error: 'Hanya request dengan status ASSIGNED yang dapat dimulai' };
    }

    await db.update(requests)
      .set({ status: 'in_progress' })
      .where(eq(requests.id, requestId));

    const session = await auth();
    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: 'assigned',
      toStatus: 'in_progress',
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
      afterData: { status: 'in_progress', note },
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
  const authCheck = await checkDeveloperAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const { requestId, progressPercent, note } = params;

    if (progressPercent < 0 || progressPercent > 100) {
      return { success: false, error: 'Progress harus antara 0-100%' };
    }

    if (!note || note.trim().length < 10) {
      return { success: false, error: 'Note minimal 10 karakter' };
    }

    const isAssigned = await checkRequestAssignment(requestId, authCheck.userId!);
    if (!isAssigned) {
      return { success: false, error: 'Request tidak di-assign ke Anda' };
    }

    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    if (request.status !== 'in_progress') {
      return { success: false, error: 'Hanya request IN_PROGRESS yang dapat diupdate progressnya' };
    }

    const session = await auth();
    await db.insert(requestProgress).values({
      requestId,
      progressPercent,
      updateNote: note.trim(),
      updatedBy: authCheck.userId!,
      updatedByName: session?.user?.name || 'Developer',
    });

    logAudit({
      actorUserId: authCheck.userId!,
      actorName: session?.user?.name || 'Developer',
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
    return { success: false, error: 'Gagal mengupdate progress' };
  }
}

export async function completeRequest(params: { requestId: number; finalNote: string }) {
  const authCheck = await checkDeveloperAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const { requestId, finalNote } = params;

    if (!finalNote || finalNote.trim().length < 20) {
      return { success: false, error: 'Final note minimal 20 karakter' };
    }

    const isAssigned = await checkRequestAssignment(requestId, authCheck.userId!);
    if (!isAssigned) {
      return { success: false, error: 'Request tidak di-assign ke Anda' };
    }

    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    if (request.status !== 'in_progress') {
      return { success: false, error: 'Hanya request IN_PROGRESS yang dapat diselesaikan' };
    }

    await db.update(requests)
      .set({ 
        status: 'completed',
        completedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    const session = await auth();
    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: 'in_progress',
      toStatus: 'completed',
      changedBy: authCheck.userId!,
      changedByName: session?.user?.name || 'Developer',
      note: finalNote.trim(),
    });

    await db.insert(requestProgress).values({
      requestId,
      progressPercent: 100,
      updateNote: finalNote.trim(),
      updatedBy: authCheck.userId!,
      updatedByName: session?.user?.name || 'Developer',
    });

    logAudit({
      actorUserId: authCheck.userId!,
      actorName: session?.user?.name || 'Developer',
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.COMPLETE,
      beforeData: { status: request.status },
      afterData: { status: 'completed', finalNote: finalNote.trim() },
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
  const authCheck = await checkDeveloperAuth();
  if (!authCheck.authorized) {
    return { success: false, error: authCheck.error };
  }

  try {
    const isAssigned = await checkRequestAssignment(requestId, authCheck.userId!);
    if (!isAssigned) {
      return { success: false, error: 'Request tidak di-assign ke Anda' };
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
