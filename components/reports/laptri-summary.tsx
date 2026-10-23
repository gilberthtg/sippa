'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText } from 'lucide-react';

interface SlaTargetRow {
  priorityId: number;
  priorityName: string;
  targetBusinessDays: number | null;
}

interface LaptriSummaryProps {
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
  typeBreakdown: { new_application: number; rfc: number };
  slaTargets: {
    new_application: SlaTargetRow[];
    rfc: SlaTargetRow[];
  };
}

export function LaptriSummary({ quarterCounts, typeBreakdown, slaTargets }: LaptriSummaryProps) {
  const total = quarterCounts.Q1 + quarterCounts.Q2 + quarterCounts.Q3 + quarterCounts.Q4;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Q1</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quarterCounts.Q1}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Q2</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quarterCounts.Q2}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Q3</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quarterCounts.Q3}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Q4</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quarterCounts.Q4}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{total}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pengembangan</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{typeBreakdown.new_application}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
          {/* <div className="mt-2 space-y-1 border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground">Target SLA (hari kerja)</p>
            {slaTargets.new_application.map((target) => (
              <div key={target.priorityId} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{target.priorityName}:</span>
                <span className="font-medium">
                  {target.targetBusinessDays !== null ? `${target.targetBusinessDays} hari` : 'N/A'}
                </span>
              </div>
            ))}
          </div> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">RFC</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{typeBreakdown.rfc}</div>
          <p className="text-xs text-muted-foreground">Permintaan selesai</p>
          {/* <div className="mt-2 space-y-1 border-t pt-2">
            <p className="text-xs font-medium text-muted-foreground">Target SLA (hari kerja)</p>
            {slaTargets.rfc.map((target) => (
              <div key={target.priorityId} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{target.priorityName}:</span>
                <span className="font-medium">
                  {target.targetBusinessDays !== null ? `${target.targetBusinessDays} hari` : 'N/A'}
                </span>
              </div>
            ))}
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}
