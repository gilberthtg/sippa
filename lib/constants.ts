export const REQUEST_STATUSES = {
  SUBMITTED: 'submitted',
  VERIFICATION: 'verification',
  REJECTED: 'rejected',
  APPROVED: 'approved',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
} as const;

export const REQUEST_TYPES = {
  NEW_APPLICATION: 'new_application',
  RFC: 'rfc',
} as const;

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  DEVELOPER: 'developer',
} as const;

export const ROLE_IDS = {
  USER: 1,
  ADMIN: 2,
  DEVELOPER: 3,
} as const;

export const PRIORITY_CODES = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];
