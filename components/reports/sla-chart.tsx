'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@/lib/utils/chart-adapter';

interface SLAChartProps {
  slaMetCount: number;
  slaExceededCount: number;
}

export function SLAChart({ slaMetCount, slaExceededCount }: SLAChartProps) {
  const data = [
    { label: 'Terpenuhi', value: slaMetCount, color: '#16a34a' },
    { label: 'Terlampaui', value: slaExceededCount, color: '#ef4444' },
  ];

  const total = slaMetCount + slaExceededCount;
  const achievementRate = total > 0 ? ((slaMetCount / total) * 100).toFixed(1) : '0';

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pencapaian SLA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center">
          <PieChart data={data} height={300} />
          <div className="mt-4 text-center">
            <p className="text-sm text-muted-foreground">Tingkat Pencapaian</p>
            <p className="text-3xl font-bold text-green-600">{achievementRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
