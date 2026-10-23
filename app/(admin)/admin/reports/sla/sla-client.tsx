"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { SLAFilters } from "@/components/reports/sla-filters";
import { SLASummary } from "@/components/reports/sla-summary";
import { SLAChart } from "@/components/reports/sla-chart";
import { SLAMonthlyTrend } from "@/components/reports/sla-monthly-trend";
import { SLATable } from "@/components/reports/sla-table";
import { DeveloperRoleSLAMetrics } from "@/components/reports/developer-role-sla-metrics";
import { exportSLAToExcel } from "@/lib/utils/report-export";
import { toast } from "sonner";

interface SLARequest {
  id: number;
  requestNo: string;
  requestType: string;
  priorityName: string | null;
  targetSlaHours: number | null;
  actualDurationHours: number | null;
  slaMet: boolean | null;
  achievementRate: number;
}

interface DeveloperRoleSLAMetric {
  roleCode: string;
  roleName: string;
  totalRequests: number;
  slaMet: number;
  slaExceeded: number;
  achievementRate: number;
  avgCompletionTime: number;
}

interface SlaTargetRow {
  priorityId: number;
  priorityName: string;
  targetBusinessDays: number | null;
}

interface SLASummary {
  totalRequests: number;
  slaMetCount: number;
  slaExceededCount: number;
  achievementRate: number;
  slaTargets: {
    new_application: SlaTargetRow[];
    rfc: SlaTargetRow[];
  };
  monthlyTrend: Array<{
    month: string;
    total: number;
    met: number;
    exceeded: number;
    rate: number;
  }>;
  developerRoleSLAMetrics: DeveloperRoleSLAMetric[];
}

interface SLAReportData {
  requests: SLARequest[];
  total: number;
  page: number;
  limit: number;
}

interface SLAClientProps {
  initialYear: number;
  initialRequestType?: string;
  initialPriorityId?: number;
  initialSLAStatus?: string;
  reportData: SLAReportData;
  summary: SLASummary;
}

export function SLAClient({
  initialYear,
  initialRequestType,
  initialPriorityId,
  initialSLAStatus,
  reportData,
  summary,
}: SLAClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleYearChange = (year: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", year.toString());
    router.push(`?${params.toString()}`);
  };

  const handleRequestTypeChange = (type?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (type) {
      params.set("type", type);
    } else {
      params.delete("type");
    }
    router.push(`?${params.toString()}`);
  };

  const handlePriorityChange = (priorityId?: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (priorityId) {
      params.set("priority", priorityId.toString());
    } else {
      params.delete("priority");
    }
    router.push(`?${params.toString()}`);
  };

  const handleSLAStatusChange = (status?: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status) {
      params.set("status", status);
    } else {
      params.delete("status");
    }
    router.push(`?${params.toString()}`);
  };

  const handleExport = () => {
    try {
      exportSLAToExcel(summary, reportData.requests, {
        year: initialYear,
        requestType: initialRequestType,
        priorityId: initialPriorityId,
        slaStatus: initialSLAStatus,
      });
      toast.success("Laporan SLA berhasil diekspor ke Excel");
    } catch (error) {
      toast.error("Gagal mengekspor laporan");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <SLAFilters
        year={initialYear}
        requestType={initialRequestType}
        priorityId={initialPriorityId}
        slaStatus={initialSLAStatus}
        onYearChange={handleYearChange}
        onRequestTypeChange={handleRequestTypeChange}
        onPriorityChange={handlePriorityChange}
        onSLAStatusChange={handleSLAStatusChange}
        onExport={handleExport}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SLAChart
          slaMetCount={summary.slaMetCount}
          slaExceededCount={summary.slaExceededCount}
        />
        <SLASummary
          totalRequests={summary.totalRequests}
          slaMetCount={summary.slaMetCount}
          slaExceededCount={summary.slaExceededCount}
          achievementRate={summary.achievementRate}
          slaTargets={summary.slaTargets}
        />

        {/* <SLAMonthlyTrend monthlyTrend={summary.monthlyTrend} /> */}
      </div>

      {/* <DeveloperRoleSLAMetrics metrics={summary.developerRoleSLAMetrics} /> */}

      <SLATable requests={reportData.requests} />
    </div>
  );
}
