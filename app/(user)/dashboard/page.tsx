import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import Link from 'next/link';

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${session.user.name}`}
      />

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Menunggu verifikasi
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Sedang dikerjakan
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Selesai bulan ini
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Apa yang ingin Anda lakukan hari ini?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Link href="/requests/new">
            <Button className="w-full md:w-auto">
              Buat Request Baru
            </Button>
          </Link>
          <Link href="/requests">
            <Button variant="outline" className="w-full md:w-auto ml-0 md:ml-2">
              Lihat Semua Request
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Aktivitas terbaru Anda
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
