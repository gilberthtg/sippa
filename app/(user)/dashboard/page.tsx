import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { UserRecentActivity } from '@/components/requests/user-recent-activity';
import { getUserDashboardStats, getUserRecentActivity } from '@/app/actions/requests';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function UserDashboardPage() {
  const session = await auth();

  if (!session) {
    redirect('/login');
  }

  const statsResult = await getUserDashboardStats();
  const activityResult = await getUserRecentActivity(8);

  const stats = statsResult.success && statsResult.data
    ? statsResult.data
    : { pending: 0, ongoing: 0, onHold: 0, completedThisMonth: 0, total: 0 };
  const activities = activityResult.success && activityResult.data ? activityResult.data : [];

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard"
        description={`Selamat datang, ${session.user.name}`}
      />

      <div className="grid gap-6 md:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menunggu Verifikasi</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Diajukan / ditinjau / disetujui
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sedang Berlangsung</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.ongoing}</div>
            <p className="text-xs text-muted-foreground">
              {stats.onHold > 0
                ? `Dikerjakan oleh tim DevTI • ${stats.onHold} ditangguhkan`
                : 'Dikerjakan oleh tim DevTI'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Selesai Bulan Ini</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedThisMonth}</div>
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

      <UserRecentActivity activities={activities} />
    </PageContainer>
  );
}
