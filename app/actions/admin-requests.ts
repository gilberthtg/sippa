'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { 
  requests, 
  requestStatusHistories, 
  requestAttachments,
  requestAssignments,
  users,
  teams,
  priorities,
  units,
  slaPolicies
} from '@/lib/db/schema';
import { REQUEST_STATUSES, ROLES } from '@/lib/constants';
import { eq, and, desc, or, like, sql, gte, lte, inArray, isNull } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

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
      conditions.push(inArray(requests.status, params.status as ('submitted' | 'verification' | 'rejected' | 'approved' | 'assigned' | 'in_progress' | 'completed')[]));
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

    const data = await db
      .select()
      .from(requests)
      .where(whereClause)
      .orderBy(desc(requests.submittedAt))
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
        verification: sql<number>`SUM(CASE WHEN status = 'verification' THEN 1 ELSE 0 END)`,
        approved: sql<number>`SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END)`,
        assigned: sql<number>`SUM(CASE WHEN status = 'assigned' THEN 1 ELSE 0 END)`,
        inProgress: sql<number>`SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END)`,
        completed: sql<number>`SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END)`,
        rejected: sql<number>`SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END)`,
        total: sql<number>`COUNT(*)`,
      })
      .from(requests);

    return {
      success: true,
      data: stats,
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
          inArray(requests.status, ['verification', 'approved', 'assigned', 'in_progress']),
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

    const [assignment] = await db
      .select({
        id: requestAssignments.id,
        teamId: requestAssignments.teamId,
        teamName: teams.name,
        developerId: requestAssignments.developerId,
        developerName: users.name,
        assignedBy: requestAssignments.assignedBy,
        assignedAt: requestAssignments.assignedAt,
      })
      .from(requestAssignments)
      .leftJoin(teams, eq(requestAssignments.teamId, teams.id))
      .leftJoin(users, eq(requestAssignments.developerId, users.id))
      .where(
        and(
          eq(requestAssignments.requestId, id),
          isNull(requestAssignments.unassignedAt)
        )
      )
      .limit(1);

    return {
      success: true,
      data: {
        ...request,
        attachments,
        histories,
        assignment: assignment || null,
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

    if (request.status !== REQUEST_STATUSES.SUBMITTED) {
      return { success: false, error: 'Request harus berstatus SUBMITTED' };
    }

    await db
      .update(requests)
      .set({ 
        status: REQUEST_STATUSES.VERIFICATION,
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.SUBMITTED,
      toStatus: REQUEST_STATUSES.VERIFICATION,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: note || 'Request diverifikasi oleh admin',
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

    if (request.status !== REQUEST_STATUSES.VERIFICATION) {
      return { success: false, error: 'Request harus berstatus VERIFICATION' };
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
      fromStatus: REQUEST_STATUSES.VERIFICATION,
      toStatus: REQUEST_STATUSES.APPROVED,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: note || 'Request disetujui',
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
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

    if (request.status !== REQUEST_STATUSES.VERIFICATION) {
      return { success: false, error: 'Request harus berstatus VERIFICATION' };
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
      fromStatus: REQUEST_STATUSES.VERIFICATION,
      toStatus: REQUEST_STATUSES.REJECTED,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: `Request ditolak: ${reason}`,
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    return { success: true };
  } catch (error) {
    console.error('Reject request error:', error);
    return { success: false, error: 'Gagal menolak request' };
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

    if (request.status !== REQUEST_STATUSES.APPROVED && request.status !== REQUEST_STATUSES.ASSIGNED) {
      return { success: false, error: 'Priority hanya dapat diset untuk request APPROVED atau ASSIGNED' };
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

    const targetSlaHours = slaPolicy?.targetHours || null;

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

    if (request.status !== REQUEST_STATUSES.APPROVED) {
      return { success: false, error: 'Request harus berstatus APPROVED' };
    }

    await db
      .update(requestAssignments)
      .set({ unassignedAt: new Date() })
      .where(
        and(
          eq(requestAssignments.requestId, requestId),
          isNull(requestAssignments.unassignedAt)
        )
      );

    await db.insert(requestAssignments).values({
      requestId,
      teamId: teamId || null,
      developerId: developerId || null,
      assignedBy: authCheck.session!.user.id,
      assignedAt: new Date(),
    });

    await db
      .update(requests)
      .set({ 
        status: REQUEST_STATUSES.ASSIGNED,
        assignedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(requests.id, requestId));

    let assignmentNote = 'Request di-assign';
    if (teamId && developerId) {
      const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
      const [developer] = await db.select().from(users).where(eq(users.id, developerId)).limit(1);
      assignmentNote = `Request di-assign ke ${team?.name || 'Team'} - ${developer?.name || 'Developer'}`;
    } else if (teamId) {
      const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
      assignmentNote = `Request di-assign ke ${team?.name || 'Team'}`;
    } else if (developerId) {
      const [developer] = await db.select().from(users).where(eq(users.id, developerId)).limit(1);
      assignmentNote = `Request di-assign ke ${developer?.name || 'Developer'}`;
    }

    if (note) {
      assignmentNote += ` - ${note}`;
    }

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.APPROVED,
      toStatus: REQUEST_STATUSES.ASSIGNED,
      changedBy: authCheck.session!.user.id,
      changedByName: authCheck.session!.user.name,
      note: assignmentNote,
    });

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

export async function getTeams() {
  try {
    const data = await db
      .select()
      .from(teams)
      .where(eq(teams.isActive, true))
      .orderBy(teams.name);

    return { success: true, data };
  } catch (error) {
    console.error('Get teams error:', error);
    return { success: false, error: 'Gagal mengambil data team' };
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
