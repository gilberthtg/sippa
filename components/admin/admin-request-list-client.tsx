'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AdminRequestTable } from './admin-request-table';
import { AdminRequestFilters } from './admin-request-filters';
import { AdminRequestSearch } from './admin-request-search';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Request {
  id: number;
  requestNo: string;
  requestType: 'new_application' | 'rfc';
  title: string;
  requesterName: string;
  status: string;
  priorityId: number | null;
  submittedAt: Date;
  updatedAt: Date;
}

interface AdminRequestListClientProps {
  initialRequests: Request[];
  initialTotal: number;
  initialPage: number;
  initialLimit: number;
  priorities: Array<{ id: number; name: string }>;
  initialSortBy?: string;
  initialSortOrder?: 'asc' | 'desc';
}

export function AdminRequestListClient({
  initialRequests,
  initialTotal,
  initialPage,
  initialLimit,
  priorities,
  initialSortBy = 'submittedAt',
  initialSortOrder = 'desc',
}: AdminRequestListClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string[]>(
    searchParams.get('status')?.split(',').filter(Boolean) || []
  );
  const [priorityFilter, setPriorityFilter] = useState<number[]>(
    searchParams.get('priority')?.split(',').filter(Boolean).map(Number) || []
  );
  const [typeFilter, setTypeFilter] = useState<string[]>(
    searchParams.get('type')?.split(',').filter(Boolean) || []
  );
  const [sortBy, setSortBy] = useState(initialSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(initialSortOrder);

  const updateURL = useCallback(() => {
    const params = new URLSearchParams();
    
    if (search) params.set('search', search);
    if (statusFilter.length > 0) params.set('status', statusFilter.join(','));
    if (priorityFilter.length > 0) params.set('priority', priorityFilter.join(','));
    if (typeFilter.length > 0) params.set('type', typeFilter.join(','));
    if (sortBy) params.set('sortBy', sortBy);
    if (sortOrder) params.set('sortOrder', sortOrder);
    params.set('page', '1');

    router.push(`/admin/requests?${params.toString()}`);
  }, [search, statusFilter, priorityFilter, typeFilter, sortBy, sortOrder, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      updateURL();
    }, 500);

    return () => clearTimeout(timer);
  }, [updateURL]);

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/requests?${params.toString()}`);
  };

  const handleSort = (field: string) => {
    // Toggle sort order if clicking same field, otherwise default to desc
    if (field === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const totalPages = Math.ceil(initialTotal / initialLimit);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AdminRequestSearch value={search} onChange={setSearch} />
        <AdminRequestFilters
          statusFilter={statusFilter}
          priorityFilter={priorityFilter}
          typeFilter={typeFilter}
          onStatusChange={setStatusFilter}
          onPriorityChange={setPriorityFilter}
          onTypeChange={setTypeFilter}
          priorities={priorities}
        />
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>
          Menampilkan {initialRequests.length} dari {initialTotal} request
        </p>
      </div>

      <AdminRequestTable 
        requests={initialRequests} 
        onSort={handleSort}
        currentSortBy={sortBy}
        currentSortOrder={sortOrder}
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(initialPage - 1)}
            disabled={initialPage <= 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Sebelumnya
          </Button>
          
          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (initialPage <= 3) {
                pageNum = i + 1;
              } else if (initialPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = initialPage - 2 + i;
              }

              return (
                <Button
                  key={pageNum}
                  variant={pageNum === initialPage ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(initialPage + 1)}
            disabled={initialPage >= totalPages}
          >
            Berikutnya
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
