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
            <SelectValue>
              {year}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {years.map((y) => (
              <SelectItem key={y} value={y.toString()}>
                <span className="font-medium">{y}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Jenis:</label>
        <Select value={requestType || 'all'} onValueChange={(val) => onRequestTypeChange(val === 'all' ? undefined : (val || undefined))}>
          <SelectTrigger className="w-52">
            <SelectValue>
              {!requestType || requestType === 'all' ? 'Semua Jenis' : requestType === 'new_application' ? 'Pengembangan' : 'RFC'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="font-medium">Semua Jenis</span>
            </SelectItem>
            <SelectItem value="new_application">
              <div className="flex flex-col py-1">
                <span className="font-medium">Pengembangan</span>
                <span className="text-xs text-muted-foreground">Aplikasi baru</span>
              </div>
            </SelectItem>
            <SelectItem value="rfc">
              <div className="flex flex-col py-1">
                <span className="font-medium">RFC</span>
                <span className="text-xs text-muted-foreground">Request for Change</span>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Prioritas:</label>
        <Select value={priorityId?.toString() || 'all'} onValueChange={(val) => onPriorityChange(val === 'all' ? undefined : (val ? parseInt(val) : undefined))}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {!priorityId || priorityId.toString() === 'all' ? 'Semua' : priorityId === 1 ? 'Low' : priorityId === 2 ? 'Medium' : priorityId === 3 ? 'High' : 'Critical'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="font-medium">Semua</span>
            </SelectItem>
            <SelectItem value="1">
              <span className="font-medium">Low</span>
            </SelectItem>
            <SelectItem value="2">
              <span className="font-medium">Medium</span>
            </SelectItem>
            <SelectItem value="3">
              <span className="font-medium">High</span>
            </SelectItem>
            <SelectItem value="4">
              <span className="font-medium">Critical</span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium">Status SLA:</label>
        <Select value={slaStatus || 'all'} onValueChange={(val) => onSLAStatusChange(val === 'all' ? undefined : (val || undefined))}>
          <SelectTrigger className="w-40">
            <SelectValue>
              {!slaStatus || slaStatus === 'all' ? 'Semua' : slaStatus === 'met' ? 'Terpenuhi' : 'Terlampaui'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              <span className="font-medium">Semua</span>
            </SelectItem>
            <SelectItem value="met">
              <div className="flex flex-col py-1">
                <span className="font-medium">Terpenuhi</span>
                <span className="text-xs text-muted-foreground">Selesai dalam target SLA</span>
              </div>
            </SelectItem>
            <SelectItem value="exceeded">
              <div className="flex flex-col py-1">
                <span className="font-medium">Terlampaui</span>
                <span className="text-xs text-muted-foreground">Melebihi target SLA</span>
              </div>
            </SelectItem>
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
