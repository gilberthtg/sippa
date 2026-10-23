'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, FileText, Clock } from 'lucide-react';

interface SlaTargetRow {
  priorityId: number;
  priorityName: string;
  targetBusinessDays: number | null;
}

interface SLASummaryProps {
  totalRequests: number;
  slaMetCount: number;
  slaExceededCount: number;
  achievementRate: number;
  slaTargets: {
    new_application: SlaTargetRow[];
    rfc: SlaTargetRow[];
  };
}

export function SLASummary({
  totalRequests,
  slaMetCount,
  slaExceededCount,
  slaTargets,
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
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Target SLA (Hari Kerja)</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">Pengembangan</p>
              <div className="space-y-1.5">
                {slaTargets.new_application.map((target) => (
                  <div key={target.priorityId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{target.priorityName}:</span>
                    <span className="font-medium">
                      {target.targetBusinessDays !== null ? `${target.targetBusinessDays} hari` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">RFC</p>
              <div className="space-y-1.5">
                {slaTargets.rfc.map((target) => (
                  <div key={target.priorityId} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{target.priorityName}:</span>
                    <span className="font-medium">
                      {target.targetBusinessDays !== null ? `${target.targetBusinessDays} hari` : 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card> */}
    </div>
  );
}
