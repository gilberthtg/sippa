'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LaptriFilters } from '@/components/reports/laptri-filters';
import { LaptriSummary } from '@/components/reports/laptri-summary';
import { LaptriChart } from '@/components/reports/laptri-chart';
import { LaptriTypeBreakdown } from '@/components/reports/laptri-type-breakdown';
import { LaptriTable } from '@/components/reports/laptri-table';
import { DeveloperRoleMetrics } from '@/components/reports/developer-role-metrics';
import { exportLaptriToExcel } from '@/lib/utils/report-export';
import { toast } from 'sonner';

interface LaptriRequest {
  id: number;
  requestNo: string;
  requestType: string;
  title: string;
  priorityName: string | null;
  requesterName: string;
  unitName: string | null;
  completedAt: Date | null;
}

interface DeveloperRoleMetric {
  roleCode: string;
  roleName: string;
  count: number;
  avgCompletionTime: number;
  latestCompletedAt: Date | null;
}

interface LaptriSummary {
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
  typeBreakdown: { new_application: number; rfc: number };
  avgCompletionByType: { new_application: number; rfc: number };
  avgCompletionByPriority: { low: number; medium: number; high: number; critical: number };
  monthlyTrend: Array<{ month: string; count: number }>;
  developerRoleMetrics: DeveloperRoleMetric[];
}

interface LaptriClientProps {
  initialYear: number;
  initialQuarter?: number;
  initialRequestType?: string;
  requests: LaptriRequest[];
  summary: LaptriSummary;
}

export function LaptriClient({
  initialYear,
  initialQuarter,
  initialRequestType,
  requests,
  summary,
}: LaptriClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('year', year.toString());
    router.push(`?${params.toString()}`);
  };

  const handleQuarterChange = (quarter?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (quarter) {
      params.set('quarter', quarter.toString());
    } else {
      params.delete('quarter');
    }
    router.push(`?${params.toString()}`);
  };

  const handleRequestTypeChange = (type?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set('type', type);
    } else {
      params.delete('type');
    }
    router.push(`?${params.toString()}`);
  };

  const handleExport = () => {
    try {
      exportLaptriToExcel(summary, requests, {
        year: initialYear,
        quarter: initialQuarter,
        requestType: initialRequestType,
      });
      toast.success('Laporan berhasil diekspor ke Excel');
    } catch (error) {
      toast.error('Gagal mengekspor laporan');
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <LaptriFilters
        year={initialYear}
        quarter={initialQuarter}
        requestType={initialRequestType}
        onYearChange={handleYearChange}
        onQuarterChange={handleQuarterChange}
        onRequestTypeChange={handleRequestTypeChange}
        onExport={handleExport}
      />

      <LaptriSummary
        quarterCounts={summary.quarterCounts}
        typeBreakdown={summary.typeBreakdown}
        avgCompletionByType={summary.avgCompletionByType}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <LaptriChart quarterCounts={summary.quarterCounts} />
        <LaptriTypeBreakdown typeBreakdown={summary.typeBreakdown} />
      </div>

      {/* <DeveloperRoleMetrics metrics={summary.developerRoleMetrics} /> */}

      <LaptriTable requests={requests} />
    </div>
  );
}
