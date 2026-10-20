/**
 * SLA Business-Day Utilities (Phase 4 - SLA & Notifications)
 *
 * SIPPA menghitung SLA dalam satuan "jam hari kerja":
 * 1 hari kerja (Senin-Jumat, mengesampingkan hari libur dari tabel
 * sla_holidays) dihitung sebagai 24 jam. Unit ini konsisten dengan
 * targetSlaHours = targetBusinessDays * 24 yang dipakai saat set priority
 * (lihat setPriority di app/actions/admin-requests.ts).
 *
 * Pauses: setiap request yang ditahan (ON_HOLD) memiliki slaPausedAt.
 * Saat dilanjutkan (ON_HOLD → ONGOING), durasi tahanan dihitung dalam
 * jam hari kerja dan diakumulasi ke slaPausedDurationHours.
 * Perhitungan final: actual = business hours (submitted → completed) − paused hours.
 */

import { db } from '@/lib/db';
import { slaHolidays } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { calculateBusinessDays } from '@/lib/utils/migration';

export const BUSINESS_HOURS_PER_DAY = 24;

/**
 * Get all active holidays from sla_holidays table.
 * Fail-open: returns empty array if query fails (SLA still calculated,
 * only without holiday exclusion).
 */
export async function getActiveHolidays(): Promise<Date[]> {
  try {
    const rows = await db
      .select({ holidayDate: slaHolidays.holidayDate })
      .from(slaHolidays)
      .where(eq(slaHolidays.isActive, true));
    return rows.map((row) => new Date(row.holidayDate));
  } catch (error) {
    console.error('Get active holidays error:', error);
    return [];
  }
}

/**
 * Business-day hours between two dates (inclusive boundaries, per calendar day).
 * Both dates are normalized to local midnight so counting is independent
 * of time-of-day (e.g. Fri 17:00 → Mon 09:00 spans Fri and Mon business days).
 */
export function calculateBusinessHoursBetween(
  startDate: Date,
  endDate: Date,
  holidays: Date[] = []
): number {
  const startDay = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const endDay = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  const businessDays = calculateBusinessDays(startDay, endDay, holidays);
  return businessDays * BUSINESS_HOURS_PER_DAY;
}

/**
 * Business-day hours consumed by a single pause window (slaPausedAt → resumedAt).
 * Returns 0 if pausedAt is missing or after resumedAt.
 */
export function calculatePauseBusinessHours(
  pausedAt: Date,
  resumedAt: Date,
  holidays: Date[] = []
): number {
  if (pausedAt >= resumedAt) return 0;
  return calculateBusinessHoursBetween(pausedAt, resumedAt, holidays);
}

/**
 * Final SLA actual duration in business-day hours:
 * (business hours submittedAt → completedAt) − (accumulated paused hours).
 * Multiple pause cycles are accumulated in slaPausedDurationHours; each
 * pause cycle is logged in request_status_histories with its reason.
 */
export function calculateActualDurationBusinessHours(
  submittedAt: Date,
  completedAt: Date,
  pausedHoursTotal = 0,
  holidays: Date[] = []
): number {
  const gross = Math.max(0, calculateBusinessHoursBetween(submittedAt, completedAt, holidays));
  const accumulatedPause = Math.max(0, Math.round(pausedHoursTotal));
  return Math.max(0, gross - accumulatedPause);
}

/**
 * SLA met: actual <= target.
 * Returns null when no target is defined (promises null = unknown, not met).
 */
export function evaluateSla(
  actualHours: number,
  targetSlaHours: number | null | undefined
): boolean | null {
  if (targetSlaHours == null) return null;
  return actualHours <= targetSlaHours;
}
