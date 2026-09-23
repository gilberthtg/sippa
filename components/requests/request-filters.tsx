'use client';

import { Button } from '@/components/ui/button';
import { REQUEST_STATUSES } from '@/lib/constants';

interface RequestFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: REQUEST_STATUSES.SUBMITTED, label: 'Submitted' },
  { value: REQUEST_STATUSES.VERIFICATION, label: 'Verifikasi' },
  { value: REQUEST_STATUSES.APPROVED, label: 'Disetujui' },
  { value: REQUEST_STATUSES.IN_PROGRESS, label: 'Dikerjakan' },
  { value: REQUEST_STATUSES.COMPLETED, label: 'Selesai' },
  { value: REQUEST_STATUSES.REJECTED, label: 'Ditolak' },
];

export function RequestFilters({ activeFilter, onFilterChange }: RequestFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <Button
          key={filter.value}
          variant={activeFilter === filter.value ? 'default' : 'outline'}
          size="sm"
          onClick={() => onFilterChange(filter.value)}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}
