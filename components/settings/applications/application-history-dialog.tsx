'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getApplicationHistory } from '@/app/actions/master-data';
import { LoadingState } from '@/components/shared/loading-state';
import { ErrorState } from '@/components/shared/error-state';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import { FileText, GitBranch, Calendar, User, CheckCircle2, XCircle, Clock } from 'lucide-react';

type Props = {
  applicationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type ApplicationHistory = {
  application: {
    id: number;
    applicationName: string;
    description: string | null;
    currentVersion: string;
    createdAt: Date;
  };
  history: Array<{
    id: number;
    requestNo: string;
    requestType: string;
    title: string | null;
    requestedVersion: string | null;
    status: string;
    submittedAt: Date | null;
    approvedAt: Date | null;
    completedAt: Date | null;
    requesterName: string | null;
  }>;
};

const statusColors: Record<string, string> = {
  submitted: 'bg-blue-100 text-blue-800',
  in_review: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  ongoing: 'bg-purple-100 text-purple-800',
  on_hold: 'bg-orange-100 text-orange-800',
  done: 'bg-green-100 text-green-800',
};

const statusLabels: Record<string, string> = {
  submitted: 'Submitted',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  ongoing: 'Ongoing',
  on_hold: 'On Hold',
  done: 'Done',
};

export function ApplicationHistoryDialog({ applicationId, open, onOpenChange }: Props) {
  const [data, setData] = useState<ApplicationHistory | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open && applicationId) {
      loadHistory();
    }
  }, [open, applicationId]);

  const loadHistory = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await getApplicationHistory(applicationId);
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application history');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Application History</DialogTitle>
          <DialogDescription>
            Version history and related requests for this application
          </DialogDescription>
        </DialogHeader>

        {isLoading && <LoadingState message="Loading history..." />}

        {error && <ErrorState type="error" message={error} showReset onReset={loadHistory} />}

        {data && (
          <div className="space-y-6">
            {/* Application Info */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{data.application.applicationName}</h3>
                  {data.application.description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {data.application.description}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Current Version</div>
                  <div className="text-xl font-bold text-primary">
                    v{data.application.currentVersion}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  Created {format(new Date(data.application.createdAt), 'dd MMM yyyy', { locale: localeId })}
                </div>
                <div className="flex items-center gap-1">
                  <GitBranch className="h-3 w-3" />
                  {data.history.length} Requests
                </div>
              </div>
            </div>

            {/* History Timeline */}
            <div>
              <h4 className="mb-3 font-medium">Request History</h4>
              <ScrollArea className="h-[400px] pr-4">
                {data.history.length === 0 ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    No requests found for this application
                  </div>
                ) : (
                  <div className="space-y-3">
                    {data.history.map((request, index) => (
                      <div
                        key={request.id}
                        className="relative rounded-lg border p-4 hover:bg-muted/50"
                      >
                        {/* Timeline connector */}
                        {index < data.history.length - 1 && (
                          <div className="absolute left-[27px] top-[60px] h-[calc(100%+12px)] w-0.5 bg-border" />
                        )}

                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                              request.requestType === 'NEW_APPLICATION'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-purple-100 text-purple-700'
                            }`}
                          >
                            {request.requestType === 'NEW_APPLICATION' ? (
                              <FileText className="h-5 w-5" />
                            ) : (
                              <GitBranch className="h-5 w-5" />
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{request.requestNo}</span>
                                  <Badge
                                    variant="secondary"
                                    className={statusColors[request.status] || ''}
                                  >
                                    {statusLabels[request.status] || request.status}
                                  </Badge>
                                </div>
                                <div className="mt-1 text-sm text-muted-foreground">
                                  {request.requestType === 'NEW_APPLICATION'
                                    ? request.title || 'New Application'
                                    : `RFC: Update to v${request.requestedVersion}`}
                                </div>
                              </div>
                              {request.requestedVersion && (
                                <div className="shrink-0 text-right">
                                  <div className="text-xs text-muted-foreground">Version</div>
                                  <div className="font-mono text-sm font-semibold">
                                    v{request.requestedVersion}
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                              {request.requesterName && (
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  {request.requesterName}
                                </div>
                              )}
                              {request.submittedAt && (
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {format(new Date(request.submittedAt), 'dd MMM yyyy', {
                                    locale: localeId,
                                  })}
                                </div>
                              )}
                              {request.completedAt && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Completed{' '}
                                  {format(new Date(request.completedAt), 'dd MMM yyyy', {
                                    locale: localeId,
                                  })}
                                </div>
                              )}
                              {request.status === 'rejected' && request.approvedAt && (
                                <div className="flex items-center gap-1 text-red-600">
                                  <XCircle className="h-3 w-3" />
                                  Rejected{' '}
                                  {format(new Date(request.approvedAt), 'dd MMM yyyy', {
                                    locale: localeId,
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
