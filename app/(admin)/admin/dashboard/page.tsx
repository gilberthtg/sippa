import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { SLAAttentionWidget } from '@/components/admin/sla-attention-widget';
import { RecentActivityWidget } from '@/components/admin/recent-activity-widget';
import { 
  getAdminDashboardStats, 
  getSLAAttentionRequests, 
  getRecentActivity 
} from '@/app/actions/admin-requests';
import { redirect } from 'next/navigation';

export default async function AdminDashboardPage() {
  const statsResult = await getAdminDashboardStats();
  const slaResult = await getSLAAttentionRequests();
  const activityResult = await getRecentActivity(10);

  if (!statsResult.success) {
    redirect('/login');
  }

  const stats = statsResult.data || {
    submitted: 0,
    verification: 0,
    approved: 0,
    assigned: 0,
    inProgress: 0,
    completed: 0,
    rejected: 0,
    total: 0,
  };

  const slaRequests = slaResult.success && slaResult.data ? slaResult.data : [];
  const activities = activityResult.success && activityResult.data ? activityResult.data : [];

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard Admin"
        description="Kelola dan monitor semua request pengembangan aplikasi"
      />

      <div className="space-y-6">
        <DashboardStats stats={stats} />

        <div className="grid gap-6 md:grid-cols-2">
          <SLAAttentionWidget requests={slaRequests} />
          <RecentActivityWidget activities={activities} />
        </div>
      </div>
    </PageContainer>
  );
}
