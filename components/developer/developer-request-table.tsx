'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { StatusBadge } from '@/components/requests/status-badge';
import { PriorityBadge } from '@/components/requests/priority-badge';
import { EmptyState } from '@/components/shared/empty-state';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface Request {
  id: number;
  requestNo: string;
  requestType: string;
  title: string;
  status: string;
  priorityId: number | null;
  priorityName: string | null;
  submittedAt: Date | null;
  targetSlaHours: number | null;
  requesterName: string | null;
  unitName: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface DeveloperRequestTableProps {
  requests: Request[];
  pagination: Pagination;
}

export function DeveloperRequestTable({ requests, pagination }: DeveloperRequestTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`?${params.toString()}`);
  };

  if (requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <EmptyState
            title="No assignments found"
            description="You don't have any assigned requests matching the filters"
          />
        </CardContent>
      </Card>
    );
  }

  const calculateSLAProgress = (submittedAt: Date | null, targetSlaHours: number | null) => {
    if (!submittedAt || !targetSlaHours) return null;
    
    const now = new Date();
    const elapsed = (now.getTime() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);
    const percentage = (elapsed / targetSlaHours) * 100;
    
    return Math.round(percentage);
  };

  return (
    <>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request No</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Requester</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>SLA</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requests.map((request) => {
                  const slaProgress = calculateSLAProgress(request.submittedAt, request.targetSlaHours);
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">
                        {request.requestNo}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.requestType === 'new_application' ? 'New App' : 'RFC'}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {request.title}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div className="font-medium">{request.requesterName || '-'}</div>
                          <div className="text-muted-foreground">{request.unitName || '-'}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={request.status} />
                      </TableCell>
                      <TableCell>
                        {request.priorityId ? (
                          <PriorityBadge priorityId={request.priorityId} />
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {slaProgress !== null ? (
                          <div className="flex items-center gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  slaProgress > 100
                                    ? 'bg-red-600'
                                    : slaProgress > 80
                                    ? 'bg-yellow-600'
                                    : 'bg-green-600'
                                }`}
                                style={{ width: `${Math.min(slaProgress, 100)}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-medium ${
                                slaProgress > 100
                                  ? 'text-red-600'
                                  : slaProgress > 80
                                  ? 'text-yellow-600'
                                  : 'text-green-600'
                              }`}
                            >
                              {slaProgress}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {request.submittedAt
                          ? formatDistanceToNow(new Date(request.submittedAt), {
                              addSuffix: true,
                              locale: idLocale,
                            })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link href={`/developer/requests/${request.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === pagination.totalPages ||
                    Math.abs(p - pagination.page) <= 1
                )
                .map((p, i, arr) => (
                  <div key={p} className="flex items-center">
                    {i > 0 && arr[i - 1] !== p - 1 && (
                      <span className="px-2 text-muted-foreground">...</span>
                    )}
                    <Button
                      variant={p === pagination.page ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => goToPage(p)}
                      className="min-w-[2.5rem]"
                    >
                      {p}
                    </Button>
                  </div>
                ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
