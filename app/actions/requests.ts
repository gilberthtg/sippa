'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { requests, requestStatusHistories, requestAttachments, requestApplications, requestDocuments, documentTypes } from '@/lib/db/schema';
import { createRequestSchema } from '@/lib/validations/request';
import { generateRequestNumber } from '@/lib/utils/request-number';
import { generateStorageKey } from '@/lib/utils/file-upload';
import { saveFile } from '@/lib/utils/file-storage';
import { validateVersionProgression } from '@/lib/utils/version';
import { REQUEST_STATUSES, FILE_UPLOAD, AUDIT_MODULES, AUDIT_ACTIONS, ROLES } from '@/lib/constants';
import { validateTransitionWithContext } from '@/lib/validations/status-transitions';
import { eq, and, desc, or, like, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { logAudit } from '@/lib/utils/audit';
import { notifyRequestSubmitted } from '@/lib/notifications/templates';

export async function createRequest(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const requestType = formData.get('requestType') as string;
    const applicationIdStr = formData.get('applicationId') as string;
    
    // Build data object based on request type
    const data: any = {
      requestType,
      description: formData.get('description') as string,
      businessNeed: formData.get('businessNeed') as string || undefined,
      objective: formData.get('objective') as string || undefined,
      expectedOutput: formData.get('expectedOutput') as string || undefined,
      urgency: formData.get('urgency') as string || undefined,
      requesterPhone: formData.get('requesterPhone') as string || undefined,
    };

    // Add type-specific fields
    if (requestType === 'new_application') {
      data.title = formData.get('title') as string;
    } else if (requestType === 'rfc') {
      data.applicationId = applicationIdStr ? parseInt(applicationIdStr, 10) : undefined;
      data.requestedVersion = formData.get('requestedVersion') as string;
    }

    const validation = createRequestSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const validatedData = validation.data;

    // For RFC: fetch application details and validate version progression
    let applicationName: string | undefined;
    if (validatedData.requestType === 'rfc' && validatedData.applicationId) {
      const [application] = await db
        .select()
        .from(requestApplications)
        .where(eq(requestApplications.id, validatedData.applicationId))
        .limit(1);

      if (!application) {
        return { success: false, error: 'Aplikasi tidak ditemukan' };
      }

      // Validate version progression
      const versionValidation = validateVersionProgression(
        application.currentVersion,
        validatedData.requestedVersion
      );

      if (!versionValidation.isValid) {
        return { success: false, error: versionValidation.error };
      }

      applicationName = application.applicationName;
    }

    // Determine title based on request type
    const requestTitle = validatedData.requestType === 'new_application'
      ? validatedData.title
      : applicationName || 'RFC';

    const requestNo = await generateRequestNumber();

    // Build insert values based on request type
    const insertValues: any = {
      requestNo,
      requestType: validatedData.requestType,
      title: requestTitle,
      description: validatedData.description,
      businessNeed: validatedData.businessNeed || null,
      objective: validatedData.objective || null,
      expectedOutput: validatedData.expectedOutput || null,
      urgency: validatedData.urgency || null,
      requesterId: session.user.id,
      requesterName: session.user.name,
      requesterEmail: session.user.email,
      requesterUnitId: session.user.unitId || null,
      requesterPhone: validatedData.requesterPhone || null,
      status: REQUEST_STATUSES.SUBMITTED,
      submittedAt: new Date(),
    };

    // Add type-specific fields
    if (validatedData.requestType === 'new_application') {
      // For NEW_APPLICATION: set default version, no applicationId yet (will be created on approval)
      insertValues.requestedVersion = '1.0.0';
      insertValues.applicationId = null;
    } else if (validatedData.requestType === 'rfc') {
      // For RFC: set applicationId and requestedVersion
      insertValues.applicationId = validatedData.applicationId;
      insertValues.requestedVersion = validatedData.requestedVersion;
    }

    const [newRequest] = await db.insert(requests).values(insertValues);

    const requestId = newRequest.insertId;

    await db.insert(requestStatusHistories).values({
      requestId: Number(requestId),
      fromStatus: null,
      toStatus: REQUEST_STATUSES.SUBMITTED,
      changedBy: session.user.id,
      changedByName: session.user.name,
      note: 'Request dibuat',
      });

    // Optional: upload "Permintaan Aplikasi" document type if provided
    const permintaanAplikasiFile = formData.get('permintaanAplikasi') as File | null;
    if (permintaanAplikasiFile && permintaanAplikasiFile.size > 0) {
      if (permintaanAplikasiFile.size > FILE_UPLOAD.MAX_FILE_SIZE) {
        return { success: false, error: `File "${permintaanAplikasiFile.name}" melebihi batas 10MB` };
      }
      if (!FILE_UPLOAD.ALLOWED_TYPES.includes(permintaanAplikasiFile.type as typeof FILE_UPLOAD.ALLOWED_TYPES[number])) {
        return { success: false, error: `Tipe file "${permintaanAplikasiFile.name}" tidak diizinkan` };
      }
      const [dt] = await db
        .select({ id: documentTypes.id })
        .from(documentTypes)
        .where(eq(documentTypes.name, 'Permintaan Aplikasi'))
        .limit(1);
      if (dt) {
        const buffer = Buffer.from(await permintaanAplikasiFile.arrayBuffer());
        const storageKey = generateStorageKey(permintaanAplikasiFile.name);
        await saveFile(buffer, storageKey);
        await db.insert(requestDocuments).values({
          requestId: Number(requestId),
          documentTypeId: dt.id,
          originalName: permintaanAplikasiFile.name,
          storageKey,
          mimeType: permintaanAplikasiFile.type,
          sizeBytes: permintaanAplikasiFile.size,
          uploadedBy: session.user.id,
        });
      }
    }

    logAudit({
      actorUserId: session.user.id,
      actorName: session.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.CREATE,
      afterData: { 
        requestNo, 
        requestType: validatedData.requestType, 
        title: requestTitle,
        ...(validatedData.requestType === 'rfc' && {
          applicationId: validatedData.applicationId,
          requestedVersion: validatedData.requestedVersion,
        }),
      },
    });

    notifyRequestSubmitted({
      requestId: Number(requestId),
      requestNo,
      title: requestTitle,
      requesterName: session.user.name,
    });

    revalidatePath('/requests');
    revalidatePath(`/requests/${requestId}`);
    return { success: true, requestId: Number(requestId), requestNo };
  } catch (error) {
    console.error('Create request error:', error);
    return { success: false, error: 'Terjadi kesalahan saat membuat request' };
  }
}

export async function resubmitRequest(params: { requestId: number; note?: string }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const { requestId, note } = params;
    const [request] = await db.select().from(requests).where(eq(requests.id, requestId)).limit(1);
    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }
    // Only requester can resubmit their own rejected request
    if (request.requesterId !== session.user.id) {
      return { success: false, error: 'Hanya pemohon yang dapat mengajukan ulang' };
    }
    const resubmitValidation = validateTransitionWithContext(
      request.status as 'submitted' | 'in_review' | 'approved' | 'rejected' | 'ongoing' | 'done' | 'on_hold',
      REQUEST_STATUSES.SUBMITTED,
      (session.user.roleCode as 'user' | 'admin' | 'developer') || ROLES.USER
    );
    if (!resubmitValidation.valid) {
      return { success: false, error: resubmitValidation.error || 'Transisi status tidak valid' };
    }

    const now = new Date();
    await db.update(requests)
      .set({
        status: REQUEST_STATUSES.SUBMITTED,
        rejectedAt: null,
        rejectionNote: null,
        submittedAt: now,
        updatedAt: now,
      })
      .where(eq(requests.id, requestId));

    await db.insert(requestStatusHistories).values({
      requestId,
      fromStatus: REQUEST_STATUSES.REJECTED,
      toStatus: REQUEST_STATUSES.SUBMITTED,
      changedBy: session.user.id,
      changedByName: session.user.name,
      actorRole: ROLES.USER,
      note: note || 'Request diajukan ulang setelah perbaikan',
      metadata: JSON.stringify({ resubmittedAt: now.toISOString() }),
    });

    logAudit({
      actorUserId: session.user.id,
      actorName: session.user.name,
      module: AUDIT_MODULES.REQUESTS,
      entityType: 'request',
      entityId: String(requestId),
      action: AUDIT_ACTIONS.RESUBMIT,
      beforeData: { status: request.status },
      afterData: { status: REQUEST_STATUSES.SUBMITTED },
    });

    notifyRequestSubmitted({
      requestId,
      requestNo: request.requestNo,
      title: request.title,
      requesterName: session.user.name,
    });

    revalidatePath('/requests');
    revalidatePath(`/requests/${requestId}`);
    return { success: true, message: 'Request berhasil diajukan ulang' };
  } catch (error) {
    console.error('Resubmit request error:', error);
    return { success: false, error: 'Gagal mengajukan ulang request' };
  }
}

export async function getRequestsByUserId(params?: {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const page = params?.page || 1;
    const limit = params?.limit || 20;
    const offset = (page - 1) * limit;

    let whereConditions = eq(requests.requesterId, session.user.id);

    if (params?.status && params.status !== 'all') {
      whereConditions = and(
        whereConditions,
        eq(requests.status, params.status as 'submitted' | 'in_review' | 'rejected' | 'approved' | 'ongoing' | 'done' | 'on_hold')
      ) as typeof whereConditions;
    }

    if (params?.search) {
      whereConditions = and(
        whereConditions,
        or(
          like(requests.requestNo, `%${params.search}%`),
          like(requests.title, `%${params.search}%`)
        )
      ) as typeof whereConditions;
    }

    const data = await db
      .select()
      .from(requests)
      .where(whereConditions)
      .orderBy(desc(requests.submittedAt))
      .limit(limit)
      .offset(offset);

    // Count with the same filter conditions
    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(whereConditions);

    return {
      success: true,
      data,
      total: Number(countResult.count),
      page,
      limit,
    };
  } catch (error) {
    console.error('Get requests by user error:', error);
    return { success: false, error: 'Terjadi kesalahan saat mengambil data' };
  }
}

export async function getRequestStatusHistories(requestId: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const histories = await db
      .select({
        id: requestStatusHistories.id,
        fromStatus: requestStatusHistories.fromStatus,
        toStatus: requestStatusHistories.toStatus,
        note: requestStatusHistories.note,
        changedBy: requestStatusHistories.changedBy,
        changedByName: requestStatusHistories.changedByName,
        createdAt: requestStatusHistories.createdAt,
      })
      .from(requestStatusHistories)
      .where(eq(requestStatusHistories.requestId, requestId))
      .orderBy(desc(requestStatusHistories.createdAt));

    return { success: true, data: histories };
  } catch (error) {
    console.error('Get request status histories error:', error);
    return { success: false, error: 'Gagal mengambil riwayat status' };
  }
}

export async function getRequestById(id: number) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const [request] = await db
      .select()
      .from(requests)
      .where(eq(requests.id, id))
      .limit(1);

    if (!request) {
      return { success: false, error: 'Request tidak ditemukan' };
    }

    // Convert both to numbers to ensure proper comparison
    const requesterId = Number(request.requesterId);
    const userId = Number(session.user.id);
    
    if (requesterId !== userId) {
      console.log('Access denied:', { requesterId, userId, match: requesterId === userId });
      return { success: false, error: 'Anda tidak memiliki akses ke request ini' };
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

    return {
      success: true,
      data: {
        ...request,
        attachments,
        histories,
      },
    };
  } catch (error) {
    console.error('Get request error:', error);
    return { success: false, error: 'Terjadi kesalahan saat mengambil data' };
  }
}

/**
 * Get list of applications for RFC dropdown
 * Returns all applications created from approved NEW_APPLICATION requests
 */
export async function getApplicationList() {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const applications = await db
      .select({
        id: requestApplications.id,
        applicationName: requestApplications.applicationName,
        description: requestApplications.description,
        currentVersion: requestApplications.currentVersion,
      })
      .from(requestApplications)
      .orderBy(requestApplications.applicationName);

    return { 
      success: true, 
      applications: applications.map(app => ({
        id: app.id,
        name: app.applicationName,
        description: app.description || '',
        currentVersion: app.currentVersion,
        label: `${app.applicationName} (v${app.currentVersion})`,
      }))
    };
  } catch (error) {
    console.error('Get application list error:', error);
    return { success: false, error: 'Terjadi kesalahan saat mengambil daftar aplikasi' };
  }
}
