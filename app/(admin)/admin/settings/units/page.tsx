import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { MasterDataListClient } from '@/components/settings/master-data/master-data-list-client';
import { getUnits } from '@/app/actions/master-data';

export default async function UnitsPage({
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

  const unitsData = await getUnits({ page, search, isActive });

  return (
    <PageContainer>
      <PageHeader
        title="Units Management"
        description="Manage organizational units"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <MasterDataListClient
          type="units"
          initialData={unitsData}
        />
      </Suspense>
    </PageContainer>
  );
}
