'use server';

import { auth } from '@/lib/auth/config';
import { db } from '@/lib/db';
import { requests, requestStatusHistories, requestAttachments } from '@/lib/db/schema';
import { createRequestSchema } from '@/lib/validations/request';
import { generateRequestNumber } from '@/lib/utils/request-number';
import { generateStorageKey } from '@/lib/utils/file-upload';
import { saveFile } from '@/lib/utils/file-storage';
import { REQUEST_STATUSES } from '@/lib/constants';
import { eq, and, desc, or, like, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

export async function createRequest(formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) {
      return { success: false, error: 'Unauthorized' };
    }

    const data = {
      requestType: formData.get('requestType') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      businessNeed: formData.get('businessNeed') as string || undefined,
      objective: formData.get('objective') as string || undefined,
      expectedOutput: formData.get('expectedOutput') as string || undefined,
      urgency: formData.get('urgency') as string || undefined,
      requesterPhone: formData.get('requesterPhone') as string || undefined,
    };

    const validation = createRequestSchema.safeParse(data);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0].message };
    }

    const requestNo = await generateRequestNumber();

    const [newRequest] = await db.insert(requests).values({
      requestNo,
      requestType: validation.data.requestType,
      title: validation.data.title,
      description: validation.data.description,
      businessNeed: validation.data.businessNeed || null,
      objective: validation.data.objective || null,
      expectedOutput: validation.data.expectedOutput || null,
      urgency: validation.data.urgency || null,
      requesterId: session.user.id,
      requesterName: session.user.name,
      requesterEmail: session.user.email,
      requesterUnitId: session.user.unitId || null,
      requesterPhone: validation.data.requesterPhone || null,
      status: REQUEST_STATUSES.SUBMITTED,
      submittedAt: new Date(),
    });

    const requestId = newRequest.insertId;

    await db.insert(requestStatusHistories).values({
      requestId: Number(requestId),
      fromStatus: null,
      toStatus: REQUEST_STATUSES.SUBMITTED,
      changedBy: session.user.id,
      changedByName: session.user.name,
      note: 'Request dibuat',
    });

    const files = formData.getAll('files') as File[];
    if (files.length > 0) {
      for (const file of files) {
        if (file.size > 0) {
          const buffer = Buffer.from(await file.arrayBuffer());
          const storageKey = generateStorageKey(file.name);
          
          await saveFile(buffer, storageKey);

          await db.insert(requestAttachments).values({
            requestId: Number(requestId),
            originalName: file.name,
            storageKey,
            mimeType: file.type,
            sizeBytes: file.size,
            uploadedBy: session.user.id,
          });
        }
      }
    }

    revalidatePath('/requests');
    return { success: true, requestId: Number(requestId), requestNo };
  } catch (error) {
    console.error('Create request error:', error);
    return { success: false, error: 'Terjadi kesalahan saat membuat request' };
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
        eq(requests.status, params.status as 'submitted' | 'verification' | 'rejected' | 'approved' | 'assigned' | 'in_progress' | 'completed')
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

    const [countResult] = await db
      .select({ count: sql<number>`count(*)` })
      .from(requests)
      .where(eq(requests.requesterId, session.user.id));

    return {
      success: true,
      data,
      total: Number(countResult.count),
      page,
      limit,
    };
  } catch (error) {
    console.error('Get requests error:', error);
    return { success: false, error: 'Terjadi kesalahan saat mengambil data' };
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

    if (request.requesterId !== session.user.id) {
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
