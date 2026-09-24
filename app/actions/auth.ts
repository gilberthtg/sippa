'use server';

import { signOut } from '@/lib/auth/config';
import { auth } from '@/lib/auth/config';
import { logAudit } from '@/lib/utils/audit';
import { AUDIT_MODULES, AUDIT_ACTIONS } from '@/lib/constants';

/**
 * Logout action with audit logging
 * Logs the logout event before signing out the user
 */
export async function logout() {
  try {
    const session = await auth();
    
    if (session?.user) {
      // Log audit before logout
      await logAudit({
        actorUserId: session.user.id,
        actorName: session.user.name || 'Unknown',
        module: AUDIT_MODULES.AUTH,
        entityType: 'session',
        entityId: String(session.user.id),
        action: AUDIT_ACTIONS.LOGOUT,
        beforeData: { 
          email: session.user.email,
          roleCode: session.user.roleCode,
        },
      });
    }
    
    // Perform logout
    await signOut({ redirectTo: '/login' });
    
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Even if audit fails, we should still logout
    await signOut({ redirectTo: '/login' });
    return { success: true };
  }
}
