import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { getRequestsByUserId } from '@/app/actions/requests';
import { RequestListClient } from '@/components/requests/request-list-client';

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: { status?: string; search?: string };
}) {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const result = await getRequestsByUserId({
    status: searchParams.status,
    search: searchParams.search,
    page: 1,
    limit: 20,
  });

  if (!result.success) {
    return (
      <PageContainer>
        <PageHeader title="DevTI Request" description="Daftar request Anda" />
        <div className="text-center py-12">
          <p className="text-destructive">{result.error}</p>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <PageHeader
        title="DevTI Request"
        description="Daftar request pengembangan aplikasi Anda"
        action={
          <Link href="/requests/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Request Baru
            </Button>
          </Link>
        }
      />

      <RequestListClient
        initialRequests={result.data || []}
        initialTotal={result.total || 0}
      />
    </PageContainer>
  );
}
