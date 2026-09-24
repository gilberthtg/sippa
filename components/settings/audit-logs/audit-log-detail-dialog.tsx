'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, User, Shield, Server, Globe } from 'lucide-react';

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

interface AuditLogDetailDialogProps {
  log: AuditLog;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function JsonDisplay({ data, type }: { data: string | null; type: 'before' | 'after' }) {
  if (!data) return <span className="text-muted-foreground italic">Tidak ada data</span>;

  try {
    const parsed = JSON.parse(data);
    const formatted = JSON.stringify(parsed, null, 2);
    const bgColor = type === 'after' ? 'bg-green-50/50' : 'bg-red-50/50';
    const textColor = type === 'after' ? 'text-green-900' : 'text-red-900';

    return (
      <pre className={`p-4 rounded-md text-xs overflow-x-auto ${bgColor} ${textColor}`}>
        {formatted}
      </pre>
    );
  } catch {
    return <div className="text-sm text-red-500">Invalid JSON data</div>;
  }
}

export function AuditLogDetailDialog({ log, open, onOpenChange }: AuditLogDetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            Detail Audit Log
            <Badge variant="outline" className="ml-2">#{log.id}</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <Clock className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Waktu</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(log.createdAt), 'dd MMMM yyyy HH:mm:ss', { locale: idLocale })}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-3 items-start">
                <User className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Aktor</p>
                  <p className="text-sm text-muted-foreground">
                    {log.actorName} {log.actorUserId && `(ID: ${log.actorUserId})`}
                  </p>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Globe className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Jaringan</p>
                  <p className="text-sm text-muted-foreground">
                    IP: {log.ipAddress || '-'}<br/>
                    <span className="text-xs break-all opacity-70">UA: {log.userAgent || '-'}</span>
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <Shield className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Modul & Aksi</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="secondary" className="capitalize">{log.module}</Badge>
                    <Badge className="uppercase text-[10px]">{log.action.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 items-start">
                <Server className="w-4 h-4 mt-0.5 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Entitas Terkait</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {log.entityType} <span className="font-mono bg-muted px-1 rounded ml-1">ID: {log.entityId}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              Perubahan Data
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2 text-red-700">Data Sebelumnya (Before)</p>
                <JsonDisplay data={log.beforeData} type="before" />
              </div>
              <div>
                <p className="text-sm font-medium mb-2 text-green-700">Data Sesudah (After)</p>
                <JsonDisplay data={log.afterData} type="after" />
              </div>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
