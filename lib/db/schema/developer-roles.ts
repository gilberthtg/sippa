import { mysqlTable, varchar, text, boolean, timestamp, smallint, index } from 'drizzle-orm/mysql-core';

/**
 * Developer Roles Table
 * Specific roles for developers: SA, TW, BE, FE, QA, DM
 * Each developer can only have ONE developer role
 */
export const developerRoles = mysqlTable('developer_roles', {
  id: smallint('id').primaryKey().autoincrement(),
  code: varchar('code', { length: 10 }).notNull().unique(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isActive: boolean('is_active').notNull().default(true),
  sortOrder: smallint('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  codeIdx: index('code_idx').on(table.code),
  activeIdx: index('is_active_idx').on(table.isActive),
  sortIdx: index('sort_order_idx').on(table.sortOrder),
}));
