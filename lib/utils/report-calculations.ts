export function calculateActualDuration(submittedAt: Date, completedAt: Date): number {
  const diffMs = completedAt.getTime() - submittedAt.getTime();
  return Math.round(diffMs / (1000 * 60 * 60));
}

export function calculateSLAMet(actualHours: number, targetHours: number | null): boolean {
  if (!targetHours) return false;
  return actualHours <= targetHours;
}

export function calculateAchievementRate(actualHours: number, targetHours: number | null): number {
  if (!targetHours || targetHours === 0) return 0;
  if (actualHours <= targetHours) return 100;
  return Math.round((targetHours / actualHours) * 100);
}

export function getQuarterFromDate(date: Date): 1 | 2 | 3 | 4 {
  const month = date.getMonth() + 1;
  if (month <= 3) return 1;
  if (month <= 6) return 2;
  if (month <= 9) return 3;
  return 4;
}

export function getQuarterDateRange(year: number, quarter: 1 | 2 | 3 | 4): { start: Date; end: Date } {
  const quarterStartMonth = (quarter - 1) * 3;
  const start = new Date(year, quarterStartMonth, 1);
  const end = new Date(year, quarterStartMonth + 3, 0, 23, 59, 59, 999);
  return { start, end };
}

export function getMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function getMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('id-ID', { month: 'short' });
}

export function groupByMonth<T extends { completedAt: Date | null }>(
  items: T[]
): Map<string, T[]> {
  const grouped = new Map<string, T[]>();
  
  items.forEach((item) => {
    if (!item.completedAt) return;
    const key = getMonthKey(item.completedAt);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(item);
  });
  
  return grouped;
}

export function generateMonthlyTrend(
  items: Array<{ completedAt: Date | null }>,
  year: number
): Array<{ month: string; count: number }> {
  const monthCounts = new Map<string, number>();
  
  for (let month = 1; month <= 12; month++) {
    const key = `${year}-${String(month).padStart(2, '0')}`;
    monthCounts.set(key, 0);
  }
  
  items.forEach((item) => {
    if (!item.completedAt) return;
    const itemYear = item.completedAt.getFullYear();
    if (itemYear !== year) return;
    
    const key = getMonthKey(item.completedAt);
    monthCounts.set(key, (monthCounts.get(key) || 0) + 1);
  });
  
  return Array.from(monthCounts.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([key, count]) => ({
      month: getMonthLabel(key),
      count,
    }));
}
