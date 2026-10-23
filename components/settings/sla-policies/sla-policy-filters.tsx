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
import { Filter, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

type Priority = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  priorities: Priority[];
};

export function SLAPolicyFilters({ priorities }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedRequestType = searchParams.get('requestType');
  const selectedPriorityId = searchParams.get('priorityId');
  const isActive = searchParams.get('isActive');

  const [requestType, setRequestType] = useState<string | null>(selectedRequestType);
  const [priorityId, setPriorityId] = useState<string | null>(selectedPriorityId);
  const [activeFilter, setActiveFilter] = useState<string | null>(isActive);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (requestType) {
      params.set('requestType', requestType);
    } else {
      params.delete('requestType');
    }

    if (priorityId) {
      params.set('priorityId', priorityId);
    } else {
      params.delete('priorityId');
    }

    if (activeFilter) {
      params.set('isActive', activeFilter);
    } else {
      params.delete('isActive');
    }

    params.delete('page');

    router.push(`/admin/settings/sla-policies?${params.toString()}`);
  };

  const clearFilters = () => {
    setRequestType(null);
    setPriorityId(null);
    setActiveFilter(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('requestType');
    params.delete('priorityId');
    params.delete('isActive');
    params.delete('page');

    router.push(`/admin/settings/sla-policies?${params.toString()}`);
  };

  const hasActiveFilters = requestType !== null || priorityId !== null || activeFilter !== null;
  const activeFilterCount = (requestType ? 1 : 0) + (priorityId ? 1 : 0) + (activeFilter ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0">
                {activeFilterCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Request Type</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={requestType === 'new_application'}
              onCheckedChange={(checked) => {
                setRequestType(checked ? 'new_application' : null);
              }}
            >
              Pengembangan
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={requestType === 'rfc'}
              onCheckedChange={(checked) => {
                setRequestType(checked ? 'rfc' : null);
              }}
            >
              RFC
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Priority</DropdownMenuLabel>
            {priorities.map((priority) => (
              <DropdownMenuCheckboxItem
                key={priority.id}
                checked={priorityId === priority.id.toString()}
                onCheckedChange={(checked) => {
                  setPriorityId(checked ? priority.id.toString() : null);
                }}
              >
                {priority.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Status</DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={activeFilter === 'true'}
              onCheckedChange={(checked) => {
                setActiveFilter(checked ? 'true' : null);
              }}
            >
              Active
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={activeFilter === 'false'}
              onCheckedChange={(checked) => {
                setActiveFilter(checked ? 'false' : null);
              }}
            >
              Inactive
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <div className="p-2">
            <Button size="sm" className="w-full" onClick={applyFilters}>
              Apply Filters
            </Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={clearFilters}>
          <X className="mr-2 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  );
}
