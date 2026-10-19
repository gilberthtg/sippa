import { mysqlTable, varchar, text, timestamp, int, smallint, bigint, boolean, mysqlEnum, index, unique } from 'drizzle-orm/mysql-core';
import { users } from './users';
import { requests } from './requests';

/**
 * Document Types Table
 * Master data for document types required per request
 * e.g. "Permintaan Aplikasi", "Project Plan", "UAT", etc.
 */
export const documentTypes = mysqlTable('document_types', {
  id: smallint('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  sortOrder: smallint('sort_order').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow().onUpdateNow(),
}, (table) => ({
  nameIdx: index('name_idx').on(table.name),
  activeIdx: index('is_active_idx').on(table.isActive),
  sortIdx: index('sort_order_idx').on(table.sortOrder),
}));

/**
 * Service Document Types Table
 * Junction table: maps which document types are required for each request type
 * request_type: 'new_application' (Pengembangan) or 'rfc'
 */
export const serviceDocumentTypes = mysqlTable('service_document_types', {
  id: smallint('id').primaryKey().autoincrement(),
  requestType: mysqlEnum('request_type', ['new_application', 'rfc']).notNull(),
  documentTypeId: smallint('document_type_id').notNull().references(() => documentTypes.id),
  isRequired: boolean('is_required').notNull().default(true),
  sortOrder: smallint('sort_order').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  requestTypeIdx: index('request_type_idx').on(table.requestType),
  documentTypeIdx: index('document_type_id_idx').on(table.documentTypeId),
  uniqueMapping: unique('unique_request_type_document_type').on(table.requestType, table.documentTypeId),
}));

/**
 * Request Documents Table
 * Tracks uploaded documents per request (1 file per document type per request)
 */
export const requestDocuments = mysqlTable('request_documents', {
  id: bigint('id', { mode: 'number' }).primaryKey().autoincrement(),
  requestId: bigint('request_id', { mode: 'number' }).notNull().references(() => requests.id),
  documentTypeId: smallint('document_type_id').notNull().references(() => documentTypes.id),
  originalName: varchar('original_name', { length: 255 }).notNull(),
  storageKey: varchar('storage_key', { length: 500 }).notNull().unique(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  sizeBytes: bigint('size_bytes', { mode: 'number' }).notNull(),
  uploadedBy: int('uploaded_by').notNull().references(() => users.id),
  uploadedAt: timestamp('uploaded_at').notNull().defaultNow(),
}, (table) => ({
  requestIdx: index('request_id_idx').on(table.requestId),
  documentTypeIdx: index('document_type_id_idx').on(table.documentTypeId),
  storageKeyIdx: index('storage_key_idx').on(table.storageKey),
  uniqueRequestDocument: unique('unique_request_document_type').on(table.requestId, table.documentTypeId),
}));