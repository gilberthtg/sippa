'use server';

import { db } from '@/lib/db';
import { requestDocuments, requests, documentTypes, serviceDocumentTypes, requestTeamAssignments, users } from '@/lib/db/schema';
import { eq, and, isNull, asc } from 'drizzle-orm';
import { auth } from '@/lib/auth/config';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/utils/audit';
import { AUDIT_MODULES, AUDIT_ACTIONS } from '@/lib/constants';
import { saveFile } from '@/lib/utils/file-storage';
import { generateStorageKey } from '@/lib/utils/file-upload';
import { FILE_UPLOAD } from '@/lib/constants';

async function checkAuth() {
  const session = await auth();
  if (!session?.user) throw new Error('Unauthorized');
  return session.user;
}

async function checkAdminOrDeveloper() {
  const user = await checkAuth();
  if (user.roleCode !== 'admin' && user.roleCode !== 'developer') {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function getRequiredDocumentTypes(requestType: 'new_application' | 'rfc') {
  const rows = await db
    .select({
      id: serviceDocumentTypes.id,
      documentTypeId: serviceDocumentTypes.documentTypeId,
      documentTypeName: documentTypes.name,
      isRequired: serviceDocumentTypes.isRequired,
      sortOrder: serviceDocumentTypes.sortOrder,
    })
    .from(serviceDocumentTypes)
    .leftJoin(documentTypes, eq(serviceDocumentTypes.documentTypeId, documentTypes.id))
    .where(eq(serviceDocumentTypes.requestType, requestType))
    .orderBy(asc(serviceDocumentTypes.sortOrder));
  return rows;
}

export async function getRequestDocuments(requestId: number) {
  await checkAuth();

  const rows = await db
    .select({
      id: requestDocuments.id,
      requestId: requestDocuments.requestId,
      documentTypeId: requestDocuments.documentTypeId,
      documentTypeName: documentTypes.name,
      originalName: requestDocuments.originalName,
      storageKey: requestDocuments.storageKey,
      mimeType: requestDocuments.mimeType,
      sizeBytes: requestDocuments.sizeBytes,
      uploadedBy: requestDocuments.uploadedBy,
      uploadedAt: requestDocuments.uploadedAt,
    })
    .from(requestDocuments)
    .leftJoin(documentTypes, eq(requestDocuments.documentTypeId, documentTypes.id))
    .where(eq(requestDocuments.requestId, requestId));

  return rows;
}

export async function uploadRequestDocument(formData: FormData) {
  const user = await checkAdminOrDeveloper();
  const requestId = Number(formData.get('requestId'));
  const documentTypeId = Number(formData.get('documentTypeId'));
  const file = formData.get('file') as File | null;

  if (!requestId || !documentTypeId || !file) {
    return { success: false, error: 'Data tidak lengkap' };
  }

  // Verify access: admin always; developer must be assigned
  if (user.roleCode === 'developer') {
    const [assignment] = await db
      .select({ id: requestTeamAssignments.id })
      .from(requestTeamAssignments)
      .where(
        and(
          eq(requestTeamAssignments.requestId, requestId),
          eq(requestTeamAssignments.assignedUserId, user.id),
          isNull(requestTeamAssignments.unassignedAt)
        )
      )
      .limit(1);
    if (!assignment) {
      return { success: false, error: 'Anda tidak ditugaskan ke request ini' };
    }
  }

  // Validate file
  if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
    return { success: false, error: `File melebihi batas 10MB` };
  }
  if (!(FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return { success: false, error: `Tipe file tidak diizinkan` };
  }

  // Check request exists
  const [request] = await db
    .select({ id: requests.id, requestType: requests.requestType })
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  if (!request) {
    return { success: false, error: 'Request tidak ditemukan' };
  }

  // Upsert: delete existing then insert (1 file per type per request)
  const existing = await db
    .select({ id: requestDocuments.id, storageKey: requestDocuments.storageKey })
    .from(requestDocuments)
    .where(
      and(
        eq(requestDocuments.requestId, requestId),
        eq(requestDocuments.documentTypeId, documentTypeId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    // Remove old file from disk (best effort)
    try {
      const { unlink } = await import('fs/promises');
      const { join } = await import('path');
      await unlink(join(process.cwd(), 'uploads', existing[0].storageKey));
    } catch {
      // ignore
    }
    await db.delete(requestDocuments).where(eq(requestDocuments.id, existing[0].id));
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = generateStorageKey(file.name);
  await saveFile(buffer, storageKey);

  const [result] = await db.insert(requestDocuments).values({
    requestId,
    documentTypeId,
    originalName: file.name,
    storageKey,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedBy: user.id,
  });

  logAudit({
    actorUserId: user.id,
    actorName: user.name,
    module: AUDIT_MODULES.REQUESTS,
    entityType: 'request_document',
    entityId: String(result.insertId),
    action: AUDIT_ACTIONS.CREATE,
    afterData: { requestId, documentTypeId, originalName: file.name },
  });

  revalidatePath(`/admin/requests/${requestId}`);
  revalidatePath(`/developer/requests/${requestId}`);
  revalidatePath(`/requests/${requestId}`);

  return { success: true, id: result.insertId, storageKey };
}

export async function deleteRequestDocument(id: number) {
  const user = await checkAdminOrDeveloper();

  const [doc] = await db
    .select({ id: requestDocuments.id, requestId: requestDocuments.requestId, storageKey: requestDocuments.storageKey, uploadedBy: requestDocuments.uploadedBy })
    .from(requestDocuments)
    .where(eq(requestDocuments.id, id))
    .limit(1);

  if (!doc) {
    return { success: false, error: 'Dokumen tidak ditemukan' };
  }

  // Developer can only delete own uploads
  if (user.roleCode === 'developer' && doc.uploadedBy !== user.id) {
    return { success: false, error: 'Anda tidak bisa menghapus dokumen yang di-upload orang lain' };
  }

  try {
    const { unlink } = await import('fs/promises');
    const { join } = await import('path');
    await unlink(join(process.cwd(), 'uploads', doc.storageKey));
  } catch {
    // ignore
  }

  await db.delete(requestDocuments).where(eq(requestDocuments.id, id));

  logAudit({
    actorUserId: user.id,
    actorName: user.name,
    module: AUDIT_MODULES.REQUESTS,
    entityType: 'request_document',
    entityId: String(id),
    action: AUDIT_ACTIONS.DELETE,
  });

  revalidatePath(`/admin/requests/${doc.requestId}`);
  revalidatePath(`/developer/requests/${doc.requestId}`);
  revalidatePath(`/requests/${doc.requestId}`);

  return { success: true };
}

export async function uploadRequestDocumentForUser(formData: FormData) {
  const user = await checkAuth();
  const requestId = Number(formData.get('requestId'));
  const documentTypeId = Number(formData.get('documentTypeId'));
  const file = formData.get('file') as File | null;

  if (!requestId || !documentTypeId || !file) {
    return { success: false, error: 'Data tidak lengkap' };
  }

  // User can only upload to own requests
  const [request] = await db
    .select({ id: requests.id, requesterId: requests.requesterId })
    .from(requests)
    .where(eq(requests.id, requestId))
    .limit(1);
  if (!request || request.requesterId !== user.id) {
    return { success: false, error: 'Akses ditolak' };
  }

  // Validate file
  if (file.size > FILE_UPLOAD.MAX_FILE_SIZE) {
    return { success: false, error: `File melebihi batas 10MB` };
  }
  if (!(FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(file.type)) {
    return { success: false, error: `Tipe file tidak diizinkan` };
  }

  // Upsert
  const existing = await db
    .select({ id: requestDocuments.id, storageKey: requestDocuments.storageKey })
    .from(requestDocuments)
    .where(
      and(
        eq(requestDocuments.requestId, requestId),
        eq(requestDocuments.documentTypeId, documentTypeId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    try {
      const { unlink } = await import('fs/promises');
      const { join } = await import('path');
      await unlink(join(process.cwd(), 'uploads', existing[0].storageKey));
    } catch {
      // ignore
    }
    await db.delete(requestDocuments).where(eq(requestDocuments.id, existing[0].id));
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storageKey = generateStorageKey(file.name);
  await saveFile(buffer, storageKey);

  const [result] = await db.insert(requestDocuments).values({
    requestId,
    documentTypeId,
    originalName: file.name,
    storageKey,
    mimeType: file.type,
    sizeBytes: file.size,
    uploadedBy: user.id,
  });

  revalidatePath(`/requests/${requestId}`);
  return { success: true, id: result.insertId, storageKey };
}