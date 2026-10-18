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

type Role = {
  id: number;
  name: string;
  code: string;
};

type Unit = {
  id: number;
  name: string;
  code: string;
};

type Props = {
  roles: Role[];
  units: Unit[];
};

export function UserFilters({ roles, units }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const selectedRoleIds = searchParams.get('roleIds')?.split(',').map(Number) || [];
  const selectedUnitIds = searchParams.get('unitIds')?.split(',').map(Number) || [];
  const isActive = searchParams.get('isActive');

  const [roleIds, setRoleIds] = useState<number[]>(selectedRoleIds);
  const [unitIds, setUnitIds] = useState<number[]>(selectedUnitIds);
  const [activeFilter, setActiveFilter] = useState<string | null>(isActive);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());

    if (roleIds.length > 0) {
      params.set('roleIds', roleIds.join(','));
    } else {
      params.delete('roleIds');
    }

    if (unitIds.length > 0) {
      params.set('unitIds', unitIds.join(','));
    } else {
      params.delete('unitIds');
    }

    if (activeFilter) {
      params.set('isActive', activeFilter);
    } else {
      params.delete('isActive');
    }

    params.delete('page');

    router.push(`/admin/settings/users?${params.toString()}`);
  };

  const clearFilters = () => {
    setRoleIds([]);
    setUnitIds([]);
    setActiveFilter(null);

    const params = new URLSearchParams(searchParams.toString());
    params.delete('roleIds');
    params.delete('unitIds');
    params.delete('isActive');
    params.delete('page');

    router.push(`/admin/settings/users?${params.toString()}`);
  };

  const hasActiveFilters = roleIds.length > 0 || unitIds.length > 0 || activeFilter !== null;
  const activeFilterCount = (roleIds.length > 0 ? 1 : 0) + (unitIds.length > 0 ? 1 : 0) + (activeFilter ? 1 : 0);

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
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
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Role</DropdownMenuLabel>
            {roles.map((role) => (
              <DropdownMenuCheckboxItem
                key={role.id}
                checked={roleIds.includes(role.id)}
                onCheckedChange={(checked) => {
                  setRoleIds(
                    checked
                      ? [...roleIds, role.id]
                      : roleIds.filter((id) => id !== role.id)
                  );
                }}
              >
                {role.name}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel>Unit</DropdownMenuLabel>
            {units.map((unit) => (
              <DropdownMenuCheckboxItem
                key={unit.id}
                checked={unitIds.includes(unit.id)}
                onCheckedChange={(checked) => {
                  setUnitIds(
                    checked
                      ? [...unitIds, unit.id]
                      : unitIds.filter((id) => id !== unit.id)
                  );
                }}
              >
                {unit.name}
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
