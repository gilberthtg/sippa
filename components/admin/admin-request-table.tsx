'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/requests/status-badge';
import { PriorityBadge } from '@/components/requests/priority-badge';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { ArrowUp, ArrowDown, ArrowUpDown, Eye } from 'lucide-react';

interface Request {
  id: number;
  requestNo: string;
  requestType: 'new_application' | 'rfc';
  title: string;
  requesterName: string;
  status: string;
  priorityId: number | null;
  submittedAt: Date;
  updatedAt: Date;
}

interface AdminRequestTableProps {
  requests: Request[];
  onSort?: (field: string) => void;
  currentSortBy?: string;
  currentSortOrder?: 'asc' | 'desc';
}

const typeLabels = {
  new_application: 'New Application',
  rfc: 'RFC',
};

export function AdminRequestTable({ 
  requests, 
  onSort,
  currentSortBy,
  currentSortOrder 
}: AdminRequestTableProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">Tidak ada request ditemukan</p>
      </div>
    );
  }

  const getSortIcon = (field: string) => {
    if (currentSortBy !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4" />;
    }
    return currentSortOrder === 'asc' 
      ? <ArrowUp className="ml-2 h-4 w-4" />
      : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[140px]">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => onSort?.('requestNo')}
              >
                No. Request
                {getSortIcon('requestNo')}
              </Button>
            </TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Pemohon</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>
              <Button
                variant="ghost"
                size="sm"
                className="-ml-3 h-8"
                onClick={() => onSort?.('submittedAt')}
              >
                Diajukan
                {getSortIcon('submittedAt')}
              </Button>
            </TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {request.requestNo}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {typeLabels[request.requestType]}
                </span>
              </TableCell>
              <TableCell>
                <div className="max-w-md">
                  <p className="truncate font-medium">{request.title}</p>
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm">{request.requesterName}</span>
              </TableCell>
              <TableCell>
                <StatusBadge status={request.status as 'submitted' | 'in_review' | 'rejected' | 'approved' | 'ongoing' | 'on_hold' | 'done'} />
              </TableCell>
              <TableCell>
                {request.priorityId ? (
                  <PriorityBadge priorityId={request.priorityId} />
                ) : (
                  <span className="text-xs text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                <span className="text-sm text-muted-foreground">
                  {formatDistanceToNow(new Date(request.submittedAt), {
                    addSuffix: true,
                    locale: id,
                  })}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/admin/requests/${request.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Detail
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
