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
  unitName: string | null;
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

  // Update URL and trigger server refresh when filter or search changes
  useEffect(() => {
    const params = new URLSearchParams();
    if (filter !== 'all') params.set('status', filter);
    if (search) params.set('search', search);
    
    const query = params.toString();
    const newUrl = `/requests${query ? `?${query}` : ''}`;
    
    startTransition(() => {
      router.push(newUrl, { scroll: false });
    });
  }, [filter, search, router]);

  // Filter requests on client side for immediate feedback
  const filteredRequests = requests.filter((request) => {
    // Apply status filter
    if (filter !== 'all' && request.status !== filter) {
      return false;
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      return (
        request.requestNo.toLowerCase().includes(searchLower) ||
        request.title.toLowerCase().includes(searchLower)
      );
    }

    return true;
  });

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
        <RequestTable requests={filteredRequests} />
      )}
    </div>
  );
}
