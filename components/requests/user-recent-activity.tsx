import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/requests/status-badge';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

interface UserActivity {
  id: number;
  requestId: number;
  requestNo: string;
  requestTitle: string;
  fromStatus: string | null;
  toStatus: string;
  changedByName: string;
  note: string | null;
  createdAt: Date;
}

export function UserRecentActivity({ activities }: { activities: UserActivity[] }) {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Aktivitas Terbaru</CardTitle>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum ada aktivitas</p>
        ) : (
          <div className="space-y-2">
            {activities.map((activity) => (
              <Link
                key={activity.id}
                href={`/requests/${activity.requestId}`}
                className="block group"
              >
                <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="text-sm font-medium">
                        {activity.requestNo}
                      </p>
                      {activity.fromStatus && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                          <StatusBadge status={activity.fromStatus} size="sm" />
                        </>
                      )}
                      <ArrowRight className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                      <StatusBadge status={activity.toStatus} size="sm" />
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {activity.requestTitle}
                    </p>
                    {activity.note && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
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
        )}
      </CardContent>
    </Card>
  );
}
