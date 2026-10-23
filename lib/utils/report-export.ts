import * as XLSX from 'xlsx';

interface SlaTargetRow {
  priorityId: number;
  priorityName: string;
  targetBusinessDays: number | null;
}

interface LaptriSummary {
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
  typeBreakdown: { new_application: number; rfc: number };
  slaTargets: {
    new_application: SlaTargetRow[];
    rfc: SlaTargetRow[];
  };
  monthlyTrend: Array<{ month: string; count: number }>;
  developerRoleMetrics: Array<{
    roleCode: string;
    roleName: string;
    count: number;
    avgCompletionTime: number;
    latestCompletedAt: Date | null;
  }>;
}

interface LaptriRequest {
  requestNo: string;
  requestType: string;
  title: string;
  priorityName: string | null;
  requesterName: string;
  unitName: string | null;
  completedAt: Date | null;
}

interface LaptriFilters {
  year: number;
  quarter?: number;
  requestType?: string;
}

export function exportLaptriToExcel(
  summary: LaptriSummary,
  requests: LaptriRequest[],
  filters: LaptriFilters
) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['Laporan Triwulan (Laptri)'],
    [''],
    ['Filter yang Diterapkan:'],
    ['Tahun', filters.year],
    ['Kuartal', filters.quarter ? `Q${filters.quarter}` : 'Semua'],
    ['Jenis Permintaan', filters.requestType || 'Semua'],
    [''],
    ['Ringkasan per Kuartal:'],
    ['Q1', summary.quarterCounts.Q1],
    ['Q2', summary.quarterCounts.Q2],
    ['Q3', summary.quarterCounts.Q3],
    ['Q4', summary.quarterCounts.Q4],
    [''],
    ['Berdasarkan Jenis:'],
    ['Pengembangan', summary.typeBreakdown.new_application],
    ['RFC', summary.typeBreakdown.rfc],
    [''],
    ['Target SLA (Hari Kerja) - Pengembangan:'],
    ...summary.slaTargets.new_application.map((target) => [
      target.priorityName,
      target.targetBusinessDays !== null ? target.targetBusinessDays : 'N/A',
    ]),
    ['Target SLA (Hari Kerja) - RFC:'],
    ...summary.slaTargets.rfc.map((target) => [
      target.priorityName,
      target.targetBusinessDays !== null ? target.targetBusinessDays : 'N/A',
    ]),
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

  const trendData = [
    ['Bulan', 'Jumlah Permintaan'],
    ...summary.monthlyTrend.map((item) => [item.month, item.count]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(trendData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Tren Bulanan');

  // Developer Role Metrics sheet
  const formatHours = (hours: number) => {
    if (hours === 0) return '0';
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (days > 0) {
      return `${days} hari ${remainingHours} jam`;
    }
    return `${remainingHours} jam`;
  };

  const roleMetricsData = [
    ['Developer Role Metrics'],
    [''],
    ['Role', 'Jumlah Request', 'Rata-rata Waktu', 'Request Terakhir'],
    ...summary.developerRoleMetrics
      .sort((a, b) => b.count - a.count)
      .map((metric) => [
        metric.roleName,
        metric.count,
        formatHours(metric.avgCompletionTime),
        metric.latestCompletedAt
          ? metric.latestCompletedAt.toLocaleDateString('id-ID')
          : 'N/A',
      ]),
  ];
  const ws2b = XLSX.utils.aoa_to_sheet(roleMetricsData);
  XLSX.utils.book_append_sheet(wb, ws2b, 'Developer Role Metrics');

  const detailsData = [
    ['No. Permintaan', 'Jenis', 'Judul', 'Prioritas', 'Pemohon', 'Unit', 'Tanggal Selesai'],
    ...requests.map((req) => [
      req.requestNo,
      req.requestType === 'new_application' ? 'Pengembangan' : 'RFC',
      req.title,
      req.priorityName || 'N/A',
      req.requesterName,
      req.unitName || 'N/A',
      req.completedAt ? req.completedAt.toLocaleDateString('id-ID') : 'N/A',
    ]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Detail Permintaan');

  const filename = `Laptri_${filters.year}${filters.quarter ? `_Q${filters.quarter}` : ''}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
  XLSX.writeFile(wb, filename);
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
  monthlyTrend: Array<{ month: string; total: number; met: number; exceeded: number; rate: number }>;
  developerRoleSLAMetrics: Array<{
    roleCode: string;
    roleName: string;
    totalRequests: number;
    slaMet: number;
    slaExceeded: number;
    achievementRate: number;
    avgCompletionTime: number;
  }>;
}

interface SLARequest {
  requestNo: string;
  requestType: string;
  priorityName: string | null;
  targetSlaHours: number | null;
  actualDurationHours: number | null;
  slaMet: boolean | null;
  achievementRate: number;
}

interface SLAFilters {
  year: number;
  startDate?: Date;
  endDate?: Date;
  requestType?: string;
  priorityId?: number;
  slaStatus?: string;
}

export function exportSLAToExcel(
  summary: SLASummary,
  requests: SLARequest[],
  filters: SLAFilters
) {
  const wb = XLSX.utils.book_new();

  const summaryData = [
    ['Pencapaian SLA'],
    [''],
    ['Filter yang Diterapkan:'],
    ['Tahun', filters.year],
    ['Tanggal Mulai', filters.startDate?.toLocaleDateString('id-ID') || 'Tidak ditentukan'],
    ['Tanggal Akhir', filters.endDate?.toLocaleDateString('id-ID') || 'Tidak ditentukan'],
    ['Jenis Permintaan', filters.requestType || 'Semua'],
    ['Status SLA', filters.slaStatus || 'Semua'],
    [''],
    ['Ringkasan:'],
    ['Total Permintaan', summary.totalRequests],
    ['Tercapai', `${summary.slaMetCount} (${((summary.slaMetCount / summary.totalRequests) * 100).toFixed(1)}%)`],
    ['Tidak Tercapai', `${summary.slaExceededCount} (${((summary.slaExceededCount / summary.totalRequests) * 100).toFixed(1)}%)`],
    ['Tingkat Pencapaian', `${summary.achievementRate.toFixed(1)}%`],
    [''],
    ['Target SLA (Hari Kerja) - Pengembangan:'],
    ...summary.slaTargets.new_application.map((target) => [
      target.priorityName,
      target.targetBusinessDays !== null ? target.targetBusinessDays : 'N/A',
    ]),
    ['Target SLA (Hari Kerja) - RFC:'],
    ...summary.slaTargets.rfc.map((target) => [
      target.priorityName,
      target.targetBusinessDays !== null ? target.targetBusinessDays : 'N/A',
    ]),
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

  const trendData = [
    ['Bulan', 'Total', 'Tercapai', 'Tidak Tercapai', 'Tingkat (%)'],
    ...summary.monthlyTrend.map((item) => [
      item.month,
      item.total,
      item.met,
      item.exceeded,
      item.rate.toFixed(1),
    ]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(trendData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Tren Bulanan');

  // Developer Role SLA Metrics sheet
  const formatHoursForSLA = (hours: number) => {
    if (hours === 0) return '0';
    const days = Math.floor(hours / 24);
    const remainingHours = Math.round(hours % 24);
    if (days > 0) {
      return `${days} hari ${remainingHours} jam`;
    }
    return `${remainingHours} jam`;
  };

  const roleSLAMetricsData = [
    ['Developer Role SLA Performance'],
    [''],
    ['Role', 'Total Request', 'SLA Met', 'SLA Exceeded', 'Achievement Rate (%)', 'Rata-rata Waktu'],
    ...summary.developerRoleSLAMetrics
      .sort((a, b) => b.achievementRate - a.achievementRate)
      .map((metric) => [
        metric.roleName,
        metric.totalRequests,
        metric.slaMet,
        metric.slaExceeded,
        metric.achievementRate.toFixed(1),
        formatHoursForSLA(metric.avgCompletionTime),
      ]),
  ];
  const ws2b = XLSX.utils.aoa_to_sheet(roleSLAMetricsData);
  XLSX.utils.book_append_sheet(wb, ws2b, 'Developer Role SLA');

  const detailsData = [
    ['No. Permintaan', 'Jenis', 'Prioritas', 'Target (hari kerja)', 'Aktual (hari kerja)', 'Selisih (hari)', 'Status', 'Pencapaian (%)'],
    ...requests.map((req) => {
      const targetDays = req.targetSlaHours !== null ? req.targetSlaHours / 24 : null;
      const actualDays = req.actualDurationHours !== null ? req.actualDurationHours / 24 : null;
      const difference = actualDays !== null && targetDays !== null ? actualDays - targetDays : null;
      return [
        req.requestNo,
        req.requestType === 'new_application' ? 'Pengembangan' : 'RFC',
        req.priorityName || 'N/A',
        targetDays !== null ? Math.ceil(targetDays) : 'N/A',
        actualDays !== null ? Math.ceil(actualDays) : 'N/A',
        difference !== null ? Math.ceil(difference) : 'N/A',
        req.slaMet ? 'Tercapai' : 'Tidak Tercapai',
        req.achievementRate.toFixed(1),
      ];
    }),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Detail SLA');

  const filename = `SLA_Report_${filters.year}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
