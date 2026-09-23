import * as XLSX from 'xlsx';

interface LaptriSummary {
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
  typeBreakdown: { new_application: number; rfc: number };
  avgCompletionByType: { new_application: number; rfc: number };
  avgCompletionByPriority: { low: number; medium: number; high: number; critical: number };
  monthlyTrend: Array<{ month: string; count: number }>;
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
    ['New Application', summary.typeBreakdown.new_application],
    ['RFC', summary.typeBreakdown.rfc],
    [''],
    ['Rata-rata Waktu Penyelesaian (jam):'],
    ['New Application', summary.avgCompletionByType.new_application.toFixed(1)],
    ['RFC', summary.avgCompletionByType.rfc.toFixed(1)],
    [''],
    ['Rata-rata per Prioritas (jam):'],
    ['Low', summary.avgCompletionByPriority.low.toFixed(1)],
    ['Medium', summary.avgCompletionByPriority.medium.toFixed(1)],
    ['High', summary.avgCompletionByPriority.high.toFixed(1)],
    ['Critical', summary.avgCompletionByPriority.critical.toFixed(1)],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

  const trendData = [
    ['Bulan', 'Jumlah Permintaan'],
    ...summary.monthlyTrend.map((item) => [item.month, item.count]),
  ];
  const ws2 = XLSX.utils.aoa_to_sheet(trendData);
  XLSX.utils.book_append_sheet(wb, ws2, 'Tren Bulanan');

  const detailsData = [
    ['No. Permintaan', 'Jenis', 'Judul', 'Prioritas', 'Pemohon', 'Unit', 'Tanggal Selesai'],
    ...requests.map((req) => [
      req.requestNo,
      req.requestType === 'new_application' ? 'New Application' : 'RFC',
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
  avgCompletionByType: { new_application: number; rfc: number };
  avgCompletionByPriority: { low: number; medium: number; high: number; critical: number };
  monthlyTrend: Array<{ month: string; total: number; met: number; exceeded: number; rate: number }>;
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
    ['SLA Terpenuhi', `${summary.slaMetCount} (${((summary.slaMetCount / summary.totalRequests) * 100).toFixed(1)}%)`],
    ['SLA Terlampaui', `${summary.slaExceededCount} (${((summary.slaExceededCount / summary.totalRequests) * 100).toFixed(1)}%)`],
    ['Tingkat Pencapaian', `${summary.achievementRate.toFixed(1)}%`],
    [''],
    ['Rata-rata Waktu Penyelesaian (jam):'],
    ['New Application', summary.avgCompletionByType.new_application.toFixed(1)],
    ['RFC', summary.avgCompletionByType.rfc.toFixed(1)],
    [''],
    ['Rata-rata per Prioritas (jam):'],
    ['Low', summary.avgCompletionByPriority.low.toFixed(1)],
    ['Medium', summary.avgCompletionByPriority.medium.toFixed(1)],
    ['High', summary.avgCompletionByPriority.high.toFixed(1)],
    ['Critical', summary.avgCompletionByPriority.critical.toFixed(1)],
  ];

  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, 'Ringkasan');

  const trendData = [
    ['Bulan', 'Total', 'Terpenuhi', 'Terlampaui', 'Tingkat (%)'],
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

  const detailsData = [
    ['No. Permintaan', 'Jenis', 'Prioritas', 'Target (jam)', 'Aktual (jam)', 'Selisih (jam)', 'Status', 'Pencapaian (%)'],
    ...requests.map((req) => [
      req.requestNo,
      req.requestType === 'new_application' ? 'New Application' : 'RFC',
      req.priorityName || 'N/A',
      req.targetSlaHours || 'N/A',
      req.actualDurationHours || 'N/A',
      req.targetSlaHours && req.actualDurationHours
        ? (req.actualDurationHours - req.targetSlaHours).toFixed(1)
        : 'N/A',
      req.slaMet ? 'Terpenuhi' : 'Terlampaui',
      req.achievementRate.toFixed(1),
    ]),
  ];
  const ws3 = XLSX.utils.aoa_to_sheet(detailsData);
  XLSX.utils.book_append_sheet(wb, ws3, 'Detail SLA');

  const filename = `SLA_Report_${filters.year}_${new Date().toISOString().split('T')[0].replace(/-/g, '')}.xlsx`;
  XLSX.writeFile(wb, filename);
}
