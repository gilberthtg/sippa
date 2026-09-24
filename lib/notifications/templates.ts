import { NOTIFICATION_EVENTS } from '@/lib/constants';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { sendNotification } from './notify';

async function getAdminUserIds(): Promise<number[]> {
  const admins = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.roleId, 2), eq(users.isActive, true)));
  return admins.map((a) => a.id);
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
  const recipientIds = [...new Set([params.requesterId, ...adminIds])];
  await sendNotification({
    type: NOTIFICATION_EVENTS.REQUEST_COMPLETED,
    recipientUserIds: recipientIds,
    title: `Permintaan Selesai: ${params.requestNo}`,
    message: `Permintaan "${params.title}" telah diselesaikan`,
    entityType: 'request',
    entityId: String(params.requestId),
  });
}
