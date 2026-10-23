'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart } from '@/lib/utils/chart-adapter';

interface LaptriTypeBreakdownProps {
  typeBreakdown: { new_application: number; rfc: number };
}

export function LaptriTypeBreakdown({ typeBreakdown }: LaptriTypeBreakdownProps) {
  const data = [
    { label: 'Pengembangan', value: typeBreakdown.new_application },
    { label: 'RFC', value: typeBreakdown.rfc },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Komposisi Tipe Permintaan</CardTitle>
      </CardHeader>
      <CardContent>
        <PieChart data={data} height={300} />
      </CardContent>
    </Card>
  );
}
