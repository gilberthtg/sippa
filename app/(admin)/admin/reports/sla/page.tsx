import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { getSLAReport, getSLASummary } from '@/app/actions/reports';
import { SLAClient } from './sla-client';

interface SLAPageProps {
  searchParams: Promise<{
    year?: string;
    type?: string;
    priority?: string;
    status?: string;
    page?: string;
  }>;
}

export default async function SLAPage({ searchParams }: SLAPageProps) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = params.year ? parseInt(params.year) : currentYear;
  const requestType = params.type as 'new_application' | 'rfc' | undefined;
  const priorityId = params.priority ? parseInt(params.priority) : undefined;
  const slaStatus = params.status as 'met' | 'exceeded' | undefined;
  const page = params.page ? parseInt(params.page) : 1;

  const [reportData, summary] = await Promise.all([
    getSLAReport({ year, requestType, priorityId, slaStatus, page }),
    getSLASummary({ year, requestType, priorityId, slaStatus }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Pencapaian SLA"
        description="Laporan pencapaian Service Level Agreement (SLA)"
      />

      <SLAClient
        initialYear={year}
        initialRequestType={requestType}
        initialPriorityId={priorityId}
        initialSLAStatus={slaStatus}
        reportData={reportData}
        summary={summary}
      />
    </PageContainer>
  );
}
