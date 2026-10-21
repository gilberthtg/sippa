import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { DevteamUnitListClient } from '@/components/settings/devteam-units/devteam-unit-list-client';
import { getDevteamUnits } from '@/app/actions/master-data';

export const dynamic = 'force-dynamic';

export default async function DevteamUnitsPage({
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
  const isActive =
    params.isActive === 'true' ? true : params.isActive === 'false' ? false : null;

  const data = await getDevteamUnits({ page, search, isActive });

  return (
    <PageContainer>
      <PageHeader
        title="DevTeam Units"
        description="Manage DevTI urusan for team assignment"
      />
      <Suspense fallback={<div>Loading...</div>}>
        <DevteamUnitListClient initialData={data} />
      </Suspense>
    </PageContainer>
  );
}
