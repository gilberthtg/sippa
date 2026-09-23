import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { RequestFormWizard } from '@/components/requests/request-form-wizard';

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

      <Card>
        <CardHeader>
          <CardTitle>Form Permintaan</CardTitle>
          <CardDescription>
            Lengkapi form berikut untuk mengajukan permintaan Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RequestFormWizard />
        </CardContent>
      </Card>
    </PageContainer>
  );
}
