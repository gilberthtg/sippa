import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Suspense } from 'react';
import { ServiceDocumentTypeListClient } from '@/components/settings/service-document-types/service-document-type-list-client';
import { getServiceDocumentTypes, getDocumentTypes } from '@/app/actions/master-data';

export const dynamic = 'force-dynamic';

export default async function ServiceDocumentTypesPage() {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    redirect('/login');
  }

  const [sdData, dtData] = await Promise.all([
    getServiceDocumentTypes({ limit: 100 }),
    getDocumentTypes({ isActive: true, limit: 100 }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Service Document Types"
        description="Manage which document types are required for each request type (Pengembangan / RFC)"
      />
      <Suspense fallback={<div>Loading...</div>}>
        <ServiceDocumentTypeListClient
          initialData={sdData}
          documentTypes={dtData.documentTypes}
        />
      </Suspense>
    </PageContainer>
  );
}