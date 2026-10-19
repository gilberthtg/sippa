export const REQUEST_STATUSES = {
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ONGOING: 'ongoing',
  DONE: 'done',
  ON_HOLD: 'on_hold',
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

export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_FILES: 5,
  ALLOWED_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/png',
    'image/jpeg',
    'image/jpg',
  ],
  ALLOWED_EXTENSIONS: ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.png', '.jpg', '.jpeg'],
} as const;

export type Role = typeof ROLES[keyof typeof ROLES];

export const NOTIFICATION_EVENTS = {
  REQUEST_SUBMITTED: 'request_submitted',
  REQUEST_APPROVED: 'request_approved',
  REQUEST_REJECTED: 'request_rejected',
  DEVELOPER_ASSIGNED: 'developer_assigned',
  PROGRESS_UPDATED: 'progress_updated',
  REQUEST_COMPLETED: 'request_completed',
  REQUEST_ON_HOLD: 'request_on_hold',
  REQUEST_RESUMED: 'request_resumed',
} as const;

export const AUDIT_MODULES = {
  REQUESTS: 'requests',
  USERS: 'users',
  SETTINGS: 'settings',
  AUTH: 'auth',
  SLA: 'sla',
} as const;

export const AUDIT_ACTIONS = {
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  VERIFY: 'verify',
  APPROVE: 'approve',
  REJECT: 'reject',
  ASSIGN: 'assign',
  START: 'start',
  COMPLETE: 'complete',
  PAUSE: 'pause',
  RESUME: 'resume',
  RESUBMIT: 'resubmit',
  PROGRESS: 'progress',
  LOGIN_SUCCESS: 'login_success',
  LOGIN_FAILED: 'login_failed',
  LOGOUT: 'logout',
  TOGGLE_ACTIVE: 'toggle_active',
  CHANGE_PASSWORD: 'change_password',
  SET_PRIORITY: 'set_priority',
} as const;
