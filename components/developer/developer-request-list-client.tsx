'use client';

import { DeveloperRequestTable } from './developer-request-table';
import { DeveloperRequestFilters } from './developer-request-filters';
import { DeveloperRequestSearch } from './developer-request-search';
import { Card, CardContent } from '@/components/ui/card';

interface Request {
  id: number;
  requestNo: string;
  requestType: string;
  title: string;
  status: string;
  priorityId: number | null;
  priorityName: string | null;
  submittedAt: Date | null;
  targetSlaHours: number | null;
  requesterName: string | null;
  unitName: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DeveloperRequestListClientProps {
  initialData: Request[];
  pagination: Pagination;
}

export function DeveloperRequestListClient({
  initialData,
  pagination,
}: DeveloperRequestListClientProps) {
  return (
    <div className="space-y-4">
      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <DeveloperRequestFilters />
            <DeveloperRequestSearch />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <DeveloperRequestTable requests={initialData} pagination={pagination} />
    </div>
  );
}
