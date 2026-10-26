'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface LaptriRequest {
  id: number;
  requestNo: string;
  requestType: string;
  title: string;
  priorityName: string | null;
  requesterName: string;
  unitName: string | null;
  completedAt: Date | null;
}

interface LaptriTableProps {
  requests: LaptriRequest[];
}

const PAGE_SIZE = 25;

export function LaptriTable({ requests }: LaptriTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(requests.length / PAGE_SIZE);
  const safePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedRequests = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return requests.slice(start, start + PAGE_SIZE);
  }, [requests, safePage]);

  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detail Permintaan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Tidak ada data permintaan untuk filter yang dipilih</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail Permintaan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Permintaan</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead>Pemohon</TableHead>
                <TableHead>Unit</TableHead>
                <TableHead>Tanggal Selesai</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRequests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>
                    <Link
                      href={`/admin/requests/${request.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {request.requestNo}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant={request.requestType === 'new_application' ? 'default' : 'secondary'}>
                      {request.requestType === 'new_application' ? 'Pengembangan' : 'RFC'}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{request.title}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{request.priorityName || 'N/A'}</Badge>
                  </TableCell>
                  <TableCell>{request.requesterName}</TableCell>
                  <TableCell>{request.unitName || 'N/A'}</TableCell>
                  <TableCell>
                    {request.completedAt
                      ? format(request.completedAt, 'dd MMM yyyy', { locale: id })
                      : 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Pagination
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          totalItems={requests.length}
          pageSize={PAGE_SIZE}
        />
      </CardContent>
    </Card>
  );
}
