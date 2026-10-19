'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface Activity {
  id: number;
  requestId: number;
  requestNo: string | null;
  requestTitle: string | null;
  fromStatus: string | null;
  toStatus: string;
  changedBy: number;
  changedByName: string;
  note: string | null;
  createdAt: Date;
}

interface RecentActivityWidgetProps {
  activities: Activity[];
}

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  ongoing: 'Ongoing',
  on_hold: 'On Hold',
  done: 'Done',
};

const statusColors: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  submitted: 'outline',
  in_review: 'secondary',
  approved: 'default',
  rejected: 'destructive',
  ongoing: 'default',
  on_hold: 'secondary',
  done: 'default',
};

export function RecentActivityWidget({ activities }: RecentActivityWidgetProps) {
  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-4">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/admin/requests/${activity.requestId}`}
                className="block group"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {activity.requestNo || 'N/A'}
                      </p>
                      {activity.fromStatus && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <Badge variant={statusColors[activity.fromStatus] || 'outline'} className="text-xs">
                            {statusLabels[activity.fromStatus] || activity.fromStatus}
                          </Badge>
                        </>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <Badge variant={statusColors[activity.toStatus] || 'default'} className="text-xs">
                        {statusLabels[activity.toStatus] || activity.toStatus}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mb-1">
                      {activity.requestTitle || 'No title'}
                    </p>
                    {activity.note && (
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.note}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <p className="text-xs text-muted-foreground">
                        {activity.changedByName}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(activity.createdAt), {
                          addSuffix: true,
                          locale: id,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
