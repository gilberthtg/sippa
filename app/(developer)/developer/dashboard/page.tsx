import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { getDeveloperDashboardStats, getAssignedRequests } from '@/app/actions/developer-requests';
import { DeveloperDashboardStats } from '@/components/developer/developer-dashboard-stats';
import { DeveloperSLAAlerts } from '@/components/developer/developer-sla-alerts';
import { DeveloperQuickList } from '@/components/developer/developer-quick-list';
import { redirect } from 'next/navigation';

export default async function DeveloperDashboardPage() {
  const statsResult = await getDeveloperDashboardStats();
  
  if (!statsResult.success) {
    redirect('/login');
  }

  const recentRequests = await getAssignedRequests({
    status: ['assigned', 'in_progress'],
    limit: 5,
  });

  return (
    <PageContainer>
      <PageHeader
        title="Developer Dashboard"
        description="Monitor request yang di-assign dan progress pekerjaan Anda"
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <DeveloperDashboardStats stats={statsResult.stats!} />

        {/* Two Column Layout */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* SLA Alerts */}
          <DeveloperSLAAlerts overdueRequests={statsResult.overdueRequests || []} />

          {/* Recent Assignments */}
          <DeveloperQuickList 
            requests={recentRequests.success ? recentRequests.data || [] : []} 
          />
        </div>
      </div>
    </PageContainer>
  );
}
