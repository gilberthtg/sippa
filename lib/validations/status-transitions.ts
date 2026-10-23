// Status Transition Validation Utility
// Implements the 7-status workflow validation rules

import { REQUEST_STATUSES, ROLES } from '@/lib/constants';

export type RequestStatus = (typeof REQUEST_STATUSES)[keyof typeof REQUEST_STATUSES];
export type Role = (typeof ROLES)[keyof typeof ROLES];

// Valid transitions as per workflow plan
export const VALID_TRANSITIONS: Record<RequestStatus, readonly RequestStatus[]> = {
  [REQUEST_STATUSES.SUBMITTED]: [REQUEST_STATUSES.IN_REVIEW],
  [REQUEST_STATUSES.IN_REVIEW]: [REQUEST_STATUSES.APPROVED, REQUEST_STATUSES.REJECTED],
  [REQUEST_STATUSES.APPROVED]: [REQUEST_STATUSES.ONGOING],
  [REQUEST_STATUSES.ONGOING]: [REQUEST_STATUSES.ON_HOLD, REQUEST_STATUSES.DONE],
  [REQUEST_STATUSES.ON_HOLD]: [REQUEST_STATUSES.ONGOING],
  [REQUEST_STATUSES.REJECTED]: [REQUEST_STATUSES.SUBMITTED], // Resubmission by requester
  [REQUEST_STATUSES.DONE]: [], // FINAL
} as const;

// Role-based permissions for transitions
// Maps transition (from→to) to allowed roles
export const TRANSITION_ROLE_PERMISSIONS: Record<string, readonly Role[]> = {
  'submitted→in_review': [ROLES.ADMIN],
  'in_review→approved': [ROLES.ADMIN],
  'in_review→rejected': [ROLES.ADMIN],
  'approved→ongoing': [ROLES.ADMIN],
  'ongoing→on_hold': [ROLES.ADMIN, ROLES.DEVELOPER],
  'ongoing→done': [ROLES.ADMIN, ROLES.DEVELOPER],
  'on_hold→ongoing': [ROLES.ADMIN, ROLES.DEVELOPER],
  'rejected→submitted': [ROLES.USER, ROLES.ADMIN],
} as const;

export interface TransitionValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates if a status transition is allowed (without context)
 */
export function validateTransition(
  fromStatus: RequestStatus,
  toStatus: RequestStatus
): TransitionValidationResult {
  const allowed = VALID_TRANSITIONS[fromStatus];
  if (!allowed) {
    return {
      valid: false,
      error: `Status "${fromStatus}" tidak dikenali`,
    };
  }

  if (!allowed.includes(toStatus)) {
    // Check if it's a final status
    if (fromStatus === REQUEST_STATUSES.REJECTED) {
      return {
        valid: false,
        error: 'Request dengan status REJECTED tidak dapat diubah (status final)',
      };
    }
    if (fromStatus === REQUEST_STATUSES.DONE) {
      return {
        valid: false,
        error: 'Request dengan status DONE tidak dapat diubah (status final)',
      };
    }

    return {
      valid: false,
      error: `Transisi status dari "${fromStatus}" ke "${toStatus}" tidak diizinkan`,
    };
  }

  return { valid: true };
}

/**
 * Validates transition with role context
 */
export function validateTransitionWithContext(
  fromStatus: RequestStatus,
  toStatus: RequestStatus,
  userRole: Role
): TransitionValidationResult {
  // First check if transition is valid
  const basicValidation = validateTransition(fromStatus, toStatus);
  if (!basicValidation.valid) {
    return basicValidation;
  }

  // Check role permission
  const transitionKey = `${fromStatus}→${toStatus}`;
  const allowedRoles = TRANSITION_ROLE_PERMISSIONS[transitionKey];

  if (!allowedRoles) {
    return {
      valid: false,
      error: `Transisi "${fromStatus}→${toStatus}" tidak memiliki konfigurasi role`,
    };
  }

  if (!allowedRoles.includes(userRole)) {
    return {
      valid: false,
      error: `Role "${userRole}" tidak memiliki izin untuk transisi "${fromStatus}→${toStatus}"`,
    };
  }

  return { valid: true };
}

/**
 * Check if a status is terminal (final)
 */
export function isTerminalStatus(status: RequestStatus): boolean {
  return status === REQUEST_STATUSES.DONE;
}

/**
 * Statuses that lock the request document checklist (upload/delete)
 * DONE: final status — no further edits
 * REJECTED: request rejected — documents re-checked at resubmission
 */
export const DOCUMENT_LOCKED_STATUSES: readonly RequestStatus[] = [
  REQUEST_STATUSES.DONE,
  REQUEST_STATUSES.REJECTED,
];

/**
 * Check if document checklist edits (upload/delete) are locked for a request status
 */
export function isDocumentEditingLocked(status: RequestStatus): boolean {
  return DOCUMENT_LOCKED_STATUSES.includes(status);
}

/**
 * Get all possible next statuses from a given status
 */
export function getNextStatuses(status: RequestStatus): readonly RequestStatus[] {
  return VALID_TRANSITIONS[status] || [];
}

/**
 * Get error message for invalid transition (Indonesian)
 */
export function getTransitionErrorMessage(
  fromStatus: RequestStatus,
  toStatus: RequestStatus
): string {
  const result = validateTransition(fromStatus, toStatus);
  return result.error || 'Transisi status tidak valid';
}
