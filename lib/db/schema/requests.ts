import { mysqlTable, varchar, text, timestamp, int, smallint, bigint, boolean, mysqlEnum, index, tinyint } from 'drizzle-orm/mysql-core';
import { users } from './users';
import { units, priorities } from './master';
import { devteamUnits } from './devteam-units';
import { requestApplications } from './request-applications';
import { developerRoles } from './developer-roles';

export const requests = mysqlTable('requests', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestNo: varchar('request_no', { length: 50 }).notNull().unique(),
  requestType: mysqlEnum('request_type', ['new_application', 'rfc']).notNull(),
  
  // For NEW_APPLICATION: title is the application name
  // For RFC: title comes from linked application
  title: varchar('title', { length: 200 }).notNull(),
  
  // Application reference (NULL for NEW_APPLICATION, REQUIRED for RFC)
  applicationId: int('application_id').references(() => requestApplications.id),
  
  // Version fields
  // NEW_APPLICATION: auto-set to "1.0.0" (not editable by user)
  // RFC: requested_version is REQUIRED and must be > application.current_version
  requestedVersion: varchar('requested_version', { length: 50 }),
  
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
  
  // Admin assignment fields
  devtiUrusanId: int('devti_urusan_id').references(() => devteamUnits.id),
  technicalWriterId: int('technical_writer_id').references(() => users.id),
  teamLeaderId: int('team_leader_id').references(() => users.id),
  
  priorityId: smallint('priority_id').references(() => priorities.id),
  status: mysqlEnum('status', [
    'submitted',
    'in_review',
    'approved',
    'rejected',
    'ongoing',
    'done',
    'on_hold'
  ]).notNull().default('submitted'),
  
  submittedAt: timestamp('submitted_at').notNull().defaultNow(),
  approvedAt: timestamp('approved_at'),
  rejectedAt: timestamp('rejected_at'),
  assignedAt: timestamp('assigned_at'),
  startedAt: timestamp('started_at'),
  completedAt: timestamp('completed_at'),
  
  // SLA fields (now using business days)
  targetSlaHours: int('target_sla_hours'),
  actualDurationHours: int('actual_duration_hours'),
  slaMet: boolean('sla_met'),
  slaPausedAt: timestamp('sla_paused_at'),
  slaPausedDurationHours: int('sla_paused_duration_hours').default(0),
  
  rejectionNote: text('rejection_note'),
  completionNote: text('completion_note'),
  onHoldReason: text('on_hold_reason'),
  
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
  applicationIdx: index('application_id_idx').on(table.applicationId),
  technicalWriterIdx: index('technical_writer_id_idx').on(table.technicalWriterId),
  teamLeaderIdx: index('team_leader_id_idx').on(table.teamLeaderId),
}));

export const requestStatusHistories = mysqlTable('request_status_histories', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestId: bigint('request_id', { mode: 'number' }).notNull().references(() => requests.id),
  fromStatus: varchar('from_status', { length: 50 }),
  toStatus: varchar('to_status', { length: 50 }).notNull(),
  changedBy: int('changed_by').notNull().references(() => users.id),
  changedByName: varchar('changed_by_name', { length: 200 }).notNull(),
  actorRole: varchar('actor_role', { length: 50 }),
  note: text('note'),
  metadata: text('metadata'), // JSON for additional data like rejection reason
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

/**
 * Request Team Assignments (New Structure)
 * Individual-based assignments with specific developer roles
 * No more team concept - admin assigns developers directly with their roles
 */
export const requestTeamAssignments = mysqlTable('request_team_assignments', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestId: bigint('request_id', { mode: 'number' }).notNull().references(() => requests.id),
  assignedUserId: int('assigned_user_id').notNull().references(() => users.id),
  developerRoleId: smallint('developer_role_id').notNull().references(() => developerRoles.id),
  assignedBy: int('assigned_by').notNull().references(() => users.id),
  assignedAt: timestamp('assigned_at').notNull().defaultNow(),
  unassignedAt: timestamp('unassigned_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  requestIdx: index('request_id_idx').on(table.requestId),
  assignedUserIdx: index('assigned_user_id_idx').on(table.assignedUserId),
  developerRoleIdx: index('developer_role_id_idx').on(table.developerRoleId),
  assignedByIdx: index('assigned_by_idx').on(table.assignedBy),
  activeAssignmentsIdx: index('active_assignments_idx').on(table.requestId, table.unassignedAt),
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
