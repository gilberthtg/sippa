import { mysqlTable, varchar, boolean, timestamp, int } from 'drizzle-orm/mysql-core';

export const devteamUnits = mysqlTable('devteam_units', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 200 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
});
