'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Circle, CheckCircle2 } from 'lucide-react';

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
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      submitted: 'Diajukan',
      verification: 'Verifikasi',
      approved: 'Disetujui',
      rejected: 'Ditolak',
      assigned: 'Ditugaskan',
      in_progress: 'Dikerjakan',
      completed: 'Selesai',
    };
    return labels[status] || status;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Riwayat Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {histories.map((history, index) => (
            <div key={history.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="rounded-full p-1 bg-primary/10">
                  {index === histories.length - 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  ) : (
                    <Circle className="w-5 h-5 text-primary" />
                  )}
                </div>
                {index < histories.length - 1 && (
                  <div className="w-px h-full bg-border mt-2" />
                )}
              </div>
              <div className="flex-1 pb-6">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">
                    {getStatusLabel(history.toStatus)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(history.createdAt)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  oleh {history.changedByName}
                </p>
                {history.note && (
                  <p className="text-sm text-muted-foreground mt-2 bg-muted/50 p-2 rounded">
                    {history.note}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
