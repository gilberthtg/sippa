'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart } from '@/lib/utils/chart-adapter';

interface LaptriMonthlyTrendProps {
  monthlyTrend: Array<{ month: string; count: number }>;
}

export function LaptriMonthlyTrend({ monthlyTrend }: LaptriMonthlyTrendProps) {
  const data = monthlyTrend.map((item) => ({
    label: item.month,
    value: item.count,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Bulanan</CardTitle>
      </CardHeader>
      <CardContent>
        <LineChart data={data} height={300} />
      </CardContent>
    </Card>
  );
}
