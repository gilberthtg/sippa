import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { getAssignedRequests } from '@/app/actions/developer-requests';
import { DeveloperRequestListClient } from '@/components/developer/developer-request-list-client';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoadingState } from '@/components/shared/loading-state';

interface SearchParams {
  status?: string;
  priorityId?: string;
  requestType?: string;
  search?: string;
  page?: string;
}

export default async function DeveloperAssignmentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  
  const status = params.status ? params.status.split(',') : undefined;
  const priorityId = params.priorityId ? params.priorityId.split(',').map(Number) : undefined;
  const requestType = params.requestType ? params.requestType.split(',') : undefined;
  const search = params.search || undefined;
  const page = params.page ? parseInt(params.page) : 1;

  const result = await getAssignedRequests({
    status,
    priorityId,
    requestType,
    search,
    page,
    limit: 20,
  });

  if (!result.success) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="My Assignments"
        description="Kelola request yang di-assign kepada Anda"
      />

      <Suspense fallback={<LoadingState message="Loading assignments..." />}>
        <DeveloperRequestListClient
          initialData={result.data || []}
          pagination={result.pagination!}
        />
      </Suspense>
    </PageContainer>
  );
}
