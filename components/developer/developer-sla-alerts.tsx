'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface OverdueRequest {
  id: number;
  requestNo: string;
  title: string;
  status: string;
  submittedAt: Date | null;
  targetSlaHours: number | null;
}

interface DeveloperSLAAlertsProps {
  overdueRequests: OverdueRequest[];
}

export function DeveloperSLAAlerts({ overdueRequests }: DeveloperSLAAlertsProps) {
  if (overdueRequests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            SLA Alerts
          </CardTitle>
          <CardDescription>Request yang memerlukan perhatian</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 className="h-12 w-12 mx-auto mb-2 text-green-600" />
            <p className="text-sm">Semua request dalam target SLA</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          SLA Alerts
        </CardTitle>
        <CardDescription>
          {overdueRequests.length} request melewati target SLA
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overdueRequests.slice(0, 5).map((request) => (
            <Link
              key={request.id}
              href={`/developer/requests/${request.id}`}
              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{request.requestNo}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {request.title}
                  </p>
                </div>
                <Badge variant="destructive" className="shrink-0">
                  Overdue
                </Badge>
              </div>
              {request.submittedAt && (
                <p className="text-xs text-red-600 mt-2">
                  Submitted {formatDistanceToNow(new Date(request.submittedAt), { 
                    addSuffix: true,
                    locale: idLocale 
                  })}
                </p>
              )}
            </Link>
          ))}
          {overdueRequests.length > 5 && (
            <Link
              href="/developer/assignments"
              className="block text-center text-sm text-primary hover:underline mt-2"
            >
              Lihat semua ({overdueRequests.length})
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { CheckCircle2 } from 'lucide-react';
