import { mysqlTable, int, varchar, text, boolean, timestamp, index } from 'drizzle-orm/mysql-core';
import { users } from './users';

export const notifications = mysqlTable('notifications', {
  id: int('id').primaryKey().autoincrement(),
  userId: int('user_id').notNull().references(() => users.id),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: varchar('entity_id', { length: 50 }),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  userReadIdx: index('user_read_idx').on(table.userId, table.isRead),
  userCreatedIdx: index('user_created_idx').on(table.userId, table.createdAt),
}));
