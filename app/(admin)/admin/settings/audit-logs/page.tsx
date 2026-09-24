import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { AuditLogListClient } from '@/components/settings/audit-logs/audit-log-list-client';
import { getAuditLogs, getAuditLogFilterOptions } from '@/app/actions/audit-logs';

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    search?: string;
    module?: string | string[];
    action?: string | string[];
    actorId?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'admin') {
    redirect('/login');
  }

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const limit = 20;

  const modules = Array.isArray(params.module) ? params.module : params.module ? [params.module] : [];
  const actions = Array.isArray(params.action) ? params.action : params.action ? [params.action] : [];

  const [logsResult, filterOptions] = await Promise.all([
    getAuditLogs({
      page,
      limit,
      search: params.search,
      module: modules,
      action: actions,
      actorUserId: params.actorId ? Number(params.actorId) : undefined,
      dateFrom: params.dateFrom,
      dateTo: params.dateTo,
    }),
    getAuditLogFilterOptions(),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Audit Logs"
        description="View system activity and security events"
      />

      <Suspense>
        <AuditLogListClient
          initialData={logsResult}
          filterOptions={filterOptions}
        />
      </Suspense>
    </PageContainer>
  );
}
