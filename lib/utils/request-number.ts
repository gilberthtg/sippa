import { db } from '@/lib/db';
import { requests } from '@/lib/db/schema';
import { sql } from 'drizzle-orm';

/**
 * Generate unique request number
 * Format: REQ-YYYYMMDD-XXX
 * Example: REQ-20260923-001
 */
export async function generateRequestNumber(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;
  const requestPrefix = `REQ-${datePrefix}`;

  // Get the last request number for today
  const lastRequest = await db
    .select({ requestNo: requests.requestNo })
    .from(requests)
    .where(sql`${requests.requestNo} LIKE ${`${requestPrefix}-%`}`)
    .orderBy(sql`${requests.requestNo} DESC`)
    .limit(1);

  let sequence = 1;
  if (lastRequest.length > 0) {
    const lastNo = lastRequest[0].requestNo;
    const lastSequence = lastNo.split('-')[2];
    sequence = parseInt(lastSequence, 10) + 1;
  }

  const sequenceStr = String(sequence).padStart(3, '0');
  return `${requestPrefix}-${sequenceStr}`;
}
