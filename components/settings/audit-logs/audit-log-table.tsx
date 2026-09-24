'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, ShieldAlert } from 'lucide-react';
import { AuditLogDetailDialog } from './audit-log-detail-dialog';

interface AuditLog {
  id: number;
  actorUserId: number | null;
  actorName: string;
  module: string;
  entityType: string;
  entityId: string;
  action: string;
  beforeData: string | null;
  afterData: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

const moduleColors: Record<string, string> = {
  requests: 'bg-blue-100 text-blue-800 border-blue-200',
  users: 'bg-purple-100 text-purple-800 border-purple-200',
  settings: 'bg-gray-100 text-gray-800 border-gray-200',
  auth: 'bg-orange-100 text-orange-800 border-orange-200',
  sla: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const actionColors: Record<string, string> = {
  create: 'default',
  update: 'default',
  delete: 'destructive',
  verify: 'secondary',
  approve: 'default',
  reject: 'destructive',
  assign: 'secondary',
  start: 'secondary',
  complete: 'default',
  progress: 'outline',
  login_success: 'default',
  login_failed: 'destructive',
  logout: 'outline',
  toggle_active: 'outline',
  change_password: 'destructive',
  set_priority: 'secondary',
};

export function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  if (logs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <ShieldAlert className="h-5 w-5 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-sm font-semibold">Tidak ada log</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Tidak ada data audit log yang sesuai dengan filter.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Waktu</TableHead>
              <TableHead>Aktor</TableHead>
              <TableHead>Modul</TableHead>
              <TableHead>Aksi</TableHead>
              <TableHead>Entitas</TableHead>
              <TableHead className="text-right">Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  {format(new Date(log.createdAt), 'dd MMM yyyy HH:mm', { locale: idLocale })}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span>{log.actorName}</span>
                    {log.ipAddress && (
                      <span className="text-xs text-muted-foreground">{log.ipAddress}</span>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={`capitalize ${moduleColors[log.module] || ''}`}>
                    {log.module}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={actionColors[log.action] as any || 'outline'} className="uppercase text-[10px]">
                    {log.action.replace('_', ' ')}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="capitalize text-sm">{log.entityType}</span>
                    <span className="text-xs text-muted-foreground font-mono">ID: {log.entityId}</span>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedLog(log)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Detail
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {selectedLog && (
        <AuditLogDetailDialog
          log={selectedLog}
          open={!!selectedLog}
          onOpenChange={(open) => !open && setSelectedLog(null)}
        />
      )}
    </>
  );
}
