import { NOTIFICATION_EVENTS } from '@/lib/constants';
import { db } from '@/lib/db';
import { users, requests, requestTeamAssignments } from '@/lib/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { sendNotification } from './notify';

async function getAdminUserIds(): Promise<number[]> {
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.roleId, 2), eq(users.isActive, true)));
  return admins.map((a) => a.id);
}

/**
 * Get user IDs of everyone involved in handling a request:
 * active team assignment members (developers) + team leader + technical writer.
 * Used for on-hold / resume / completed notifications.
 */
async function getTeamMemberIds(requestId: number): Promise<number[]> {
  try {
    const [request] = await db
      .select({
        teamLeaderId: requests.teamLeaderId,
        technicalWriterId: requests.technicalWriterId,
      })
      .from(requests)
      .where(eq(requests.id, requestId))
      .limit(1);

    const assignments = await db
      .select({ assignedUserId: requestTeamAssignments.assignedUserId })
      .from(requestTeamAssignments)
      .where(
        and(
          eq(requestTeamAssignments.requestId, requestId),
          isNull(requestTeamAssignments.unassignedAt)
        )
      );

    const ids = new Set<number>(assignments.map((a) => a.assignedUserId));
    if (request?.teamLeaderId) ids.add(request.teamLeaderId);
    if (request?.technicalWriterId) ids.add(request.technicalWriterId);
    return [...ids];
  } catch (error) {
    console.error('Get team member ids error:', error);
    return [];
  }
}

export async function notifyRequestSubmitted(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterName: string;
}) {
  const adminIds = await getAdminUserIds();
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_SUBMITTED,
    recipientUserIds: adminIds,
    title: `Permintaan Baru: ${params.requestNo}`,
    message: `${params.requesterName} mengajukan permintaan "${params.title}"`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyRequestInReview(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterId: number;
}) {
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_IN_REVIEW,
    recipientUserIds: [params.requesterId],
    title: `Permintaan Sedang Ditinjau: ${params.requestNo}`,
    message: `Permintaan "${params.title}" sedang ditinjau oleh admin`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyRequestApproved(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterId: number;
}) {
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_APPROVED,
    recipientUserIds: [params.requesterId],
    title: `Permintaan Disetujui: ${params.requestNo}`,
    message: `Permintaan "${params.title}" telah disetujui`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyRequestRejected(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterId: number;
  reason: string;
}) {
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_REJECTED,
    recipientUserIds: [params.requesterId],
    title: `Permintaan Ditolak: ${params.requestNo}`,
    message: `Permintaan "${params.title}" ditolak. Alasan: ${params.reason}`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyDeveloperAssigned(params: {
  requestId: number;
  requestNo: string;
  title: string;
  developerId: number;
}) {
  await sendNotification({
    type: NOTIFICATION_EVENTS.DEVELOPER_ASSIGNED,
    recipientUserIds: [params.developerId],
    title: `Tugas Baru: ${params.requestNo}`,
    message: `Anda ditugaskan untuk permintaan "${params.title}"`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyProgressUpdated(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterId: number;
  percent: number;
  note: string;
}) {
  await sendNotification({
    type: NOTIFICATION_EVENTS.PROGRESS_UPDATED,
    recipientUserIds: [params.requesterId],
    title: `Update Progress: ${params.requestNo}`,
    message: `Progress ${params.percent}%: ${params.note}`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyRequestCompleted(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterId: number;
}) {
  const adminIds = await getAdminUserIds();
  const teamIds = await getTeamMemberIds(params.requestId);
  const recipientIds = [...new Set([params.requesterId, ...teamIds, ...adminIds])];
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_COMPLETED,
    recipientUserIds: recipientIds,
    title: `Permintaan Selesai: ${params.requestNo}`,
    message: `Permintaan "${params.title}" telah diselesaikan`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

/**
 * PHASE 3: Notify team members (team leader, technical writer, requester)
 */
export async function notifyRequestOnHold(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterId: number;
  reason: string;
}) {
  const adminIds = await getAdminUserIds();
  const teamIds = await getTeamMemberIds(params.requestId);
  const recipientIds = [...new Set([params.requesterId, ...teamIds, ...adminIds])];
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_ON_HOLD,
    recipientUserIds: recipientIds,
    title: `Permintaan Ditahan: ${params.requestNo}`,
    message: `Permintaan "${params.title}" ditahan. Alasan: ${params.reason}`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyRequestResumed(params: {
  requestId: number;
  requestNo: string;
  title: string;
  requesterId: number;
}) {
  const adminIds = await getAdminUserIds();
  const teamIds = await getTeamMemberIds(params.requestId);
  const recipientIds = [...new Set([params.requesterId, ...teamIds, ...adminIds])];
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_RESUMED,
    recipientUserIds: recipientIds,
    title: `Permintaan Dilanjutkan: ${params.requestNo}`,
    message: `Permintaan "${params.title}" dilanjutkan kembali`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}

export async function notifyTeamAssigned(params: {
  requestId: number;
  requestNo: string;
  title: string;
  teamLeaderId: number;
  technicalWriterId: number;
  requesterId: number;
}) {
  // Notify team leader
  await sendNotification({
    type: NOTIFICATION_EVENTS.DEVELOPER_ASSIGNED,
    recipientUserIds: [params.teamLeaderId],
    title: `Anda Ditunjuk Sebagai Ketua Tim: ${params.requestNo}`,
    message: `Anda ditunjuk sebagai Ketua Tim untuk permintaan "${params.title}"`,
    entityType: 'request',
    entityId: String(params.requestId),
  });

  // Notify technical writer
  await sendNotification({
    type: NOTIFICATION_EVENTS.DEVELOPER_ASSIGNED,
    recipientUserIds: [params.technicalWriterId],
    title: `Anda Ditunjuk Sebagai Technical Writer: ${params.requestNo}`,
    message: `Anda ditunjuk sebagai Technical Writer untuk permintaan "${params.title}"`,
    entityType: 'request',
    entityId: String(params.requestId),
  });

  // Notify requester
  await sendNotification({
    type: NOTIFICATION_EVENTS.DEVELOPER_ASSIGNED,
    recipientUserIds: [params.requesterId],
    title: `Tim Telah Ditugaskan: ${params.requestNo}`,
    message: `Tim telah ditugaskan untuk menangani permintaan "${params.title}"`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}
