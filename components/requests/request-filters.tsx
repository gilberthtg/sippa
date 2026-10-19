'use client';

import { Button } from '@/components/ui/button';
import { REQUEST_STATUSES, STATUS_LABELS } from '@/lib/constants';

interface RequestFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

const FILTERS = [
  { value: 'all', label: 'Semua' },
  { value: REQUEST_STATUSES.SUBMITTED, label: STATUS_LABELS[REQUEST_STATUSES.SUBMITTED] },
  { value: REQUEST_STATUSES.IN_REVIEW, label: STATUS_LABELS[REQUEST_STATUSES.IN_REVIEW] },
  { value: REQUEST_STATUSES.APPROVED, label: STATUS_LABELS[REQUEST_STATUSES.APPROVED] },
  { value: REQUEST_STATUSES.ONGOING, label: STATUS_LABELS[REQUEST_STATUSES.ONGOING] },
  { value: REQUEST_STATUSES.ON_HOLD, label: STATUS_LABELS[REQUEST_STATUSES.ON_HOLD] },
  { value: REQUEST_STATUSES.DONE, label: STATUS_LABELS[REQUEST_STATUSES.DONE] },
  { value: REQUEST_STATUSES.REJECTED, label: STATUS_LABELS[REQUEST_STATUSES.REJECTED] },
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
