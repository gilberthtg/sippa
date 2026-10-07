/**
 * Version Validation Utilities
 * Handles semantic versioning (x.y.z) validation and comparison
 */

/**
 * Parse semantic version string into array of numbers
 * @param version - Version string in format "x.y.z"
 * @returns Array of [major, minor, patch] or null if invalid
 */
export function parseVersion(version: string): [number, number, number] | null {
  const trimmed = version.trim();
  const parts = trimmed.split('.');
  
  if (parts.length !== 3) {
    return null;
  }
  
  const numbers = parts.map(part => {
    const num = parseInt(part, 10);
    return isNaN(num) ? -1 : num;
  });
  
  if (numbers.some(n => n < 0)) {
    return null;
  }
  
  return [numbers[0], numbers[1], numbers[2]];
}

/**
 * Check if version string is valid semantic version (x.y.z)
 * @param version - Version string to validate
 * @returns true if valid, false otherwise
 */
export function isValidVersion(version: string): boolean {
  return parseVersion(version) !== null;
}

/**
 * Compare two semantic versions
 * @param version1 - First version string
 * @param version2 - Second version string
 * @returns 1 if v1 > v2, -1 if v1 < v2, 0 if equal, null if invalid
 */
export function compareVersions(
  version1: string, 
  version2: string
): 1 | -1 | 0 | null {
  const v1 = parseVersion(version1);
  const v2 = parseVersion(version2);
  
  if (!v1 || !v2) {
    return null;
  }
  
  // Compare major version
  if (v1[0] > v2[0]) return 1;
  if (v1[0] < v2[0]) return -1;
  
  // Compare minor version
  if (v1[1] > v2[1]) return 1;
  if (v1[1] < v2[1]) return -1;
  
  // Compare patch version
  if (v1[2] > v2[2]) return 1;
  if (v1[2] < v2[2]) return -1;
  
  return 0;
}

/**
 * Validate if requested version is greater than current version
 * Used for RFC validation to ensure version progression
 * @param currentVersion - Current version of the application
 * @param requestedVersion - Requested new version
 * @returns Object with isValid boolean and optional error message
 */
export function validateVersionProgression(
  currentVersion: string,
  requestedVersion: string
): { isValid: boolean; error?: string } {
  // Validate format of both versions
  if (!isValidVersion(currentVersion)) {
    return {
      isValid: false,
      error: 'Versi saat ini tidak valid',
    };
  }
  
  if (!isValidVersion(requestedVersion)) {
    return {
      isValid: false,
      error: 'Format versi tidak valid. Gunakan format x.y.z (contoh: 1.2.3)',
    };
  }
  
  // Compare versions
  const comparison = compareVersions(requestedVersion, currentVersion);
  
  if (comparison === null) {
    return {
      isValid: false,
      error: 'Tidak dapat membandingkan versi',
    };
  }
  
  if (comparison <= 0) {
    return {
      isValid: false,
      error: `Versi baru harus lebih besar dari versi saat ini (${currentVersion})`,
    };
  }
  
  return { isValid: true };
}

/**
 * Suggest next version based on change type
 * @param currentVersion - Current version string
 * @param changeType - Type of change: 'major' | 'minor' | 'patch'
 * @returns Suggested next version or null if invalid
 */
export function suggestNextVersion(
  currentVersion: string,
  changeType: 'major' | 'minor' | 'patch' = 'patch'
): string | null {
  const parsed = parseVersion(currentVersion);
  
  if (!parsed) {
    return null;
  }
  
  const [major, minor, patch] = parsed;
  
  switch (changeType) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
      return `${major}.${minor}.${patch + 1}`;
    default:
      return null;
  }
}
