'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/lib/utils/chart-adapter';

interface SLAMonthlyTrendProps {
  monthlyTrend: Array<{ month: string; total: number; met: number; exceeded: number; rate: number }>;
}

export function SLAMonthlyTrend({ monthlyTrend }: SLAMonthlyTrendProps) {
  const data = monthlyTrend.map((item) => ({
    label: item.month,
    value: item.rate,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Pencapaian SLA Bulanan (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={data} height={300} />
      </CardContent>
    </Card>
  );
}
