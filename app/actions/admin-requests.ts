'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { 
  requests, 
  requestStatusHistories, 
  requestAttachments,
  requestTeamAssignments,
  users,
  priorities,
  units,
  slaPolicies
} from '@/lib/db/schema';
import { REQUEST_STATUSES, ROLES, AUDIT_MODULES, AUDIT_ACTIONS } from '@/lib/constants';
import { validateTransitionWithContext } from '@/lib/validations/status-transitions';
import { eq, and, desc, or, like, sql, gte, lte, inArray, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/utils/audit';
import { notifyRequestApproved, notifyRequestRejected, notifyDeveloperAssigned, notifyRequestCompleted } from '@/lib/notifications/templates';

async function checkAdminAuth() {
  const session = await auth();
  if (!session?.user) {
    return { authorized: false, error: 'Unauthorized' };
  }
  if (session.user.roleCode !== ROLES.ADMIN) {
    return { authorized: false, error: 'Admin access required' };
  }
  return { authorized: true, session };
}

export async function getAllRequests(params?: {
  status?: string[];
  priority?: number[];
  requestType?: string[];
  unitId?: number;
  developerId?: number;
  teamId?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    const conditions = [];

    if (params?.status && params.status.length > 0) {
      conditions.push(inArray(requests.status, params.status as ('submitted' | 'in_review' | 'rejected' | 'approved' | 'ongoing' | 'done' | 'on_hold')[]));
    }

    if (params?.priority && params.priority.length > 0) {
      conditions.push(inArray(requests.priorityId, params.priority));
    }

    if (params?.requestType && params.requestType.length > 0) {
      conditions.push(inArray(requests.requestType, params.requestType as ('new_application' | 'rfc')[]));
    }

    if (params?.unitId) {
      conditions.push(eq(requests.requesterUnitId, params.unitId));
    }

    if (params?.dateFrom) {
      conditions.push(gte(requests.submittedAt, new Date(params.dateFrom)));
    }

    if (params?.dateTo) {
      conditions.push(lte(requests.submittedAt, new Date(params.dateTo)));
    }

    if (params?.search) {
      conditions.push(
        or(
          like(requests.requestNo, `%${params.search}%`),
          like(requests.title, `%${params.search}%`),
          like(requests.requesterName, `%${params.search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Determine sort column and direction
    const sortBy = params?.sortBy || 'submittedAt';
    const sortOrder = params?.sortOrder || 'desc';
    
    let orderByClause;
    switch (sortBy) {
      case 'requestNo':
        orderByClause = sortOrder === 'asc' ? requests.requestNo : desc(requests.requestNo);
        break;
      case 'title':
        orderByClause = sortOrder === 'asc' ? requests.title : desc(requests.title);
        break;
      case 'status':
        orderByClause = sortOrder === 'asc' ? requests.status : desc(requests.status);
        break;
      case 'submittedAt':
      default:
        orderByClause = sortOrder === 'asc' ? requests.submittedAt : desc(requests.submittedAt);
        break;
    }

    const data = await db
      .select()
      .from(requests)
      .where(whereClause)
      .orderBy(orderByClause)
      .limit(limit)
      .offset(offset);

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(whereClause);

    return {
      success: true,
      data,
      total: Number(countResult.count),
      page,
      limit,
    };
  } catch (error) {
    console.error('Get all requests error:', error);
    return { success: false, error: 'Gagal mengambil data request' };
  }
}

export async function getAdminDashboardStats() {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [stats] = await db
      .select({
        submitted: sql<number>`SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END)`,
        inReview: sql<number>`SUM(CASE WHEN status = 'in_review' THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
        ongoing: sql<number>`SUM(CASE WHEN status = 'ongoing' THEN 1 ELSE 0 END)`,
        onHold: sql<number>`SUM(CASE WHEN status = 'on_hold' THEN 1 ELSE 0 END)`,
        done: sql<number>`SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END)`,
        rejected: sql<number>`SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(requests);

    // PHASE 3: Additional metrics
    // Approved but not assigned (approved status with no assignments)
    const [approvedNotAssignedResult] = await db
      .select({
        count: sql<number>`COUNT(DISTINCT ${requests.id})`,
      })
      .from(requests)
      .where(
        and(
          eq(requests.status, REQUEST_STATUSES.APPROVED),
          isNull(requests.assignedAt)
        )
      );

    return {
      success: true,
      data: {
        ...stats,
        approvedNotAssigned: Number(stats.approved || 0),
      },
    };
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    return { success: false, error: 'Gagal mengambil statistik' };
  }
}

export async function getRecentActivity(limit = 10) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const activities = await db
      .select({
        id: requestStatusHistories.id,
        requestId: requestStatusHistories.requestId,
        requestNo: requests.requestNo,
        requestTitle: requests.title,
        fromStatus: requestStatusHistories.fromStatus,
        toStatus: requestStatusHistories.toStatus,
        changedBy: requestStatusHistories.changedBy,
        changedByName: requestStatusHistories.changedByName,
        note: requestStatusHistories.note,
        createdAt: requestStatusHistories.createdAt,
      })
      .from(requestStatusHistories)
      .leftJoin(requests, eq(requestStatusHistories.requestId, requests.id))
      .orderBy(desc(requestStatusHistories.createdAt))
      .limit(limit);

    return {
      success: true,
      data: activities,
    };
  } catch (error) {
    console.error('Get recent activity error:', error);
    return { success: false, error: 'Gagal mengambil aktivitas terbaru' };
  }
}

export async function getSLAAttentionRequests() {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const activeRequests = await db
      .select()
      .from(requests)
      .where(
        and(
          inArray(requests.status, ['in_review', 'approved', 'ongoing']),
          sql`${requests.targetSlaHours} IS NOT NULL`
        )
      )
      .orderBy(desc(requests.submittedAt));

    const now = new Date();
    const attentionRequests = activeRequests.filter(req => {
      if (!req.targetSlaHours || !req.submittedAt) return false;
      
      const elapsedHours = (now.getTime() - req.submittedAt.getTime()) / (1000 * 60 * 60);
      const percentUsed = (elapsedHours / req.targetSlaHours) * 100;
      
      return percentUsed >= 80;
    });

    return {
      success: true,
      data: attentionRequests,
    };
  } catch (error) {
    console.error('Get SLA attention requests error:', error);
    return { success: false, error: 'Gagal mengambil request SLA' };
  }
}

export async function getRequestByIdAdmin(id: number) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, id))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const attachments = await db
      .select()
      .from(requestAttachments)
      .where(eq(requestAttachments.requestId, id))
      .orderBy(requestAttachments.uploadedAt);

    const histories = await db
      .select()
      .from(requestStatusHistories)
      .where(eq(requestStatusHistories.requestId, id))
      .orderBy(requestStatusHistories.createdAt);

    // PHASE 3: Fetch new assignment structure
    const { developerRoles } = await import('@/lib/db/schema');
    
    const assignments = await db
      .select({
        id: requestTeamAssignments.id,
        assignedUserId: requestTeamAssignments.assignedUserId,
        assignedUserName: users.name,
        assignedUserEmail: users.email,
        developerRoleId: requestTeamAssignments.developerRoleId,
        developerRoleCode: developerRoles.code,
        developerRoleName: developerRoles.name,
        assignedBy: requestTeamAssignments.assignedBy,
        assignedAt: requestTeamAssignments.assignedAt,
        unassignedAt: requestTeamAssignments.unassignedAt,
        notes: requestTeamAssignments.notes,
      })
      .from(requestTeamAssignments)
      .leftJoin(users, eq(requestTeamAssignments.assignedUserId, users.id))
      .leftJoin(developerRoles, eq(requestTeamAssignments.developerRoleId, developerRoles.id))
      .where(
        and(
          eq(requestTeamAssignments.requestId, id),
          isNull(requestTeamAssignments.unassignedAt)
        )
      )
      .orderBy(developerRoles.sortOrder);

    // Fetch team leader info if assigned
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

    // Fetch technical writer info if assigned
    let technicalWriter = null;
    if (request.technicalWriterId) {
      const [writer] = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          developerRoleCode: developerRoles.code,
        })
        .from(users)
        .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
        .where(eq(users.id, request.technicalWriterId))
        .limit(1);
      technicalWriter = writer || null;
    }

    // Fetch DevTI unit name if assigned
    let devtiUrusan = null;
    if (request.devtiUrusanId) {
      const [unit] = await db
        .select({ name: units.name })
        .from(units)
        .where(eq(units.id, request.devtiUrusanId))
        .limit(1);
      devtiUrusan = unit?.name || null;
    }

    return {
      success: true,
      data: {
        ...request,
        devtiUrusan,
        attachments,
        histories,
        assignments,
        teamLeader,
        technicalWriter,
      },
    };
  } catch (error) {
    console.error('Get request error:', error);
    return { success: false, error: 'Gagal mengambil data request' };
  }
}

export async function verifyRequest(requestId: number, note?: string) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const transitionValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.IN_REVIEW,
      ROLES.ADMIN
    );
    if (!transitionValidation.valid) {
      return { success: false, error: transitionValidation.error || 'Transisi status tidak valid' };
    }

    await db
      .update(requests)
      .set({ 
        status: REQUEST_STATUSES.IN_REVIEW,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.SUBMITTED,
      toStatus: REQUEST_STATUSES.IN_REVIEW,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: note || 'Request diverifikasi oleh admin',
    });

    logAudit({
      actorUserId: authCheck.session!.user.id,
      actorName: authCheck.session!.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.VERIFY,
      beforeData: { status: request.status },
      afterData: { status: REQUEST_STATUSES.IN_REVIEW, note },
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Verify request error:', error);
    return { success: false, error: 'Gagal memverifikasi request' };
  }
}

export async function approveRequest(requestId: number, note?: string) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const approveTransitionValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.APPROVED,
      ROLES.ADMIN
    );
    if (!approveTransitionValidation.valid) {
      return { success: false, error: approveTransitionValidation.error || 'Transisi status tidak valid' };
    }

    // PHASE 3: Auto-create application master for NEW_APPLICATION
    let applicationId = request.applicationId;
    
    if (request.requestType === 'new_application' && !applicationId) {
      const { requestApplications } = await import('@/lib/db/schema');
      
      // Check if application already exists with this name
      const [existingApp] = await db
        .select()
        .from(requestApplications)
        .where(eq(requestApplications.applicationName, request.title))
        .limit(1);

      if (existingApp) {
        return { 
          success: false, 
          error: `Aplikasi "${request.title}" sudah terdaftar. Gunakan RFC untuk perubahan.` 
        };
      }

      // Create application master entry
      const [newApp] = await db
        .insert(requestApplications)
        .values({
          applicationName: request.title,
          description: request.description,
          currentVersion: '1.0.0',
          createdBy: request.requesterId,
        })
        .$returningId();

      applicationId = newApp.id;

      // Update request with application ID
      await db
        .update(requests)
        .set({ applicationId })
        .where(eq(requests.id, requestId));

      logAudit({
        actorUserId: authCheck.session!.user.id,
        actorName: authCheck.session!.user.name,
        module: AUDIT_MODULES.REQUESTS,
        entityType: 'application',
        entityId: String(applicationId),
        action: 'CREATE',
        beforeData: null,
        afterData: {
          applicationName: request.title,
          version: '1.0.0',
          requestId,
        },
      });
    }

    await db
      .update(requests)
      .set({ 
        status: REQUEST_STATUSES.APPROVED,
        approvedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.IN_REVIEW,
      toStatus: REQUEST_STATUSES.APPROVED,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: note || 'Request disetujui',
    });

    logAudit({
      actorUserId: authCheck.session!.user.id,
      actorName: authCheck.session!.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.APPROVE,
      beforeData: { status: request.status },
      afterData: { 
        status: REQUEST_STATUSES.APPROVED, 
        note,
        applicationId: applicationId || null,
      },
    });

    notifyRequestApproved({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterId: request.requesterId,
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath('/admin/settings/applications'); // Refresh applications list
    return { success: true };
  } catch (error) {
    console.error('Approve request error:', error);
    return { success: false, error: 'Gagal menyetujui request' };
  }
}

export async function rejectRequest(requestId: number, reason: string) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: 'Alasan penolakan wajib diisi' };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const rejectTransitionValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.REJECTED,
      ROLES.ADMIN
    );
    if (!rejectTransitionValidation.valid) {
      return { success: false, error: rejectTransitionValidation.error || 'Transisi status tidak valid' };
    }

    await db
      .update(requests)
      .set({ 
        status: REQUEST_STATUSES.REJECTED,
        rejectedAt: new Date(),
        rejectionNote: reason,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.IN_REVIEW,
      toStatus: REQUEST_STATUSES.REJECTED,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: `Request ditolak: ${reason}`,
    });

    logAudit({
      actorUserId: authCheck.session!.user.id,
      actorName: authCheck.session!.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.REJECT,
      beforeData: { status: request.status },
      afterData: { status: REQUEST_STATUSES.REJECTED, reason },
    });

    notifyRequestRejected({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterId: request.requesterId,
      reason,
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Reject request error:', error);
    return { success: false, error: 'Gagal menolak request' };
  }
}

export async function completeRequest(requestId: number, note?: string) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const completeTransitionValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.DONE,
      ROLES.ADMIN
    );
    if (!completeTransitionValidation.valid) {
      return { success: false, error: completeTransitionValidation.error || 'Transisi status tidak valid' };
    }

    const now = new Date();
    await db
      .update(requests)
      .set({
        status: REQUEST_STATUSES.DONE,
        completedAt: now,
        updatedAt: now,
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: request.status,
      toStatus: REQUEST_STATUSES.DONE,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: note || 'Request diselesaikan oleh admin',
    });

    logAudit({
      actorUserId: authCheck.session!.user.id,
      actorName: authCheck.session!.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.COMPLETE,
      beforeData: { status: request.status },
      afterData: { status: REQUEST_STATUSES.DONE, note },
    });

    notifyRequestCompleted({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterId: request.requesterId,
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath('/developer/requests');
    return { success: true, message: 'Request berhasil diselesaikan' };
  } catch (error) {
    console.error('Complete request error:', error);
    return { success: false, error: 'Gagal menyelesaikan request' };
  }
}

export async function setPriority(requestId: number, priorityId: number) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    if (request.status !== REQUEST_STATUSES.APPROVED && request.status !== REQUEST_STATUSES.ONGOING) {
      return { success: false, error: 'Priority hanya dapat diset untuk request APPROVED atau ONGOING' };
    }

    const [priority] = await db
      .select()
      .from(priorities)
      .where(eq(priorities.id, priorityId))
      .limit(1);

    if (!priority) {
      return { success: false, error: 'Priority tidak ditemukan' };
    }

    const [slaPolicy] = await db
      .select()
      .from(slaPolicies)
      .where(
        and(
          eq(slaPolicies.requestType, request.requestType),
          eq(slaPolicies.priorityId, priorityId),
          eq(slaPolicies.isActive, true)
        )
      )
      .limit(1);

    const targetSlaHours = slaPolicy?.targetBusinessDays ? slaPolicy.targetBusinessDays * 24 : null;

    await db
      .update(requests)
      .set({ 
        priorityId,
        targetSlaHours,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: request.status,
      toStatus: request.status,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: `Priority diubah menjadi ${priority.name}`,
    });

    logAudit({
      actorUserId: authCheck.session!.user.id,
      actorName: authCheck.session!.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.SET_PRIORITY,
      beforeData: { priorityId: request.priorityId, targetSlaHours: request.targetSlaHours },
      afterData: { priorityId, targetSlaHours, priorityName: priority.name },
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Set priority error:', error);
    return { success: false, error: 'Gagal mengatur priority' };
  }
}

export async function assignRequest(params: {
  requestId: number;
  teamId?: number;
  developerId?: number;
  note?: string;
}) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const { requestId, teamId, developerId, note } = params;

    if (!teamId && !developerId) {
      return { success: false, error: 'Team atau developer harus dipilih' };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const legacyAssignValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.ONGOING,
      ROLES.ADMIN
    );
    if (!legacyAssignValidation.valid) {
      return { success: false, error: legacyAssignValidation.error || 'Transisi status tidak valid' };
    }

    // TODO: Update to new assignment structure in Phase 2
    // Temporarily disabled - new structure uses requestTeamAssignments with developer roles
    /*
    await db
      .update(requestTeamAssignments)
      .set({ unassignedAt: new Date() })
      .where(
        and(
          eq(requestTeamAssignments.requestId, requestId),
          isNull(requestTeamAssignments.unassignedAt)
        )
      );

    await db.insert(requestTeamAssignments).values({
      requestId,
      assignedUserId: developerId,
      developerRoleId: roleId, // New field required
      assignedBy: authCheck.session!.user.id,
      assignedAt: new Date(),
    });
    */

    await db
      .update(requests)
      .set({ 
        status: REQUEST_STATUSES.ONGOING,
        assignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    // Assignment note
    let assignmentNote = 'Request di-assign';
    
    if (developerId) {
      const [developer] = await db.select().from(users).where(eq(users.id, developerId)).limit(1);
      assignmentNote = `Request di-assign ke ${developer?.name || 'Developer'}`;
    }

    if (note) {
      assignmentNote += ` - ${note}`;
    }

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.APPROVED,
      toStatus: REQUEST_STATUSES.ONGOING,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: assignmentNote,
    });

    logAudit({
      actorUserId: authCheck.session!.user.id,
      actorName: authCheck.session!.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.ASSIGN,
      beforeData: { status: request.status },
      afterData: { status: REQUEST_STATUSES.ONGOING, teamId, developerId, note },
    });

    if (developerId) {
      notifyDeveloperAssigned({
        requestId,
        requestNo: request.requestNo,
        title: request.title,
        developerId,
      });
    }

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Assign request error:', error);
    return { success: false, error: 'Gagal meng-assign request' };
  }
}

export async function getPriorities() {
  try {
    const data = await db
      .select()
      .from(priorities)
      .where(eq(priorities.isActive, true))
      .orderBy(priorities.sortOrder);

    return { success: true, data };
  } catch (error) {
    console.error('Get priorities error:', error);
    return { success: false, error: 'Gagal mengambil data priority' };
  }
}

export async function getDevelopers() {
  try {
    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        unitId: users.unitId,
      })
      .from(users)
      .where(
        and(
          eq(users.roleId, 3),
          eq(users.isActive, true)
        )
      )
      .orderBy(users.name);

    return { success: true, data };
  } catch (error) {
    console.error('Get developers error:', error);
    return { success: false, error: 'Gagal mengambil data developer' };
  }
}

export async function getUnits() {
  try {
    const data = await db
      .select()
      .from(units)
      .where(eq(units.isActive, true))
      .orderBy(units.name);

    return { success: true, data };
  } catch (error) {
    console.error('Get units error:', error);
    return { success: false, error: 'Gagal mengambil data unit' };
  }
}

// ============================================================
// PHASE 3: NEW ASSIGNMENT WORKFLOW ACTIONS
// ============================================================

/**
 * Get all developer roles (SA, TW, BE, FE, QA, DM)
 */
export async function getDeveloperRoles() {
  try {
    const { developerRoles } = await import('@/lib/db/schema');
    
    const data = await db
      .select()
      .from(developerRoles)
      .where(eq(developerRoles.isActive, true))
      .orderBy(developerRoles.sortOrder);

    return { success: true, data };
  } catch (error) {
    console.error('Get developer roles error:', error);
    return { success: false, error: 'Gagal mengambil data developer role' };
  }
}

/**
 * Get developers filtered by specific role code
 * @param roleCode - Developer role code (SA, TW, BE, FE, QA, DM)
 */
export async function getDevelopersByRole(roleCode?: string) {
  try {
    const { developerRoles } = await import('@/lib/db/schema');
    
    const query = db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        unitId: users.unitId,
        developerRoleId: users.developerRoleId,
        developerRoleCode: developerRoles.code,
        developerRoleName: developerRoles.name,
      })
      .from(users)
      .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
      .where(
        and(
          eq(users.roleId, 3), // DEVELOPER role
          eq(users.isActive, true)
        )
      )
      .orderBy(users.name);

    let data = await query;

    // Filter by role code if provided
    if (roleCode) {
      data = data.filter(dev => dev.developerRoleCode === roleCode);
    }

    return { success: true, data };
  } catch (error) {
    console.error('Get developers by role error:', error);
    return { success: false, error: 'Gagal mengambil data developer' };
  }
}

/**
 * Get all users (any role) for team leader selection
 */
export async function getTeamLeaderOptions() {
  try {
    const data = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        roleId: users.roleId,
        unitId: users.unitId,
      })
      .from(users)
      .where(eq(users.isActive, true))
      .orderBy(users.name);

    return { success: true, data };
  } catch (error) {
    console.error('Get team leader options error:', error);
    return { success: false, error: 'Gagal mengambil data user' };
  }
}

/**
 * Get technical writers (developers with TW role)
 */
export async function getTechnicalWriters() {
  try {
    return await getDevelopersByRole('TW');
  } catch (error) {
    console.error('Get technical writers error:', error);
    return { success: false, error: 'Gagal mengambil data technical writer' };
  }
}

/**
 * Get developer workload (active assignments count per developer)
 */
export async function getDeveloperWorkload() {
  try {
    const { developerRoles } = await import('@/lib/db/schema');
    
    const workloadData = await db
      .select({
        developerId: users.id,
        developerName: users.name,
        developerEmail: users.email,
        developerRoleId: users.developerRoleId,
        developerRoleCode: developerRoles.code,
        developerRoleName: developerRoles.name,
        activeAssignments: sql<number>`COUNT(DISTINCT ${requestTeamAssignments.requestId})`,
      })
      .from(users)
      .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
      .leftJoin(
        requestTeamAssignments,
        and(
          eq(requestTeamAssignments.assignedUserId, users.id),
          isNull(requestTeamAssignments.unassignedAt)
        )
      )
      .where(
        and(
          eq(users.roleId, 3), // DEVELOPER
          eq(users.isActive, true)
        )
      )
      .groupBy(users.id, users.name, users.email, users.developerRoleId, developerRoles.code, developerRoles.name)
      .orderBy(users.name);

    return { success: true, data: workloadData };
  } catch (error) {
    console.error('Get developer workload error:', error);
    return { success: false, error: 'Gagal mengambil data workload developer' };
  }
}

/**
 * Assign team to request (new flow)
 * @param requestId - Request ID
 * @param devtiUrusanId - DevTI urusan/unit id (FK to units)
 * @param teamLeaderId - Team leader user ID (any role)
 * @param technicalWriterId - Technical writer ID (must have TW role)
 * @param developerAssignments - Array of { userId, developerRoleId }
 */
export async function assignTeamToRequest(params: {
  requestId: number;
  devtiUrusanId: number;
  teamLeaderId: number;
  technicalWriterId: number;
  developerAssignments: Array<{ userId: number; developerRoleId: number }>;
  note?: string;
}) {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const { requestId, devtiUrusanId, teamLeaderId, technicalWriterId, developerAssignments, note } = params;

    // Validation
    if (!devtiUrusanId) {
      return { success: false, error: 'DevTI Urusan wajib dipilih' };
    }

    // Verify unit exists
    const { units } = await import('@/lib/db/schema');
    const [unit] = await db
      .select({ id: units.id, name: units.name })
      .from(units)
      .where(eq(units.id, devtiUrusanId))
      .limit(1);

    if (!unit) {
      return { success: false, error: 'Unit tidak ditemukan' };
    }

    if (!teamLeaderId) {
      return { success: false, error: 'Ketua Tim wajib dipilih' };
    }

    if (!technicalWriterId) {
      return { success: false, error: 'Technical Writer wajib dipilih' };
    }

    if (!developerAssignments || developerAssignments.length === 0) {
      return { success: false, error: 'Minimal 1 developer harus di-assign' };
    }

    // Get request
    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    const assignTransitionValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.ONGOING,
      ROLES.ADMIN
    );
    if (!assignTransitionValidation.valid) {
      return { success: false, error: assignTransitionValidation.error || 'Transisi status tidak valid' };
    }

    // Verify technical writer has TW role
    const { developerRoles } = await import('@/lib/db/schema');
    const [techWriter] = await db
      .select({
        id: users.id,
        name: users.name,
        developerRoleCode: developerRoles.code,
      })
      .from(users)
      .leftJoin(developerRoles, eq(users.developerRoleId, developerRoles.id))
      .where(eq(users.id, technicalWriterId))
      .limit(1);

    if (!techWriter) {
      return { success: false, error: 'Technical Writer tidak ditemukan' };
    }

    if (techWriter.developerRoleCode !== 'TW') {
      return { success: false, error: 'User yang dipilih bukan Technical Writer' };
    }

    // Verify team leader exists
    const [teamLeader] = await db
      .select()
      .from(users)
      .where(eq(users.id, teamLeaderId))
      .limit(1);

    if (!teamLeader) {
      return { success: false, error: 'Ketua Tim tidak ditemukan' };
    }

    // Unassign previous assignments (if any)
    await db
      .update(requestTeamAssignments)
      .set({ unassignedAt: new Date() })
      .where(
        and(
          eq(requestTeamAssignments.requestId, requestId),
          isNull(requestTeamAssignments.unassignedAt)
        )
      );

    // Build full assignment list: developers + team leader (if developer) + technical writer (if not already)
    const assignedUserIds = new Set(developerAssignments.map(a => a.userId));
    const extraAssignments: Array<{ userId: number; developerRoleId: number }> = [];

    // Team leader: if a developer, add to assignments with their own role
    const [tlUser] = await db
      .select({ id: users.id, roleId: users.roleId, developerRoleId: users.developerRoleId })
      .from(users)
      .where(eq(users.id, teamLeaderId))
      .limit(1);
    if (tlUser && tlUser.roleId === 3 && tlUser.developerRoleId && !assignedUserIds.has(tlUser.id)) {
      extraAssignments.push({ userId: tlUser.id, developerRoleId: tlUser.developerRoleId });
      assignedUserIds.add(tlUser.id);
    }

    // Technical writer: add to assignments with TW role (if not already assigned)
    if (!assignedUserIds.has(technicalWriterId)) {
      const [twUser] = await db
        .select({ developerRoleId: users.developerRoleId })
        .from(users)
        .where(eq(users.id, technicalWriterId))
        .limit(1);
      if (twUser?.developerRoleId) {
        extraAssignments.push({ userId: technicalWriterId, developerRoleId: twUser.developerRoleId });
        assignedUserIds.add(technicalWriterId);
      }
    }

    const allAssignments = [...developerAssignments, ...extraAssignments];

    // Create new assignments
    const assignmentRecords = allAssignments.map(assignment => ({
      requestId,
      assignedUserId: assignment.userId,
      developerRoleId: assignment.developerRoleId,
      assignedBy: authCheck.session!.user.id,
      assignedAt: new Date(),
    }));

    await db.insert(requestTeamAssignments).values(assignmentRecords);

    // Update request with assignment details
    await db
      .update(requests)
      .set({
        status: REQUEST_STATUSES.ONGOING,
        devtiUrusanId,
        teamLeaderId,
        technicalWriterId,
        assignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    // Create status history
    const developerNames = await Promise.all(
      developerAssignments.map(async (assignment) => {
        const [dev] = await db
          .select({ name: users.name })
          .from(users)
          .where(eq(users.id, assignment.userId))
          .limit(1);
        return dev?.name || 'Unknown';
      })
    );

    const assignmentNote = `Request di-assign ke tim:\n` +
      `- Ketua Tim: ${teamLeader.name}\n` +
      `- Technical Writer: ${techWriter.name}\n` +
      `- Developers: ${developerNames.join(', ')}\n` +
      `- DevTI Urusan: ${unit.name}` +
      (note ? `\n- Catatan: ${note}` : '');

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.APPROVED,
      toStatus: REQUEST_STATUSES.ONGOING,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      actorRole: ROLES.ADMIN,
      note: assignmentNote,
    });

    // Audit log
    logAudit({
      actorUserId: authCheck.session!.user.id,
      actorName: authCheck.session!.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.ASSIGN,
      beforeData: { status: request.status },
      afterData: {
        status: REQUEST_STATUSES.ONGOING,
        devtiUrusanId,
        unitName: unit.name,
        teamLeaderId,
        technicalWriterId,
        developerAssignments: developerAssignments.length,
        note,
      },
    });

    // Send notifications to all assigned people
    const { notifyTeamAssigned } = await import('@/lib/notifications/templates');
    
    // Notify all developers
    for (const assignment of developerAssignments) {
      notifyDeveloperAssigned({
        requestId,
        requestNo: request.requestNo,
        title: request.title,
        developerId: assignment.userId,
      });
    }

    // Notify team leader and technical writer
    await notifyTeamAssigned({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      teamLeaderId,
      technicalWriterId,
      requesterId: request.requesterId,
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Assign team to request error:', error);
    return { success: false, error: 'Gagal meng-assign tim ke request' };
  }
}


/**
 * PHASE 3: Get developer role distribution for active requests
 */
export async function getDeveloperRoleDistribution() {
  try {
    const authCheck = await checkAdminAuth();
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const { developerRoles } = await import('@/lib/db/schema');

    // Get active requests by developer role
    const distribution = await db
      .select({
        roleId: developerRoles.id,
        roleCode: developerRoles.code,
        roleName: developerRoles.name,
        activeRequests: sql<number>`COUNT(DISTINCT ${requestTeamAssignments.requestId})`,
      })
      .from(developerRoles)
      .leftJoin(
        requestTeamAssignments,
        and(
          eq(requestTeamAssignments.developerRoleId, developerRoles.id),
          isNull(requestTeamAssignments.unassignedAt)
        )
      )
      .leftJoin(
        requests,
        and(
          eq(requests.id, requestTeamAssignments.requestId),
          inArray(requests.status, ['ongoing'])
        )
      )
      .where(eq(developerRoles.isActive, true))
      .groupBy(developerRoles.id, developerRoles.code, developerRoles.name)
      .orderBy(developerRoles.sortOrder);

    return {
      success: true,
      data: distribution,
    };
  } catch (error) {
    console.error('Get developer role distribution error:', error);
    return { success: false, error: 'Gagal mengambil distribusi role developer' };
  }
}
