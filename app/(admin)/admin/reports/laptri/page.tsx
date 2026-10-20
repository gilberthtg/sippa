import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { getLaptriData, getLaptriSummary } from '@/app/actions/reports';
import { LaptriClient } from './laptri-client';

interface LaptriPageProps {
  searchParams: Promise<{
    year?: string;
    quarter?: string;
    type?: string;
  }>;
}

export default async function LaptriPage({ searchParams }: LaptriPageProps) {
  const params = await searchParams;
  const currentYear = new Date().getFullYear();
  const year = params.year ? parseInt(params.year) : currentYear;
  const quarter = params.quarter ? parseInt(params.quarter) as 1 | 2 | 3 | 4 : undefined;
  const requestType = params.type as 'new_application' | 'rfc' | undefined;

  const [requests, summary] = await Promise.all([
    getLaptriData({ year, quarter, requestType }),
    getLaptriSummary({ year, quarter, requestType }),
  ]);

  return (
    <PageContainer>
      <PageHeader
        title="Laporan Triwulan (Laptri)"
        description="Laporan permintaan yang telah diselesaikan per kuartal"
      />

      <LaptriClient
        initialYear={year}
        initialQuarter={quarter}
        initialRequestType={requestType}
        requests={requests}
        summary={summary}
      />
    </PageContainer>
  );
}
