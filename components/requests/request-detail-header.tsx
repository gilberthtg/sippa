'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Building2 } from 'lucide-react';
import { StatusBadge } from '@/components/requests/status-badge';
import { PriorityBadge } from '@/components/requests/priority-badge';
import { useState } from 'react';
import { REQUEST_TYPES } from '@/lib/constants';

interface RequestDetailHeaderProps {
  requestNo: string;
  title: string;
  unitName?: string | null;
  status: string;
  priorityId: number | null;
  requestType: string;
  submittedAt: Date;
  updatedAt: Date;
}

export function RequestDetailHeader({
  requestNo,
  title,
  unitName,
  status,
  priorityId,
  requestType,
  submittedAt,
  updatedAt,
}: RequestDetailHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyRequestNo = () => {
    navigator.clipboard.writeText(requestNo);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRequestTypeLabel = (type: string) => {
    return type === REQUEST_TYPES.NEW_APPLICATION ? 'Pengembangan' : 'RFC';
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-2xl">{title}</CardTitle>
              {unitName && (
                <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{unitName}</span>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground font-mono">{requestNo}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyRequestNo}
                  className="h-6 px-2"
                >
                  {copied ? (
                    <Check className="w-3 h-3" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <StatusBadge status={status} />
              {priorityId && <PriorityBadge priorityId={priorityId} />}
            </div>
          </div>

          <div className="flex gap-4 text-sm text-muted-foreground flex-wrap">
            <div>
              <span className="font-medium">Tipe:</span>{' '}
              <Badge variant="outline">{getRequestTypeLabel(requestType)}</Badge>
            </div>
            <div>
              <span className="font-medium">Dibuat:</span> {formatDate(submittedAt)}
            </div>
            <div>
              <span className="font-medium">Terakhir diupdate:</span> {formatDate(updatedAt)}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
