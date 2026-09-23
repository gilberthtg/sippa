import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { PriorityListClient } from '@/components/settings/priorities/priority-list-client';
import { getPriorities } from '@/app/actions/master-data';

export default async function PrioritiesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    redirect('/login');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const search = (params.search as string) || '';
  const isActive = params.isActive === 'true' ? true : params.isActive === 'false' ? false : null;

  const prioritiesData = await getPriorities({ page, search, isActive });

  return (
    <PageContainer>
      <PageHeader
        title="Priorities Management"
        description="Manage request priority levels and their order"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <PriorityListClient initialData={prioritiesData as { priorities: { id: number; code: string; name: string; sortOrder: number; isActive: boolean; createdAt: Date; updatedAt: Date }[]; total: number; page: number; limit: number; totalPages: number }} />
      </Suspense>
    </PageContainer>
  );
}
