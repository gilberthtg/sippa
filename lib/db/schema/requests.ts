import { mysqlTable, varchar, text, timestamp, int, smallint, bigint, boolean, mysqlEnum, index, tinyint } from 'drizzle-orm/mysql-core';
import { users } from './users';
import { units, priorities, teams } from './master';

export const requests = mysqlTable('requests', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestNo: varchar('request_no', { length: 50 }).notNull().unique(),
  requestType: mysqlEnum('request_type', ['new_application', 'rfc']).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  description: text('description').notNull(),
  businessNeed: text('business_need'),
  objective: text('objective'),
  expectedOutput: text('expected_output'),
  urgency: mysqlEnum('urgency', ['low', 'medium', 'high']),
  
  requesterId: int('requester_id').notNull().references(() => users.id),
  requesterName: varchar('requester_name', { length: 200 }).notNull(),
  requesterEmail: varchar('requester_email', { length: 255 }).notNull(),
  requesterUnitId: int('requester_unit_id').references(() => units.id),
  requesterPhone: varchar('requester_phone', { length: 50 }),
  
  priorityId: smallint('priority_id').references(() => priorities.id),
  status: mysqlEnum('status', [
    'submitted',
    'verification',
    'rejected',
    'approved',
    'assigned',
    'in_progress',
    'completed'
  ]).notNull().default('submitted'),
  
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  assignedAt: timestamp('assigned_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  targetSlaHours: int('target_sla_hours'),
  actualDurationHours: int('actual_duration_hours'),
  slaMet: boolean('sla_met'),
  
  rejectionNote: text('rejection_note'),
  completionNote: text('completion_note'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  requestNoIdx: index('request_no_idx').on(table.requestNo),
  requesterIdx: index('requester_id_idx').on(table.requesterId),
  statusIdx: index('status_idx').on(table.status),
  typeIdx: index('request_type_idx').on(table.requestType),
  priorityIdx: index('priority_id_idx').on(table.priorityId),
  submittedIdx: index('submitted_at_idx').on(table.submittedAt),
  completedIdx: index('completed_at_idx').on(table.completedAt),
}));

export const requestStatusHistories = mysqlTable('request_status_histories', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestId: bigint('request_id', { mode: 'number' }).notNull().references(() => requests.id),
  fromStatus: varchar('from_status', { length: 50 }),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  changedBy: int('changed_by').notNull().references(() => users.id),
  changedByName: varchar('changed_by_name', { length: 200 }).notNull(),
  note: text('note'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  requestIdx: index('request_id_idx').on(table.requestId),
  createdIdx: index('created_at_idx').on(table.createdAt),
}));

export const requestAttachments = mysqlTable('request_attachments', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestId: bigint('request_id', { mode: 'number' }).notNull().references(() => requests.id),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull().unique(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  uploadedBy: int('uploaded_by').notNull().references(() => users.id),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
}, (table) => ({
  requestIdx: index('request_id_idx').on(table.requestId),
  storageKeyIdx: index('storage_key_idx').on(table.storageKey),
}));

export const requestAssignments = mysqlTable('request_assignments', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestId: bigint('request_id', { mode: 'number' }).notNull().references(() => requests.id),
  teamId: int('team_id').references(() => teams.id),
  developerId: int('developer_id').references(() => users.id),
  assignedBy: int('assigned_by').notNull().references(() => users.id),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  unassignedAt: timestamp('unassigned_at'),
}, (table) => ({
  requestIdx: index('request_id_idx').on(table.requestId),
  developerIdx: index('developer_id_idx').on(table.developerId),
  teamIdx: index('team_id_idx').on(table.teamId),
}));

export const requestProgress = mysqlTable('request_progress', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestId: bigint('request_id', { mode: 'number' }).notNull().references(() => requests.id),
  progressPercent: tinyint('progress_percent'),
  updateNote: text('update_note').notNull(),
  updatedBy: int('updated_by').notNull().references(() => users.id),
  updatedByName: varchar('updated_by_name', { length: 200 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  requestIdx: index('request_id_idx').on(table.requestId),
  createdIdx: index('created_at_idx').on(table.createdAt),
}));
