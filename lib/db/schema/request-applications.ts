import { mysqlTable, varchar, text, timestamp, int, index } from 'drizzle-orm/mysql-core';
import { users } from './users';

/**
 * Request Applications Table
 * Master data for applications created from approved NEW_APPLICATION requests
 * Used as reference for RFC requests to maintain consistency
 */
export const requestApplications = mysqlTable('request_applications', {
  id: int('id').primaryKey().autoincrement(),
  applicationName: varchar('application_name', { length: 255 }).notNull().unique(),
  description: text('description'),
  currentVersion: varchar('current_version', { length: 50 }).notNull().default('1.0.0'),
  createdBy: int('created_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  nameIdx: index('application_name_idx').on(table.applicationName),
  createdByIdx: index('created_by_idx').on(table.createdBy),
  versionIdx: index('current_version_idx').on(table.currentVersion),
}));
