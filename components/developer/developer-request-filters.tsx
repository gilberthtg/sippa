'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { STATUS_LABELS } from '@/lib/constants';
import { getPriorities } from '@/app/actions/admin-requests';

const STATUS_OPTIONS = [
  { value: 'ongoing', label: STATUS_LABELS['ongoing'] },
  { value: 'on_hold', label: STATUS_LABELS['on_hold'] },
  { value: 'done', label: STATUS_LABELS['done'] },
];

const TYPE_OPTIONS = [
  { value: 'new_application', label: 'Pengembangan' },
  { value: 'rfc', label: 'RFC' },
];

export interface PriorityItem {
  id: number;
  name: string;
}

interface DeveloperRequestFiltersProps {
  priorities?: PriorityItem[];
}

export function DeveloperRequestFilters({ priorities: initialPriorities }: DeveloperRequestFiltersProps = {}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [fetchedPriorities, setFetchedPriorities] = useState<PriorityItem[]>([]);

  useEffect(() => {
    if (initialPriorities && initialPriorities.length > 0) return;

    let isMounted = true;
    getPriorities().then((res) => {
      if (isMounted && res.success && res.data) {
        setFetchedPriorities(res.data.map((p) => ({ id: p.id, name: p.name })));
      }
    });

    return () => {
      isMounted = false;
    };
  }, [initialPriorities]);

  const priorities = initialPriorities && initialPriorities.length > 0 ? initialPriorities : fetchedPriorities;

  const priorityOptions = priorities.map((p) => ({
    value: String(p.id),
    label: p.name,
  }));

  const currentStatus = searchParams.get('status')?.split(',') || [];
  const currentPriority = searchParams.get('priorityId')?.split(',') || [];
  const currentType = searchParams.get('requestType')?.split(',') || [];

  const hasFilters = currentStatus.length > 0 || currentPriority.length > 0 || currentType.length > 0;

  const updateFilter = (key: string, value: string | null) => {
    if (!value) return;
    
    const params = new URLSearchParams(searchParams.toString());
    const current = params.get(key)?.split(',').filter(Boolean) || [];

    if (current.includes(value)) {
      const updated = current.filter((v) => v !== value);
      if (updated.length > 0) {
        params.set(key, updated.join(','));
      } else {
        params.delete(key);
      }
    } else {
      params.set(key, [...current, value].join(','));
    }

    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const clearFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('status');
    params.delete('priorityId');
    params.delete('requestType');
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Filter:</span>

      {/* Status Filter */}
      <Select onValueChange={(value) => updateFilter('status', value as string)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Status">
            Status
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="font-medium">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority Filter */}
      <Select onValueChange={(value) => updateFilter('priorityId', value as string)}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Priority">
            Prioritas
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {priorityOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="font-medium">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Type Filter */}
      <Select onValueChange={(value) => updateFilter('requestType', value as string)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Request Type">
            Request Tipe
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {TYPE_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="font-medium">{option.label}</span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Clear Filters */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-9 px-2"
        >
          <X className="h-4 w-4 mr-1" />
          Clear
        </Button>
      )}

      {/* Active Filters Display */}
      {currentStatus.length > 0 && (
        <div className="flex gap-1">
          {currentStatus.map((status) => {
            const statusStr = String(status);
            return (
              <Badge key={statusStr} variant="secondary" className="gap-1">
                {STATUS_OPTIONS.find((o) => o.value === statusStr)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('status', statusStr)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {currentPriority.length > 0 && (
        <div className="flex gap-1">
          {currentPriority.map((priority) => {
            const priorityStr = String(priority);
            return (
              <Badge key={priorityStr} variant="secondary" className="gap-1">
                {priorityOptions.find((o) => o.value === priorityStr)?.label || `Prioritas ${priorityStr}`}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('priorityId', priorityStr)}
                />
              </Badge>
            );
          })}
        </div>
      )}

      {currentType.length > 0 && (
        <div className="flex gap-1">
          {currentType.map((type) => {
            const typeStr = String(type);
            return (
              <Badge key={typeStr} variant="secondary" className="gap-1">
                {TYPE_OPTIONS.find((o) => o.value === typeStr)?.label}
                <X
                  className="h-3 w-3 cursor-pointer"
                  onClick={() => updateFilter('requestType', typeStr)}
                />
              </Badge>
            );
          })}
        </div>
      )}
    </div>
  );
}
