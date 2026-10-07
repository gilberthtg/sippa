import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { RequestFormSingle } from '@/components/requests/request-form-single';

export default async function NewRequestPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Buat Request Baru"
        description="Ajukan permintaan pengembangan aplikasi atau perubahan sistem"
      />

      <RequestFormSingle />
    </PageContainer>
  );
}
