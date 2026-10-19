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
    status: ['ongoing', 'on_hold'],
    limit: 5,
  });

  // Build description with role if available
  const description = statsResult.developerRole?.name
    ? `Monitor request yang di-assign dan progress pekerjaan Anda sebagai ${statsResult.developerRole.name}`
    : 'Monitor request yang di-assign dan progress pekerjaan Anda';

  return (
    <PageContainer>
      <PageHeader
        title="Developer Dashboard"
        description={description}
      />

      <div className="space-y-6">
        {/* Stats Cards */}
        <DeveloperDashboardStats 
          stats={statsResult.stats!} 
          developerRole={statsResult.developerRole?.code && statsResult.developerRole?.name 
            ? { code: statsResult.developerRole.code, name: statsResult.developerRole.name }
            : null
          }
        />

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
