'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/requests/status-badge';
import { PriorityBadge } from '@/components/requests/priority-badge';

interface QuickListRequest {
  id: number;
  requestNo: string;
  title: string;
  status: string;
  priorityId: number | null;
  priorityName: string | null;
}

interface DeveloperQuickListProps {
  requests: QuickListRequest[];
}

export function DeveloperQuickList({ requests }: DeveloperQuickListProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Recent Assignments
          </CardTitle>
          <CardDescription>Request yang perlu dikerjakan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Tidak ada request yang di-assign</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Recent Assignments
        </CardTitle>
        <CardDescription>
          {requests.length} request terbaru
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {requests.slice(0, 5).map((request) => (
            <Link
              key={request.id}
              href={`/developer/requests/${request.id}`}
              className="block p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{request.requestNo}</p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {request.title}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={request.status} />
                {request.priorityId && (
                  <PriorityBadge priorityId={request.priorityId} />
                )}
              </div>
            </Link>
          ))}
        </div>
        <Link href="/developer/assignments">
          <Button variant="outline" className="w-full mt-4">
            View All Assignments
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
