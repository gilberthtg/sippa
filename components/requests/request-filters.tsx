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
  { value: REQUEST_STATUSES.IN_REVIEW, label: 'In Review' },
  { value: REQUEST_STATUSES.APPROVED, label: 'Approved' },
  { value: REQUEST_STATUSES.ONGOING, label: 'Ongoing' },
  { value: REQUEST_STATUSES.ON_HOLD, label: 'On Hold' },
  { value: REQUEST_STATUSES.DONE, label: 'Done' },
  { value: REQUEST_STATUSES.REJECTED, label: 'Rejected' },
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
