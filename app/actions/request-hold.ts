'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { requests, requestTeamAssignments, requestStatusHistories, users } from '@/lib/db/schema';
import { REQUEST_STATUSES, ROLES, AUDIT_MODULES, AUDIT_ACTIONS } from '@/lib/constants';
import { validateTransitionWithContext } from '@/lib/validations/status-transitions';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/utils/audit';
import { notifyRequestOnHold, notifyRequestResumed } from '@/lib/notifications/templates';

async function checkPauseAuth(requestId: number) {
  const session = await auth();
  if (!session?.user) {
    return { authorized: false, error: 'Unauthorized', userId: null, isAdmin: false };
  }
  const isAdmin = session.user.roleCode === ROLES.ADMIN;
  // Check if user is assigned developer
  let isAssigned = false;
  if (!isAdmin) {
    const [assignment] = await db
      .select()
      .from(requestTeamAssignments)
      .where(
        and(
          eq(requestTeamAssignments.requestId, requestId),
          eq(requestTeamAssignments.assignedUserId, session.user.id),
          sql`${requestTeamAssignments.unassignedAt} IS NULL`
        )
      )
      .limit(1);
    isAssigned = !!assignment;
    // Also allow team leader / technical writer
    if (!isAssigned) {
      const [req] = await db.select({ teamLeaderId: requests.teamLeaderId, technicalWriterId: requests.technicalWriterId }).from(requests).where(eq(requests.id, requestId)).limit(1);
      if (req && (req.teamLeaderId === session.user.id || req.technicalWriterId === session.user.id)) {
        isAssigned = true;
      }
    }
  }
  if (!isAdmin && !isAssigned) {
    return { authorized: false, error: 'Forbidden', userId: null, isAdmin: false };
  }
  return { authorized: true, error: null, userId: session.user.id, isAdmin };
}

export async function pauseRequest(params: { requestId: number; reason: string }) {
  try {
    const { requestId, reason } = params;
    if (!reason || reason.trim().length < 10) {
      return { success: false, error: 'Alasan penahanan minimal 10 karakter' };
    }

    const authCheck = await checkPauseAuth(requestId);
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }
    const pauseValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.ON_HOLD,
      authCheck.isAdmin ? ROLES.ADMIN : ROLES.DEVELOPER
    );
    if (!pauseValidation.valid) {
      return { success: false, error: pauseValidation.error || 'Transisi status tidak valid' };
    }

    const now = new Date();
    await db.update(requests)
      .set({
        status: REQUEST_STATUSES.ON_HOLD,
        onHoldReason: reason.trim(),
        slaPausedAt: now,
        updatedAt: now,
      })
      .where(eq(requests.id, requestId));

    const session = await auth();
    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.ONGOING,
      toStatus: REQUEST_STATUSES.ON_HOLD,
      changedBy: authCheck.userId!,
      changedByName: session?.user?.name || 'User',
      actorRole: authCheck.isAdmin ? ROLES.ADMIN : ROLES.DEVELOPER,
      note: reason.trim(),
      metadata: JSON.stringify({ reason: reason.trim(), pausedAt: now.toISOString() }),
    });

    logAudit({
      actorUserId: authCheck.userId!,
      actorName: session?.user?.name || 'User',
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.PAUSE,
      beforeData: { status: request.status },
      afterData: { status: REQUEST_STATUSES.ON_HOLD, reason: reason.trim() },
    });

    notifyRequestOnHold({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterId: request.requesterId,
      reason: reason.trim(),
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath('/developer/requests');
    return { success: true, message: 'Request berhasil ditahan' };
  } catch (error) {
    console.error('Pause request error:', error);
    return { success: false, error: 'Gagal menahan request' };
  }
}

export async function resumeRequest(params: { requestId: number; note?: string }) {
  try {
    const { requestId, note } = params;
    const authCheck = await checkPauseAuth(requestId);
    if (!authCheck.authorized) {
      return { success: false, error: authCheck.error };
    }

    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }
    const resumeValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.ONGOING,
      authCheck.isAdmin ? ROLES.ADMIN : ROLES.DEVELOPER
    );
    if (!resumeValidation.valid) {
      return { success: false, error: resumeValidation.error || 'Transisi status tidak valid' };
    }

    // Calculate paused duration
    let pausedDurationHours = request.slaPausedDurationHours || 0;
    if (request.slaPausedAt) {
      const pausedMs = Date.now() - new Date(request.slaPausedAt).getTime();
      pausedDurationHours += Math.round(pausedMs / (1000 * 60 * 60));
    }

    const now = new Date();
    await db.update(requests)
      .set({
        status: REQUEST_STATUSES.ONGOING,
        onHoldReason: null,
        slaPausedAt: null,
        slaPausedDurationHours: pausedDurationHours,
        updatedAt: now,
      })
      .where(eq(requests.id, requestId));

    const session = await auth();
    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.ON_HOLD,
      toStatus: REQUEST_STATUSES.ONGOING,
      changedBy: authCheck.userId!,
      changedByName: session?.user?.name || 'User',
      actorRole: authCheck.isAdmin ? ROLES.ADMIN : ROLES.DEVELOPER,
      note: note || 'Request dilanjutkan kembali',
      metadata: JSON.stringify({ resumedAt: now.toISOString(), pausedDurationHours }),
    });

    logAudit({
      actorUserId: authCheck.userId!,
      actorName: session?.user?.name || 'User',
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.RESUME,
      beforeData: { status: request.status },
      afterData: { status: REQUEST_STATUSES.ONGOING, pausedDurationHours },
    });

    notifyRequestResumed({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterId: request.requesterId,
    });

    revalidatePath('/admin/requests');
    revalidatePath(`/admin/requests/${requestId}`);
    revalidatePath('/developer/requests');
    return { success: true, message: 'Request berhasil dilanjutkan' };
  } catch (error) {
    console.error('Resume request error:', error);
    return { success: false, error: 'Gagal melanjutkan request' };
  }
}
