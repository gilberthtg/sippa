import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { ApplicationListClient } from '@/components/settings/applications/application-list-client';
import { getApplications } from '@/app/actions/master-data';

export const dynamic = 'force-dynamic';

export default async function ApplicationsPage({
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

  const applicationsData = await getApplications({ page, search });

  return (
    <PageContainer>
      <PageHeader
        title="Application Master"
        description="View registered applications created from approved NEW_APPLICATION requests"
      />

      <div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
        <p className="font-medium">ℹ️ About Application Master</p>
        <p className="mt-1">
          Applications are automatically created when NEW_APPLICATION requests are approved.
          They cannot be manually added or deleted. RFC requests reference these applications
          for version management.
        </p>
      </div>

      <Suspense fallback={<div>Loading...</div>}>
        <ApplicationListClient initialData={applicationsData} />
      </Suspense>
    </PageContainer>
  );
}
