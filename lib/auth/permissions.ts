import { ROLES, type Role } from '@/lib/constants';
export type Permission = 
  | 'request:create'
  | 'request:view_own'
  | 'request:view_all'
  | 'request:verify'
  | 'request:approve'
  | 'request:reject'
  | 'request:assign'
  | 'request:update_progress'
  | 'request:complete'
  | 'priority:set'
  | 'attachment:upload'
  | 'attachment:download_own'
  | 'attachment:download_all'
  | 'report:laptri'
  | 'report:sla'
  | 'audit:view';

const permissions: Record<Role, Permission[]> = {
  [ROLES.USER]: [
    'request:create',
    'request:view_own',
    'attachment:upload',
    'attachment:download_own',
  ],
  [ROLES.ADMIN]: [
    'request:view_all',
    'request:verify',
    'request:approve',
    'request:reject',
    'request:assign',
    'priority:set',
    'attachment:download_all',
    'report:laptri',
    'report:sla',
    'audit:view',
  ],
  [ROLES.DEVELOPER]: [
    'request:view_all',
    'request:update_progress',
    'request:complete',
    'attachment:download_all',
  ],
};

export function hasPermission(role: Role, permission: Permission): boolean {
  return permissions[role]?.includes(permission) ?? false;
}

export function canViewRequest(
  role: Role,
  requesterId: number,
  assignedDeveloperId: number | null,
  currentUserId: number
): boolean {
  if (role === ROLES.ADMIN) return true;
  if (role === ROLES.USER && requesterId === currentUserId) return true;
  if (role === ROLES.DEVELOPER && assignedDeveloperId === currentUserId) return true;
  return false;
}

export function canEditRequest(
  role: Role,
  requestStatus: string,
  requesterId: number,
  currentUserId: number
): boolean {
  // Only admins can edit after submission
  if (role === ROLES.ADMIN) return true;
  
  // Users can only edit their own submitted requests (before approval)
  if (role === ROLES.USER && requesterId === currentUserId && requestStatus === 'submitted') {
    return true;
  }
  
  return false;
}

export function getAvailableActions(
  role: Role,
  status: string,
  requesterId: number,
  assignedDeveloperId: number | null,
  currentUserId: number
): string[] {
  const actions: string[] = [];
  
  if (role === ROLES.ADMIN) {
    if (status === 'submitted' || status === 'in_review') {
      actions.push('verify', 'approve', 'reject', 'set_priority');
    }
    if (status === 'approved') {
      actions.push('assign', 'set_priority');
    }
    if (status === 'ongoing' || status === 'on_hold') {
      actions.push('reassign', 'pause', 'resume');
    }
  }
  
  if (role === ROLES.DEVELOPER && assignedDeveloperId === currentUserId) {
    if (status === 'ongoing') {
      actions.push('update_progress', 'complete', 'pause');
    }
    if (status === 'on_hold') {
      actions.push('resume');
    }
  }
  
  return actions;
}

export function getRoleLabel(roleCode: string): string {
  const labels: Record<string, string> = {
    user: 'User',
    admin: 'Admin',
    developer: 'Developer',
  };
  return labels[roleCode] || roleCode;
}
