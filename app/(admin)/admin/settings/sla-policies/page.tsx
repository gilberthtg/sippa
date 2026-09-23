import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { SLAPolicyListClient } from '@/components/settings/sla-policies/sla-policy-list-client';
import { getSLAPolicies, getPrioritiesForSLA } from '@/app/actions/sla-policies';

export default async function SLAPoliciesPage({
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
  const requestType = params.requestType as string | undefined;
  const priorityId = params.priorityId ? Number(params.priorityId) : undefined;
  const isActive = params.isActive === 'true' ? true : params.isActive === 'false' ? false : null;

  const [policiesData, priorities] = await Promise.all([
    getSLAPolicies({ page, requestType, priorityId, isActive }),
    getPrioritiesForSLA(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="SLA Policies"
        description="Manage service level agreement policies for requests"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <SLAPolicyListClient
          initialData={policiesData}
          priorities={priorities}
        />
      </Suspense>
    </PageContainer>
  );
}
