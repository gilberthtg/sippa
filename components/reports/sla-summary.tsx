'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, FileText } from 'lucide-react';

interface SLASummaryProps {
  totalRequests: number;
  slaMetCount: number;
  slaExceededCount: number;
  achievementRate: number;
  avgCompletionByType: { new_application: number; rfc: number };
  avgCompletionByPriority: { low: number; medium: number; high: number; critical: number };
}

export function SLASummary({
  totalRequests,
  slaMetCount,
  slaExceededCount,
  avgCompletionByType,
  avgCompletionByPriority,
}: SLASummaryProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Permintaan</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalRequests}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tercapai</CardTitle>
          <CheckCircle className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{slaMetCount}</div>
          <p className="text-xs text-muted-foreground">
            {totalRequests > 0 ? ((slaMetCount / totalRequests) * 100).toFixed(1) : 0}% dari total
          </p>
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tidak Tercapai</CardTitle>
          <XCircle className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{slaExceededCount}</div>
          <p className="text-xs text-muted-foreground">
            {totalRequests > 0 ? ((slaExceededCount / totalRequests) * 100).toFixed(1) : 0}% dari total
          </p>
        </CardContent>
      </Card>

      {/* <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Rata-rata Waktu Penyelesaian (jam)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Pengembangan</p>
              <p className="text-xl font-bold">{avgCompletionByType.new_application.toFixed(1)}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">RFC</p>
              <p className="text-xl font-bold">{avgCompletionByType.rfc.toFixed(1)}</p>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Per Prioritas (jam)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Low:</span>
              <span className="font-medium">{avgCompletionByPriority.low.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Medium:</span>
              <span className="font-medium">{avgCompletionByPriority.medium.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">High:</span>
              <span className="font-medium">{avgCompletionByPriority.high.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Critical:</span>
              <span className="font-medium">{avgCompletionByPriority.critical.toFixed(1)}</span>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
