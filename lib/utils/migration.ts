/**
 * Migration Utilities for SIPPA Restructure Phase 7
 * 
 * Provides helper functions for data migration:
 * - Version parsing and comparison
 * - Business days calculation
 * - Data validation and transformation
 */

// ============================================================================
// Version Utilities
// ============================================================================

/**
 * Parse semantic version string into numeric array [major, minor, patch]
 * @param version - Version string in format "x.y.z"
 * @returns Array [major, minor, patch] or null if invalid
 */
export function parseVersion(version: string): [number, number, number] | null {
  if (!version) return null;
  
  const parts = version.trim().split('.');
  if (parts.length !== 3) return null;
  
  const [major, minor, patch] = parts.map(p => parseInt(p, 10));
  
  if (isNaN(major) || isNaN(minor) || isNaN(patch)) return null;
  if (major < 0 || minor < 0 || patch < 0) return null;
  
  return [major, minor, patch];
}

/**
 * Compare two semantic versions
 * @param v1 - First version string
 * @param v2 - Second version string
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal, null if invalid
 */
export function compareVersions(v1: string, v2: string): number | null {
  const parsed1 = parseVersion(v1);
  const parsed2 = parseVersion(v2);
  
  if (!parsed1 || !parsed2) return null;
  
  // Compare major
  if (parsed1[0] > parsed2[0]) return 1;
  if (parsed1[0] < parsed2[0]) return -1;
  
  // Compare minor
  if (parsed1[1] > parsed2[1]) return 1;
  if (parsed1[1] < parsed2[1]) return -1;
  
  // Compare patch
  if (parsed1[2] > parsed2[2]) return 1;
  if (parsed1[2] < parsed2[2]) return -1;
  
  return 0;
}

/**
 * Validate that requested version is greater than current version
 * @param currentVersion - Current version string
 * @param requestedVersion - Requested version string
 * @returns True if requested > current, false otherwise
 */
export function validateVersionProgression(
  currentVersion: string,
  requestedVersion: string
): boolean {
  const comparison = compareVersions(requestedVersion, currentVersion);
  return comparison === 1;
}

/**
 * Suggest next version based on current version
 * @param currentVersion - Current version string
 * @returns Object with suggested patch, minor, and major versions
 */
export function suggestNextVersion(currentVersion: string): {
  patch: string;
  minor: string;
  major: string;
} | null {
  const parsed = parseVersion(currentVersion);
  if (!parsed) return null;
  
  const [major, minor, patch] = parsed;
  
  return {
    patch: `${major}.${minor}.${patch + 1}`,
    minor: `${major}.${minor + 1}.0`,
    major: `${major + 1}.0.0`,
  };
}

// ============================================================================
// Business Days Calculation Utilities
// ============================================================================

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param date - Date to check
 * @returns True if weekend, false otherwise
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday = 0, Saturday = 6
}

/**
 * Check if a date is in the holiday list
 * @param date - Date to check
 * @param holidays - Array of holiday dates (Date objects)
 * @returns True if holiday, false otherwise
 */
export function isHoliday(date: Date, holidays: Date[]): boolean {
  const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD
  return holidays.some(holiday => {
    const holidayStr = holiday.toISOString().split('T')[0];
    return holidayStr === dateStr;
  });
}

/**
 * Check if a date is a working day (not weekend, not holiday)
 * @param date - Date to check
 * @param holidays - Array of holiday dates
 * @returns True if working day, false otherwise
 */
export function isWorkingDay(date: Date, holidays: Date[]): boolean {
  return !isWeekend(date) && !isHoliday(date, holidays);
}

/**
 * Calculate number of business days between two dates
 * @param startDate - Start date
 * @param endDate - End date
 * @param holidays - Array of holiday dates to exclude
 * @returns Number of business days (excluding weekends and holidays)
 */
export function calculateBusinessDays(
  startDate: Date,
  endDate: Date,
  holidays: Date[] = []
): number {
  if (startDate > endDate) {
    return 0;
  }
  
  let businessDays = 0;
  const currentDate = new Date(startDate);
  
  // Iterate through each day
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate, holidays)) {
      businessDays++;
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
}

/**
 * Add business days to a date
 * @param startDate - Starting date
 * @param businessDays - Number of business days to add
 * @param holidays - Array of holiday dates to exclude
 * @returns New date after adding business days
 */
export function addBusinessDays(
  startDate: Date,
  businessDays: number,
  holidays: Date[] = []
): Date {
  if (businessDays <= 0) {
    return new Date(startDate);
  }
  
  let remainingDays = businessDays;
  const currentDate = new Date(startDate);
  
  while (remainingDays > 0) {
    currentDate.setDate(currentDate.getDate() + 1);
    
    if (isWorkingDay(currentDate, holidays)) {
      remainingDays--;
    }
  }
  
  return currentDate;
}

// ============================================================================
// Data Validation Utilities
// ============================================================================

/**
 * Validate email format
 * @param email - Email string to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize string for database insertion
 * @param str - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeString(str: string | null | undefined): string {
  if (!str) return '';
  return str.trim();
}

/**
 * Convert date to MySQL datetime format
 * @param date - Date object
 * @returns String in format "YYYY-MM-DD HH:MM:SS"
 */
export function toMySQLDatetime(date: Date): string {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

/**
 * Parse MySQL date to Date object
 * @param mysqlDate - MySQL date string
 * @returns Date object or null if invalid
 */
export function parseMySQLDate(mysqlDate: string | null): Date | null {
  if (!mysqlDate) return null;
  
  try {
    const date = new Date(mysqlDate);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch {
    return null;
  }
}

// ============================================================================
// Migration Helper Utilities
// ============================================================================

/**
 * Generate unique application name from request title
 * Ensures uniqueness by appending number if needed
 * @param title - Original title
 * @param existingNames - Array of existing application names
 * @returns Unique application name
 */
export function generateUniqueApplicationName(
  title: string,
  existingNames: string[]
): string {
  let baseName = sanitizeString(title);
  let uniqueName = baseName;
  let counter = 1;
  
  while (existingNames.includes(uniqueName)) {
    uniqueName = `${baseName} (${counter})`;
    counter++;
  }
  
  return uniqueName;
}

/**
 * Map old team assignment to individual assignments
 * @param teamId - Old team ID
 * @param teamMembers - Array of team member user IDs
 * @returns Array of individual assignment objects
 */
export interface IndividualAssignment {
  userId: number;
  developerRoleId: number | null;
}

/**
 * Extract application name from request title
 * Removes common prefixes and suffixes
 * @param title - Request title
 * @returns Cleaned application name
 */
export function extractApplicationName(title: string): string {
  let name = sanitizeString(title);
  
  // Remove common prefixes
  const prefixes = ['Aplikasi', 'Sistem', 'Website', 'Web', 'App'];
  for (const prefix of prefixes) {
    const regex = new RegExp(`^${prefix}\\s+`, 'i');
    name = name.replace(regex, '');
  }
  
  // Remove version suffixes if any
  name = name.replace(/\s+v?\d+(\.\d+)*$/i, '');
  
  // Remove trailing punctuation
  name = name.replace(/[.,;:!?]+$/, '');
  
  return name.trim();
}

/**
 * Batch process with progress tracking
 * @param items - Array of items to process
 * @param batchSize - Number of items per batch
 * @param processor - Async function to process each batch
 * @param onProgress - Optional callback for progress updates
 */
export async function processBatch<T>(
  items: T[],
  batchSize: number,
  processor: (batch: T[]) => Promise<void>,
  onProgress?: (processed: number, total: number) => void
): Promise<void> {
  const total = items.length;
  let processed = 0;
  
  for (let i = 0; i < total; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    await processor(batch);
    
    processed += batch.length;
    if (onProgress) {
      onProgress(processed, total);
    }
  }
}

// ============================================================================
// Export all utilities
// ============================================================================

export const migrationUtils = {
  // Version utilities
  parseVersion,
  compareVersions,
  validateVersionProgression,
  suggestNextVersion,
  
  // Business days utilities
  isWeekend,
  isHoliday,
  isWorkingDay,
  calculateBusinessDays,
  addBusinessDays,
  
  // Data validation utilities
  isValidEmail,
  sanitizeString,
  toMySQLDatetime,
  parseMySQLDate,
  
  // Migration helper utilities
  generateUniqueApplicationName,
  extractApplicationName,
  processBatch,
};

export default migrationUtils;
