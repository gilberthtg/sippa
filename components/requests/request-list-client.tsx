'use client';

import { useState, useEffect, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { RequestTable } from '@/components/requests/request-table';
import { RequestFilters } from '@/components/requests/request-filters';
import { RequestSearch } from '@/components/requests/request-search';
import { ErrorState } from '@/components/shared/error-state';
import { LoadingState } from '@/components/shared/loading-state';

interface Request {
  id: number;
  requestNo: string;
  requestType: string;
  title: string;
  status: string;
  priorityId: number | null;
  submittedAt: Date;
}

interface RequestListClientProps {
  initialRequests: Request[];
  initialTotal: number;
}

export function RequestListClient({ initialRequests }: RequestListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [requests, setRequests] = useState(initialRequests);
  const [error] = useState<string | null>(null);
  
  const [filter, setFilter] = useState(searchParams.get('status') || 'all');
  const [search, setSearch] = useState(searchParams.get('search') || '');

  // Update requests when initialRequests changes (after router.refresh)
  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (search) params.set('search', search);
    
    const query = params.toString();
    
    startTransition(() => {
      router.push(`/requests${query ? `?${query}` : ''}`);
      router.refresh();
    });
  }, [filter, search, router]);

  if (error) {
    return (
      <ErrorState 
        type="error"
        message={error} 
        showReset 
        onReset={() => window.location.reload()} 
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <RequestSearch value={search} onChange={setSearch} />
        </div>
      </div>

      <RequestFilters activeFilter={filter} onFilterChange={setFilter} />

      {isPending ? (
        <LoadingState message="Memuat data..." />
      ) : (
        <RequestTable requests={requests} />
      )}
    </div>
  );
}
