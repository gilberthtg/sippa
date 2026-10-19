'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Circle, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/requests/status-badge';
import { STATUS_LABELS } from '@/lib/constants';

interface History {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  changedByName: string;
  note: string | null;
  createdAt: Date;
}

interface RequestDetailTimelineProps {
  histories: History[];
}

export function RequestDetailTimeline({ histories }: RequestDetailTimelineProps) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  };

  if (histories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            Belum ada riwayat status
          </p>
        </CardContent>
      </Card>
    );
  }

  const sorted = [...histories].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-0">
          {sorted.map((history, index) => {
            const fromLabel = history.fromStatus ? STATUS_LABELS[history.fromStatus] : null;
            const isInitial = history.fromStatus === null;
            const isLatest = index === sorted.length - 1;

            return (
              <div key={history.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`rounded-full p-1 ${
                      isLatest ? 'bg-primary/10' : 'bg-muted'
                    }`}
                  >
                    <Circle
                      className={`w-4 h-4 ${
                        isLatest
                          ? 'text-primary fill-primary'
                          : 'text-muted-foreground fill-muted-foreground/30'
                      }`}
                    />
                  </div>
                  {index < sorted.length - 1 && <div className="w-px flex-1 bg-border my-1" />}
                </div>
                <div className={`flex-1 ${index < sorted.length - 1 ? 'pb-6' : ''}`}>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="text-sm font-medium">
                      {isInitial ? 'Request dibuat' : fromLabel}
                    </span>
                    {!isInitial && (
                      <>
                        <ArrowRight className="w-3 h-3 text-muted-foreground" />
                        <StatusBadge status={history.toStatus} size="sm" />
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <span>{formatDate(history.createdAt)}</span>
                    <span>•</span>
                    <span>oleh {history.changedByName}</span>
                  </div>
                  {history.note && (
                    <p className="text-xs text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                      {history.note}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
