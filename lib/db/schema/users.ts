import { mysqlTable, varchar, boolean, timestamp, int, smallint, index } from 'drizzle-orm/mysql-core';
import { roles, units } from './master';

export const users = mysqlTable('users', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  roleId: smallint('role_id').notNull().references(() => roles.id),
  unitId: int('unit_id').references(() => units.id),
  phone: varchar('phone', { length: 50 }),
  isActive: boolean('is_active').notNull().default(true),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  emailIdx: index('email_idx').on(table.email),
  roleIdx: index('role_id_idx').on(table.roleId),
  unitIdx: index('unit_id_idx').on(table.unitId),
  activeIdx: index('is_active_idx').on(table.isActive),
}));

export const teamMembers = mysqlTable('team_members', {
  teamId: int('team_id').notNull().references(() => users.id),
  userId: int('user_id').notNull().references(() => users.id),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
}, (table) => ({
  teamIdx: index('team_id_idx').on(table.teamId),
  userIdx: index('user_id_idx').on(table.userId),
}));
