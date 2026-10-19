import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { DashboardStats } from '@/components/admin/dashboard-stats';
import { SLAAttentionWidget } from '@/components/admin/sla-attention-widget';
import { RecentActivityWidget } from '@/components/admin/recent-activity-widget';
import { DeveloperRoleDistributionWidget } from '@/components/admin/developer-role-distribution-widget';
import { 
  getAdminDashboardStats, 
  getSLAAttentionRequests, 
  getRecentActivity,
  getDeveloperRoleDistribution
} from '@/app/actions/admin-requests';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const statsResult = await getAdminDashboardStats();
  const slaResult = await getSLAAttentionRequests();
  const activityResult = await getRecentActivity(10);
  const distributionResult = await getDeveloperRoleDistribution();

  if (!statsResult.success) {
    redirect('/login');
  }

  const stats = statsResult.data || {
    submitted: 0,
    inReview: 0,
    approved: 0,
    ongoing: 0,
    onHold: 0,
    done: 0,
    rejected: 0,
    total: 0,
    approvedNotAssigned: 0,
  };

  const slaRequests = slaResult.success && slaResult.data ? slaResult.data : [];
  const activities = activityResult.success && activityResult.data ? activityResult.data : [];
  const distribution = distributionResult.success && distributionResult.data ? distributionResult.data : [];

  return (
    <PageContainer>
      <PageHeader
        title="Dashboard Admin"
        description="Kelola dan monitor semua request pengembangan aplikasi"
      />

      <div className="space-y-6">
        <DashboardStats stats={stats} />

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <SLAAttentionWidget requests={slaRequests} />
          <RecentActivityWidget activities={activities} />
          <DeveloperRoleDistributionWidget distribution={distribution} />
        </div>
      </div>
    </PageContainer>
  );
}
