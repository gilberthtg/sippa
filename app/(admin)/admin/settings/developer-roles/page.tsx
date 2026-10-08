import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { DeveloperRoleListClient } from '@/components/settings/developer-roles/developer-role-list-client';
import { getDeveloperRoles } from '@/app/actions/master-data';

export const dynamic = 'force-dynamic';

export default async function DeveloperRolesPage({
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

  const rolesData = await getDeveloperRoles({ page, search, isActive });

  return (
    <PageContainer>
      <PageHeader
        title="Developer Roles"
        description="Manage developer role definitions (SA, TW, BE, FE, QA, DM)"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <DeveloperRoleListClient initialData={rolesData} />
      </Suspense>
    </PageContainer>
  );
}
