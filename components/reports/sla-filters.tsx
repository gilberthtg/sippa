'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

interface SLAFiltersProps {
  year: number;
  requestType?: string;
  priorityId?: number;
  slaStatus?: string;
  onYearChange: (year: number) => void;
  onRequestTypeChange: (type?: string) => void;
  onPriorityChange: (priorityId?: number) => void;
  onSLAStatusChange: (status?: string) => void;
  onExport: () => void;
}

export function SLAFilters({
  year,
  requestType,
  priorityId,
  slaStatus,
  onYearChange,
  onRequestTypeChange,
  onPriorityChange,
  onSLAStatusChange,
  onExport,
}: SLAFiltersProps) {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 2, currentYear - 1, currentYear, currentYear + 1];

  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Tahun:</label>
        <Select value={year.toString()} onValueChange={(val) => onYearChange(parseInt(val || year.toString()))}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Jenis:</label>
        <Select value={requestType || 'all'} onValueChange={(val) => onRequestTypeChange(val === 'all' ? undefined : (val || undefined))}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="new_application">New Application</SelectItem>
            <SelectItem value="rfc">RFC</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Prioritas:</label>
        <Select value={priorityId?.toString() || 'all'} onValueChange={(val) => onPriorityChange(val === 'all' ? undefined : (val ? parseInt(val) : undefined))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="1">Low</SelectItem>
            <SelectItem value="2">Medium</SelectItem>
            <SelectItem value="3">High</SelectItem>
            <SelectItem value="4">Critical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status SLA:</label>
        <Select value={slaStatus || 'all'} onValueChange={(val) => onSLAStatusChange(val === 'all' ? undefined : (val || undefined))}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>
            <SelectItem value="met">Terpenuhi</SelectItem>
            <SelectItem value="exceeded">Terlampaui</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button onClick={onExport} variant="outline" className="ml-auto">
        <Download className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}
