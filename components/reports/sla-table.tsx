'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { CheckCircle, XCircle } from 'lucide-react';

interface SLARequest {
  id: number;
  requestNo: string;
  requestType: string;
  priorityName: string | null;
  targetSlaHours: number | null;
  actualDurationHours: number | null;
  slaMet: boolean | null;
  achievementRate: number;
}

interface SLATableProps {
  requests: SLARequest[];
}

export function SLATable({ requests }: SLATableProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Detail SLA</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">Tidak ada data untuk filter yang dipilih</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detail SLA</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No. Permintaan</TableHead>
                <TableHead>Jenis</TableHead>
                <TableHead>Prioritas</TableHead>
                <TableHead className="text-right">Target (hari kerja)</TableHead>
                <TableHead className="text-right">Aktual (hari kerja)</TableHead>
                <TableHead className="text-right">Selisih (hari)</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Pencapaian</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => {
                const targetDays = request.targetSlaHours !== null ? request.targetSlaHours / 24 : null;
                const actualDays = request.actualDurationHours !== null ? request.actualDurationHours / 24 : null;
                const difference =
                  actualDays !== null && targetDays !== null
                    ? actualDays - targetDays
                    : null;

                return (
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
                        {request.requestType === 'new_application' ? 'New App' : 'RFC'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{request.priorityName || 'N/A'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {targetDays !== null ? Math.ceil(targetDays) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {actualDays !== null ? Math.ceil(actualDays) : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      {difference !== null ? (
                        <span className={difference > 0 ? 'text-red-600' : 'text-green-600'}>
                          {difference > 0 ? '+' : ''}{Math.ceil(difference)}
                        </span>
                      ) : (
                        'N/A'
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {request.slaMet ? (
                        <CheckCircle className="inline h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="inline h-5 w-5 text-red-600" />
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={
                          request.achievementRate >= 100
                            ? 'font-medium text-green-600'
                            : 'font-medium text-red-600'
                        }
                      >
                        {request.achievementRate.toFixed(1)}%
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
