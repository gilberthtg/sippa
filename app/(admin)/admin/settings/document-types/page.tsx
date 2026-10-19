import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { DocumentTypeListClient } from '@/components/settings/document-types/document-type-list-client';
import { getDocumentTypes } from '@/app/actions/master-data';

export const dynamic = 'force-dynamic';

export default async function DocumentTypesPage({
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

  const data = await getDocumentTypes({ page, search, isActive });

  return (
    <PageContainer>
      <PageHeader
        title="Document Types"
        description="Manage document types required for service requests"
      />
      <Suspense fallback={<div>Loading...</div>}>
        <DocumentTypeListClient initialData={data} />
      </Suspense>
    </PageContainer>
  );
}