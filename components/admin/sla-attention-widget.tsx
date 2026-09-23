'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/requests/status-badge';
import { PriorityBadge } from '@/components/requests/priority-badge';

interface Request {
  id: number;
  requestNo: string;
  title: string;
  status: string;
  priorityId: number | null;
  submittedAt: Date;
  targetSlaHours: number | null;
}

interface SLAAttentionWidgetProps {
  requests: Request[];
}

function calculateSLAProgress(submittedAt: Date, targetSlaHours: number): {
  percentUsed: number;
  hoursRemaining: number;
  isOverdue: boolean;
} {
  const now = new Date();
  const elapsedHours = (now.getTime() - submittedAt.getTime()) / (1000 * 60 * 60);
  const percentUsed = (elapsedHours / targetSlaHours) * 100;
  const hoursRemaining = targetSlaHours - elapsedHours;
  const isOverdue = percentUsed > 100;

  return { percentUsed, hoursRemaining, isOverdue };
}

export function SLAAttentionWidget({ requests }: SLAAttentionWidgetProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            Perhatian SLA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Tidak ada request yang mendekati atau melewati SLA
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Perhatian SLA
          <Badge variant="destructive" className="ml-auto">
            {requests.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.slice(0, 5).map((request) => {
            const slaProgress = request.targetSlaHours
              ? calculateSLAProgress(request.submittedAt, request.targetSlaHours)
              : null;

            return (
              <Link
                key={request.id}
                href={`/admin/requests/${request.id}`}
                className="block group"
              >
                <div className="p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {request.requestNo}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {request.title}
                      </p>
                    </div>
                    {slaProgress && (
                      <Badge
                        variant={slaProgress.isOverdue ? 'destructive' : 'outline'}
                        className="flex-shrink-0"
                      >
                        {slaProgress.isOverdue ? 'Lewat' : `${Math.round(slaProgress.percentUsed)}%`}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={request.status as 'submitted' | 'verification' | 'rejected' | 'approved' | 'assigned' | 'in_progress' | 'completed'} />
                    {request.priorityId && (
                      <PriorityBadge priorityId={request.priorityId} />
                    )}
                    {slaProgress && !slaProgress.isOverdue && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(slaProgress.hoursRemaining)}h tersisa
                      </span>
                    )}
                    {slaProgress && slaProgress.isOverdue && (
                      <span className="text-xs text-destructive">
                        Lewat {Math.round(Math.abs(slaProgress.hoursRemaining))}h
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
          {requests.length > 5 && (
            <Link
              href="/admin/requests?sla=attention"
              className="block text-sm text-primary hover:underline text-center pt-2"
            >
              Lihat semua ({requests.length})
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
