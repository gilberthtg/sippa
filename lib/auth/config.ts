import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { logAudit } from '@/lib/utils/audit';
import { AUDIT_MODULES, AUDIT_ACTIONS } from '@/lib/constants';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        
        if (!parsed.success) {
          return null;
        }
        
        const { email, password } = parsed.data;
        
        const result = await db
          .select({
            id: users.id,
            name: users.name,
            email: users.email,
            passwordHash: users.passwordHash,
            roleId: users.roleId,
            roleCode: roles.code,
            roleName: roles.name,
            unitId: users.unitId,
            isActive: users.isActive,
          })
          .from(users)
          .innerJoin(roles, eq(users.roleId, roles.id))
          .where(eq(users.email, email))
          .limit(1);
        
        const user = result[0];
        
        if (!user || !user.isActive) {
          logAudit({
            actorUserId: null,
            actorName: 'anonymous',
            module: AUDIT_MODULES.AUTH,
            entityType: 'session',
            entityId: '0',
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            afterData: { attemptedEmail: email, reason: !user ? 'user_not_found' : 'user_inactive' },
          });
          return null;
        }
        
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordMatch) {
          logAudit({
            actorUserId: null,
            actorName: 'anonymous',
            module: AUDIT_MODULES.AUTH,
            entityType: 'session',
            entityId: '0',
            action: AUDIT_ACTIONS.LOGIN_FAILED,
            afterData: { attemptedEmail: email, reason: 'invalid_password' },
          });
          return null;
        }
        
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));

        logAudit({
          actorUserId: user.id,
          actorName: user.name,
          module: AUDIT_MODULES.AUTH,
          entityType: 'session',
          entityId: String(user.id),
          action: AUDIT_ACTIONS.LOGIN_SUCCESS,
          afterData: { email: user.email, roleCode: user.roleCode },
        });
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          roleId: user.roleId,
          roleCode: user.roleCode,
          roleName: user.roleName,
          unitId: user.unitId,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roleId = user.roleId;
        token.roleCode = user.roleCode;
        token.roleName = user.roleName;
        token.unitId = user.unitId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        Object.assign(session.user, {
          id: token.id as number,
          roleId: token.roleId as number,
          roleCode: token.roleCode as string,
          roleName: token.roleName as string,
          unitId: token.unitId as number | null,
        });
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
});
