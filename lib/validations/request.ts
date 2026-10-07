import { z } from 'zod';
import { isValidVersion } from '@/lib/utils/version';

export const loginSchema = z.object({
  email: z.string().email('Email tidak valid'),
  password: z.string().min(1, 'Password harus diisi'),
});

/**
 * Base schema for common fields in both NEW_APPLICATION and RFC
 */
const baseRequestSchema = z.object({
  requestType: z.enum(['new_application', 'rfc'], {
    message: 'Jenis permintaan harus dipilih',
  }),
  description: z.string()
    .min(50, 'Deskripsi minimal 50 karakter')
    .max(5000, 'Deskripsi maksimal 5000 karakter'),
  businessNeed: z.string()
    .max(2000, 'Kebutuhan bisnis maksimal 2000 karakter')
    .optional(),
  objective: z.string()
    .max(2000, 'Tujuan maksimal 2000 karakter')
    .optional(),
  expectedOutput: z.string()
    .max(2000, 'Output yang diharapkan maksimal 2000 karakter')
    .optional(),
  urgency: z.enum(['low', 'medium', 'high']).optional(),
  requesterPhone: z.string()
    .max(50, 'Nomor telepon maksimal 50 karakter')
    .optional(),
});

/**
 * Schema for NEW_APPLICATION requests
 * Requires: title (application name)
 * Version is auto-generated as 1.0.0
 */
const newApplicationSchema = baseRequestSchema.extend({
  requestType: z.literal('new_application'),
  title: z.string()
    .min(3, 'Nama aplikasi minimal 3 karakter')
    .max(200, 'Nama aplikasi maksimal 200 karakter'),
  applicationId: z.never().optional(), // Not allowed for new application
  requestedVersion: z.never().optional(), // Not allowed for new application
});

/**
 * Schema for RFC (Request for Change) requests
 * Requires: applicationId, requestedVersion
 * Title is inherited from selected application
 */
const rfcSchema = baseRequestSchema.extend({
  requestType: z.literal('rfc'),
  applicationId: z.coerce.number().int().positive('Aplikasi harus dipilih'),
  requestedVersion: z.string()
    .min(1, 'Versi baru harus diisi')
    .refine(
      (version) => isValidVersion(version),
      'Format versi tidak valid. Gunakan format x.y.z (contoh: 1.2.3)'
    ),
  title: z.never().optional(), // Not allowed for RFC, will use application name
});

/**
 * Discriminated union schema for request creation
 * Automatically validates based on requestType
 */
export const createRequestSchema = z.discriminatedUnion('requestType', [
  newApplicationSchema,
  rfcSchema,
]);

export const updateProgressSchema = z.object({
  updateNote: z.string()
    .min(10, 'Catatan minimal 10 karakter')
    .max(2000, 'Catatan maksimal 2000 karakter'),
  progressPercent: z.number()
    .min(0, 'Progress minimal 0%')
    .max(100, 'Progress maksimal 100%')
    .optional(),
});

export const rejectRequestSchema = z.object({
  rejectionNote: z.string()
    .min(10, 'Alasan penolakan minimal 10 karakter')
    .max(2000, 'Alasan penolakan maksimal 2000 karakter'),
});

export const completeRequestSchema = z.object({
  completionNote: z.string()
    .max(2000, 'Catatan penyelesaian maksimal 2000 karakter')
    .optional(),
});

export const assignRequestSchema = z.object({
  developerId: z.number().int().positive('Developer harus dipilih').optional(),
  teamId: z.number().int().positive('Tim harus dipilih').optional(),
}).refine(
  (data) => data.developerId || data.teamId,
  'Developer atau Tim harus dipilih'
);

export const setPrioritySchema = z.object({
  priorityId: z.number().int().positive('Prioritas harus dipilih'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateProgressInput = z.infer<typeof updateProgressSchema>;
export type RejectRequestInput = z.infer<typeof rejectRequestSchema>;
export type CompleteRequestInput = z.infer<typeof completeRequestSchema>;
export type AssignRequestInput = z.infer<typeof assignRequestSchema>;
export type SetPriorityInput = z.infer<typeof setPrioritySchema>;
