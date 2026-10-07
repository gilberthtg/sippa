import { mysqlTable, varchar, date, boolean, timestamp, int, index } from 'drizzle-orm/mysql-core';

/**
 * SLA Holidays Table
 * Stores national holidays and non-working days to exclude from SLA business days calculation
 * SLA calculation now uses business days (Mon-Fri) excluding weekends and holidays in this table
 */
export const slaHolidays = mysqlTable('sla_holidays', {
  id: int('id').primaryKey().autoincrement(),
  holidayDate: date('holiday_date').notNull().unique(),
  description: varchar('description', { length: 255 }).notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  dateIdx: index('holiday_date_idx').on(table.holidayDate),
  activeIdx: index('is_active_idx').on(table.isActive),
}));
