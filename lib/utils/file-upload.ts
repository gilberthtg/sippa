import { FILE_UPLOAD } from '@/lib/constants';

export interface UploadedFile {
  originalName: string;
  storageKey: string;
  mimeType: string;
  sizeBytes: number;
}

/**
 * Validate file type
 */
export function isValidFileType(mimeType: string): boolean {
  return (FILE_UPLOAD.ALLOWED_TYPES as readonly string[]).includes(mimeType);
}

/**
 * Validate file size
 */
export function isValidFileSize(sizeBytes: number): boolean {
  return sizeBytes > 0 && sizeBytes <= FILE_UPLOAD.MAX_FILE_SIZE;
}

/**
 * Sanitize filename - remove special characters
 */
export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 200);
}

/**
 * Generate unique storage key
 * Format: {year}/{month}/{timestamp}-{hash}-{sanitizedName}
 */
export function generateStorageKey(originalName: string): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const timestamp = Date.now();
  const hash = Math.random().toString(36).substring(2, 15);
  const sanitized = sanitizeFilename(originalName);
  
  return `${year}/${month}/${timestamp}-${hash}-${sanitized}`;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? `.${parts[parts.length - 1].toLowerCase()}` : '';
}

/**
 * Validate file before upload
 */
export function validateFile(file: File): { valid: boolean; error?: string } {
  if (!isValidFileType(file.type)) {
    return {
      valid: false,
      error: `Tipe file tidak didukung. Hanya ${FILE_UPLOAD.ALLOWED_EXTENSIONS.join(', ')} yang diperbolehkan.`,
    };
  }

  if (!isValidFileSize(file.size)) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal ${formatFileSize(FILE_UPLOAD.MAX_FILE_SIZE)}.`,
    };
  }

  return { valid: true };
}
