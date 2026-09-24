'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { AuditLogFilters } from './audit-log-filters';
import { AuditLogTable } from './audit-log-table';
import { Button } from '@/components/ui/button';

interface AuditLog {
  id: number;
  actorUserId: number | null;
  actorName: string;
  module: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeData: string | null;
  afterData: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

interface FilterOptions {
  modules: string[];
  actions: string[];
  actors: Array<{ id: number; name: string }>;
}

interface AuditLogListClientProps {
  initialData: {
    logs: AuditLog[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
  filterOptions: FilterOptions;
}

export function AuditLogListClient({ initialData, filterOptions }: AuditLogListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedModules, setSelectedModules] = useState<string[]>(searchParams.getAll('module'));
  const [selectedActions, setSelectedActions] = useState<string[]>(searchParams.getAll('action'));
  const [selectedActor, setSelectedActor] = useState<string>(searchParams.get('actorId') || '');
  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    searchParams.get('dateFrom') ? new Date(searchParams.get('dateFrom')!) : undefined
  );
  const [dateTo, setDateTo] = useState<Date | undefined>(
    searchParams.get('dateTo') ? new Date(searchParams.get('dateTo')!) : undefined
  );

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();

    if (search) params.set('search', search);
    selectedModules.forEach((m) => params.append('module', m));
    selectedActions.forEach((a) => params.append('action', a));
    if (selectedActor) params.set('actorId', selectedActor);
    if (dateFrom) params.set('dateFrom', dateFrom.toISOString());
    if (dateTo) params.set('dateTo', dateTo.toISOString());

    params.set('page', '1');
    router.push(`?${params.toString()}`);
  }, [search, selectedModules, selectedActions, selectedActor, dateFrom, dateTo, router]);

  useEffect(() => {
    const timer = setTimeout(() => updateURL(), 500);
    return () => clearTimeout(timer);
  }, [search, selectedModules, selectedActions, selectedActor, dateFrom, dateTo, updateURL]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  const activeFilterCount =
    (search ? 1 : 0) +
    selectedModules.length +
    selectedActions.length +
    (selectedActor ? 1 : 0) +
    (dateFrom || dateTo ? 1 : 0);

  const handleReset = () => {
    setSearch('');
    setSelectedModules([]);
    setSelectedActions([]);
    setSelectedActor('');
    setDateFrom(undefined);
    setDateTo(undefined);
  };

  return (
    <div className="space-y-4">
      <AuditLogFilters
        search={search}
        onSearchChange={setSearch}
        selectedModules={selectedModules}
        onModulesChange={setSelectedModules}
        selectedActions={selectedActions}
        onActionsChange={setSelectedActions}
        selectedActor={selectedActor}
        onActorChange={setSelectedActor}
        dateFrom={dateFrom}
        onDateFromChange={setDateFrom}
        dateTo={dateTo}
        onDateToChange={setDateTo}
        filterOptions={filterOptions}
        activeFilterCount={activeFilterCount}
        onReset={handleReset}
      />

      <div className="text-sm text-muted-foreground">
        Menampilkan {initialData.logs.length} dari total {initialData.total} event
      </div>

      <AuditLogTable logs={initialData.logs} />

      {initialData.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={initialData.page <= 1}
            onClick={() => handlePageChange(initialData.page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {initialData.page} dari {initialData.totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={initialData.page >= initialData.totalPages}
            onClick={() => handlePageChange(initialData.page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
