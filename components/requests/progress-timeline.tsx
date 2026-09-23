'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface ProgressEntry {
  id: number;
  progressPercent: number | null;
  updateNote: string;
  updatedByName: string;
  createdAt: Date;
}

interface ProgressTimelineProps {
  progressHistory: ProgressEntry[];
}

export function ProgressTimeline({ progressHistory }: ProgressTimelineProps) {
  if (progressHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Progress Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p className="text-sm">Belum ada progress update</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          Progress Timeline
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {progressHistory.map((entry, index) => (
            <div
              key={entry.id}
              className={`relative pl-6 pb-4 ${
                index !== progressHistory.length - 1 ? 'border-l-2 border-muted' : ''
              }`}
            >
              {/* Timeline Dot */}
              <div
                className={`absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full border-2 ${
                  index === 0
                    ? 'bg-primary border-primary'
                    : 'bg-background border-muted-foreground'
                }`}
              />

              {/* Content */}
              <div className="space-y-2">
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">{entry.updatedByName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.progressPercent !== null && (
                      <Badge
                        variant={entry.progressPercent === 100 ? 'default' : 'secondary'}
                        className="shrink-0"
                      >
                        {entry.progressPercent}%
                      </Badge>
                    )}
                    {index === 0 && (
                      <Badge variant="outline" className="shrink-0">
                        Latest
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {entry.progressPercent !== null && (
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all ${
                        entry.progressPercent === 100
                          ? 'bg-green-600'
                          : entry.progressPercent >= 75
                          ? 'bg-primary'
                          : entry.progressPercent >= 50
                          ? 'bg-blue-600'
                          : 'bg-yellow-600'
                      }`}
                      style={{ width: `${entry.progressPercent}%` }}
                    />
                  </div>
                )}

                {/* Note */}
                <p className="text-sm text-muted-foreground">{entry.updateNote}</p>

                {/* Timestamp */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  <span>
                    {format(new Date(entry.createdAt), 'dd MMM yyyy, HH:mm', {
                      locale: idLocale,
                    })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
