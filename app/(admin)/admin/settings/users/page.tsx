import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { UserListClient } from '@/components/settings/users/user-list-client';
import { getAllUsers, getRolesForDropdown, getUnitsForDropdown, getDeveloperRolesForDropdown } from '@/app/actions/user-management';

export default async function UsersPage({
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
  const roleIds = params.roleIds ? (params.roleIds as string).split(',').map(Number) : [];
  const unitIds = params.unitIds ? (params.unitIds as string).split(',').map(Number) : [];
  const isActive = params.isActive === 'true' ? true : params.isActive === 'false' ? false : null;

  const [usersData, roles, units, developerRoles] = await Promise.all([
    getAllUsers({ page, search, roleIds, unitIds, isActive }),
    getRolesForDropdown(),
    getUnitsForDropdown(),
    getDeveloperRolesForDropdown(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="User Management"
        description="Manage system users and their access"
      />

      <Suspense fallback={<div>Loading...</div>}>
        <UserListClient
          initialData={usersData}
          roles={roles}
          units={units}
          developerRoles={developerRoles}
          currentUserId={session.user.id}
        />
      </Suspense>
    </PageContainer>
  );
}
