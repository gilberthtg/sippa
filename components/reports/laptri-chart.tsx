'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart } from '@/lib/utils/chart-adapter';

interface LaptriChartProps {
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
}

export function LaptriChart({ quarterCounts }: LaptriChartProps) {
  const data = [
    { label: 'Q1', value: quarterCounts.Q1 },
    { label: 'Q2', value: quarterCounts.Q2 },
    { label: 'Q3', value: quarterCounts.Q3 },
    { label: 'Q4', value: quarterCounts.Q4 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Permintaan Selesai per Kuartal</CardTitle>
      </CardHeader>
      <CardContent>
        <BarChart data={data} height={300} />
      </CardContent>
    </Card>
  );
}
