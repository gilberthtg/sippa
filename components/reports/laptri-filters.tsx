'use client';

import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Download } from 'lucide-react';

interface LaptriFiltersProps {
  year: number;
  quarter?: number;
  requestType?: string;
  onYearChange: (year: number) => void;
  onQuarterChange: (quarter?: number) => void;
  onRequestTypeChange: (type?: string) => void;
  onExport: () => void;
}

export function LaptriFilters({
  year,
  quarter,
  requestType,
  onYearChange,
  onQuarterChange,
  onRequestTypeChange,
  onExport,
}: LaptriFiltersProps) {
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
        <label className="text-sm font-medium">Kuartal:</label>
        <div className="flex gap-1">
          <Button
            variant={!quarter ? 'default' : 'outline'}
            size="sm"
            onClick={() => onQuarterChange(undefined)}
          >
            Semua
          </Button>
          {[1, 2, 3, 4].map((q) => (
            <Button
              key={q}
              variant={quarter === q ? 'default' : 'outline'}
              size="sm"
              onClick={() => onQuarterChange(q as 1 | 2 | 3 | 4)}
            >
              Q{q}
            </Button>
          ))}
        </div>
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

      <Button onClick={onExport} variant="outline" className="ml-auto">
        <Download className="mr-2 h-4 w-4" />
        Export Excel
      </Button>
    </div>
  );
}
