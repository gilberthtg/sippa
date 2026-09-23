import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleString('id-ID', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

export function generateRequestNo(year: number, sequence: number): string {
  return `REQ-${year}-${String(sequence).padStart(4, '0')}`;
}

export function calculateDurationHours(startDate: Date | string, endDate: Date | string): number {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  const diffMs = end.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60));
}

export function calculateSLAStatus(
  submittedAt: Date | string,
  completedAt: Date | string | null,
  targetHours: number | null
): {
  elapsedHours: number;
  remainingHours: number | null;
  status: 'on_track' | 'at_risk' | 'breached' | 'met' | 'missed';
  percentage: number;
} {
  const start = typeof submittedAt === 'string' ? new Date(submittedAt) : submittedAt;
  const now = completedAt
    ? typeof completedAt === 'string' ? new Date(completedAt) : completedAt
    : new Date();
  
  const elapsedHours = calculateDurationHours(start, now);
  
  if (!targetHours) {
    return {
      elapsedHours,
      remainingHours: null,
      status: 'on_track',
      percentage: 0,
    };
  }
  
  const remainingHours = targetHours - elapsedHours;
  const percentage = Math.min((elapsedHours / targetHours) * 100, 100);
  
  // If completed
  if (completedAt) {
    return {
      elapsedHours,
      remainingHours: 0,
      status: remainingHours >= 0 ? 'met' : 'missed',
      percentage,
    };
  }
  
  // If in progress
  if (remainingHours < 0) {
    return {
      elapsedHours,
      remainingHours,
      status: 'breached',
      percentage,
    };
  }
  
  const hoursLeft = remainingHours;
  const thresholdAtRisk = targetHours * 0.2; // 20% remaining
  
  if (hoursLeft <= thresholdAtRisk) {
    return {
      elapsedHours,
      remainingHours,
      status: 'at_risk',
      percentage,
    };
  }
  
  return {
    elapsedHours,
    remainingHours,
    status: 'on_track',
    percentage,
  };
}
