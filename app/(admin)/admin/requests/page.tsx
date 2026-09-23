import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AdminRequestListClient } from '@/components/admin/admin-request-list-client';
import { LoadingState } from '@/components/shared/loading-state';
import { getAllRequests, getPriorities } from '@/app/actions/admin-requests';
import { redirect } from 'next/navigation';

interface PageProps {
  searchParams: Promise<{
    status?: string;
    priority?: string;
    type?: string;
    search?: string;
    page?: string;
  }>;
}

async function RequestListContent({ searchParams }: PageProps) {
  const params = await searchParams;
  
  const statusArray = params.status?.split(',').filter(Boolean) || [];
  const priorityArray = params.priority?.split(',').filter(Boolean).map(Number) || [];
  const typeArray = params.type?.split(',').filter(Boolean) || [];
  const page = parseInt(params.page || '1');

  const [requestsResult, prioritiesResult] = await Promise.all([
    getAllRequests({
      status: statusArray,
      priority: priorityArray,
      requestType: typeArray,
      search: params.search,
      page,
      limit: 20,
    }),
    getPriorities(),
  ]);

  if (!requestsResult.success) {
    redirect('/login');
  }

  const priorities = prioritiesResult.success && prioritiesResult.data ? prioritiesResult.data : [];

  return (
    <AdminRequestListClient
      initialRequests={requestsResult.data || []}
      initialTotal={requestsResult.total || 0}
      initialPage={requestsResult.page || 1}
      initialLimit={requestsResult.limit || 20}
      priorities={priorities}
    />
  );
}

export default function AdminRequestsPage({ searchParams }: PageProps) {
  return (
    <PageContainer>
      <PageHeader
        title="Kelola Request"
        description="Kelola semua request pengembangan aplikasi"
      />

      <Suspense fallback={<LoadingState message="Memuat data request..." />}>
        <RequestListContent searchParams={searchParams} />
      </Suspense>
    </PageContainer>
  );
}
