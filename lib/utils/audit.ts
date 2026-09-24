import { db } from '@/lib/db';
import { auditLogs } from '@/lib/db/schema';
import { headers } from 'next/headers';

const SENSITIVE_FIELDS = new Set([
  'password', 'passwordHash', 'hashedPassword', 'token',
  'secret', 'accessToken', 'refreshToken', 'sessionToken',
]);

function sanitizeAuditData(data: Record<string, unknown> | null | undefined): string | null {
  if (!data) return null;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_FIELDS.has(key)) {
      cleaned[key] = '[REDACTED]';
    } else {
      cleaned[key] = value;
    }
  }
  return JSON.stringify(cleaned);
}

export async function getRequestContext() {
  try {
    const h = await headers();
    const forwarded = h.get('x-forwarded-for');
    const realIp = h.get('x-real-ip');
    const ipAddress = forwarded?.split(',')[0]?.trim() || realIp || null;
    const userAgent = h.get('user-agent') || null;
    return { ipAddress, userAgent };
  } catch {
    return { ipAddress: null, userAgent: null };
  }
}

export async function logAudit(params: {
  actorUserId: number | null;
  actorName: string;
  module: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeData?: Record<string, unknown> | null;
  afterData?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}): Promise<void> {
  try {
    const ctx = params.ipAddress !== undefined
      ? { ipAddress: params.ipAddress || null, userAgent: params.userAgent || null }
      : await getRequestContext();

    await db.insert(auditLogs).values({
      actorUserId: params.actorUserId,
      actorName: params.actorName,
      module: params.module,
      entityType: params.entityType,
      entityId: params.entityId,
      action: params.action,
      beforeData: sanitizeAuditData(params.beforeData),
      afterData: sanitizeAuditData(params.afterData),
      ipAddress: ctx.ipAddress,
      userAgent: ctx.userAgent,
    });
  } catch (error) {
    console.error('Audit log error:', error);
  }
}
