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
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState } from 'react';

export function MasterDataFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isActive = searchParams.get('isActive');
  const [activeFilter, setActiveFilter] = useState<string | null>(isActive);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (activeFilter) {
      params.set('isActive', activeFilter);
    } else {
      params.delete('isActive');
    }

    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  const clearFilters = () => {
    setActiveFilter(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('isActive');
    params.delete('page');

    router.push(`${pathname}?${params.toString()}`);
  };

  const hasActiveFilters = activeFilter !== null;

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button variant="outline" size="sm">
            <Filter className="mr-2 h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 rounded-full p-0">
                1
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
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
