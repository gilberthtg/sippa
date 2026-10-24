'use client';

import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/requests/status-badge';
import { PriorityBadge } from '@/components/requests/priority-badge';
import { Eye } from 'lucide-react';
import { REQUEST_TYPES } from '@/lib/constants';
import { EmptyState } from '@/components/shared/empty-state';

interface Request {
  id: number;
  requestNo: string;
  requestType: string;
  title: string;
  unitName: string | null;
  status: string;
  priorityId: number | null;
  submittedAt: Date;
}

interface RequestTableProps {
  requests: Request[];
}

export function RequestTable({ requests }: RequestTableProps) {
  if (requests.length === 0) {
    return (
      <EmptyState
        title="Belum ada request"
        description="Anda belum memiliki request. Klik tombol 'Buat Request Baru' untuk memulai."
      />
    );
  }

  const getRequestTypeLabel = (type: string) => {
    return type === REQUEST_TYPES.NEW_APPLICATION ? 'Pengembangan' : 'RFC';
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>No. Request</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Judul</TableHead>
            <TableHead>Unit</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Prioritas</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-mono text-sm">{request.requestNo}</TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs">
                  {getRequestTypeLabel(request.requestType)}
                </Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate">{request.title}</TableCell>
              <TableCell>
                <div className="max-w-[200px] truncate text-sm text-muted-foreground">
                  {request.unitName || '-'}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={request.status} />
              </TableCell>
              <TableCell>
                {request.priorityId ? (
                  <PriorityBadge priorityId={request.priorityId} />
                ) : (
                  <span className="text-sm text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(request.submittedAt)}
              </TableCell>
              <TableCell className="text-right">
                <Link href={`/requests/${request.id}`}>
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    Lihat
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
