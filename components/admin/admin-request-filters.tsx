'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { STATUS_LABELS } from '@/lib/constants';
import { Filter } from 'lucide-react';

interface FilterOption {
  value: string;
  label: string;
}

interface AdminRequestFiltersProps {
  statusFilter: string[];
  priorityFilter: number[];
  typeFilter: string[];
  onStatusChange: (values: string[]) => void;
  onPriorityChange: (values: number[]) => void;
  onTypeChange: (values: string[]) => void;
  priorities: Array<{ id: number; name: string }>;
}

const statusOptions: FilterOption[] = [
  'submitted',
  'in_review',
  'approved',
  'rejected',
  'ongoing',
  'on_hold',
  'done',
].map((value) => ({ value, label: STATUS_LABELS[value] || value }));

const typeOptions: FilterOption[] = [
  { value: 'new_application', label: 'Pengembangan' },
  { value: 'rfc', label: 'RFC' },
];

export function AdminRequestFilters({
  statusFilter,
  priorityFilter,
  typeFilter,
  onStatusChange,
  onPriorityChange,
  onTypeChange,
  priorities,
}: AdminRequestFiltersProps) {
  const handleStatusToggle = (value: string) => {
    const newValues = statusFilter.includes(value)
      ? statusFilter.filter((v) => v !== value)
      : [...statusFilter, value];
    onStatusChange(newValues);
  };

  const handlePriorityToggle = (value: number) => {
    const newValues = priorityFilter.includes(value)
      ? priorityFilter.filter((v) => v !== value)
      : [...priorityFilter, value];
    onPriorityChange(newValues);
  };

  const handleTypeToggle = (value: string) => {
    const newValues = typeFilter.includes(value)
      ? typeFilter.filter((v) => v !== value)
      : [...typeFilter, value];
    onTypeChange(newValues);
  };

  const activeFilterCount =
    statusFilter.length + priorityFilter.length + typeFilter.length;

  return (
    <div className="flex flex-wrap gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Status
            {statusFilter.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {statusFilter.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {statusOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={statusFilter.includes(option.value)}
                onCheckedChange={() => handleStatusToggle(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Priority
            {priorityFilter.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {priorityFilter.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter Priority</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {priorities.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority.id}
                checked={priorityFilter.includes(priority.id)}
                onCheckedChange={() => handlePriorityToggle(priority.id)}
              >
                {priority.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Tipe
            {typeFilter.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {typeFilter.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Filter Tipe Request</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {typeOptions.map((option) => (
              <DropdownMenuCheckboxItem
                key={option.value}
                checked={typeFilter.includes(option.value)}
                onCheckedChange={() => handleTypeToggle(option.value)}
              >
                {option.label}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            onStatusChange([]);
            onPriorityChange([]);
            onTypeChange([]);
          }}
        >
          Reset ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
