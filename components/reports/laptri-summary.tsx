'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, FileText } from 'lucide-react';

interface LaptriSummaryProps {
  quarterCounts: { Q1: number; Q2: number; Q3: number; Q4: number };
  typeBreakdown: { new_application: number; rfc: number };
  avgCompletionByType: { new_application: number; rfc: number };
}

export function LaptriSummary({ quarterCounts, typeBreakdown, avgCompletionByType }: LaptriSummaryProps) {
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
          <CardTitle className="text-sm font-medium">New Application</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{typeBreakdown.new_application}</div>
          <p className="text-xs text-muted-foreground">Avg: {avgCompletionByType.new_application.toFixed(1)} jam</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">RFC</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{typeBreakdown.rfc}</div>
          <p className="text-xs text-muted-foreground">Avg: {avgCompletionByType.rfc.toFixed(1)} jam</p>
        </CardContent>
      </Card>
    </div>
  );
}
