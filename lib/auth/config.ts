import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { db } from '@/lib/db';
import { users, roles } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

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
        
        // Find user with role
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
          return null;
        }
        
        // Verify password
        const passwordMatch = await bcrypt.compare(password, user.passwordHash);
        
        if (!passwordMatch) {
          return null;
        }
        
        // Update last login
        await db
          .update(users)
          .set({ lastLoginAt: new Date() })
          .where(eq(users.id, user.id));
        
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
        // Type assertion needed due to NextAuth type limitations
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
    maxAge: 24 * 60 * 60, // 24 hours
  },
});
