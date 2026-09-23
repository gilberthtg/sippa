import { mysqlTable, varchar, text, timestamp, int, smallint, bigint, boolean, mysqlEnum, date, index } from 'drizzle-orm/mysql-core';
import { priorities } from './master';
import { users } from './users';

export const slaPolicies = mysqlTable('sla_policies', {
  id: int('id').primaryKey().autoincrement(),
  requestType: mysqlEnum('request_type', ['new_application', 'rfc']),
  priorityId: smallint('priority_id').references(() => priorities.id),
  targetHours: int('target_hours').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  effectiveFrom: date('effective_from'),
  effectiveTo: date('effective_to'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  typeIdx: index('request_type_idx').on(table.requestType),
  priorityIdx: index('priority_id_idx').on(table.priorityId),
  activeIdx: index('is_active_idx').on(table.isActive),
}));

export const auditLogs = mysqlTable('audit_logs', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  actorUserId: int('actor_user_id').notNull().references(() => users.id),
  actorName: varchar('actor_name', { length: 200 }).notNull(),
  entityType: varchar('entity_type', { length: 100 }).notNull(),
  entityId: varchar('entity_id', { length: 100 }).notNull(),
  action: varchar('action', { length: 100 }).notNull(),
  beforeData: text('before_data'),
  afterData: text('after_data'),
  ipAddress: varchar('ip_address', { length: 50 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  actorIdx: index('actor_user_id_idx').on(table.actorUserId),
  entityTypeIdx: index('entity_type_idx').on(table.entityType),
  entityIdIdx: index('entity_id_idx').on(table.entityId),
  actionIdx: index('action_idx').on(table.action),
  createdIdx: index('created_at_idx').on(table.createdAt),
}));
