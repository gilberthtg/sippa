export const REQUEST_STATUSES = {
  SUBMITTED: 'submitted',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ONGOING: 'ongoing',
  DONE: 'done',
  ON_HOLD: 'on_hold',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  [REQUEST_STATUSES.SUBMITTED]: 'Submitted',
  [REQUEST_STATUSES.IN_REVIEW]: 'In Review',
  [REQUEST_STATUSES.APPROVED]: 'Approved',
  [REQUEST_STATUSES.REJECTED]: 'Rejected',
  [REQUEST_STATUSES.ONGOING]: 'Ongoing',
  [REQUEST_STATUSES.ON_HOLD]: 'On Hold',
  [REQUEST_STATUSES.DONE]: 'Done'
};

export const STATUS_CONFIG: Record<string, { label: string; className: string; icon: string }> = {
  [REQUEST_STATUSES.SUBMITTED]: {
    label: 'Submitted',
    className: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
    icon: 'clock',
  },
  [REQUEST_STATUSES.IN_REVIEW]: {
    label: 'In Review',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    icon: 'eye',
  },
  [REQUEST_STATUSES.APPROVED]: {
    label: 'Approved',
    className: 'bg-green-100 text-green-800 hover:bg-green-100',
    icon: 'check-circle',
  },
  [REQUEST_STATUSES.REJECTED]: {
    label: 'Rejected',
    className: 'bg-red-100 text-red-800 hover:bg-red-100',
    icon: 'x-circle',
  },
  [REQUEST_STATUSES.ONGOING]: {
    label: 'Ongoing',
    className: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
    icon: 'play',
  },
  [REQUEST_STATUSES.ON_HOLD]: {
    label: 'On Hold',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-100',
    icon: 'pause-circle',
  },
  [REQUEST_STATUSES.DONE]: {
    label: 'Done',
    className: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    icon: 'check-circle-2',
  },
};

export const STATUS_DESCRIPTIONS: Record<string, string> = {
  [REQUEST_STATUSES.SUBMITTED]: 'Request baru dibuat oleh user, menunggu verifikasi admin',
  [REQUEST_STATUSES.IN_REVIEW]: 'Admin sedang meninjau detail dan kelengkapan request',
  [REQUEST_STATUSES.APPROVED]: 'Request disetujui, menunggu pembentukan tim',
  [REQUEST_STATUSES.REJECTED]: 'Request ditolak dan tidak dapat dibuka kembali',
  [REQUEST_STATUSES.ONGOING]: 'Pengerjaan request sedang berlangsung oleh tim',
  [REQUEST_STATUSES.ON_HOLD]: 'Pengerjaan ditangguhkan sementara, SLA dijeda',
  [REQUEST_STATUSES.DONE]: 'Pengerjaan selesai dan request ditutup',
};

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
  REQUEST_IN_REVIEW: 'request_in_review',
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
