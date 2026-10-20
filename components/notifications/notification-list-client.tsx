'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Bell, FileText, CheckCircle, XCircle, UserPlus, RefreshCw, Check, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import { toast } from 'sonner';

const typeIcons: Record<string, typeof FileText> = {
  request_submitted: FileText,
  request_approved: CheckCircle,
  request_rejected: XCircle,
  developer_assigned: UserPlus,
  progress_updated: RefreshCw,
  request_completed: Check,
};

const typeLabels: Record<string, string> = {
  request_submitted: 'Request Baru',
  request_approved: 'Disetujui',
  request_rejected: 'Ditolak',
  developer_assigned: 'Ditugaskan',
  progress_updated: 'Progress',
  request_completed: 'Selesai',
};

interface Notification {
  id: number;
  userId: number;
  type: string;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  isRead: boolean;
  createdAt: Date | null;
}

interface NotificationListClientProps {
  initialData: Notification[];
  initialTotal: number;
  initialPage: number;
  roleCode: string;
  unreadCount: number;
}

function getNotificationHref(entityType: string | null, entityId: string | null, roleCode: string) {
  if (entityType !== 'request' || !entityId) return null;
  if (roleCode === 'admin') return `/admin/requests/${entityId}`;
  if (roleCode === 'developer') return `/developer/requests/${entityId}`;
  return `/requests/${entityId}`;
}

export function NotificationListClient({
  initialData,
  initialTotal,
  initialPage,
  roleCode,
  unreadCount: initialUnread,
}: NotificationListClientProps) {
  const [items, setItems] = useState(initialData);
  const [unread, setUnread] = useState(initialUnread);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentFilter = searchParams.get('filter') || 'all';
  const page = initialPage;
  const limit = 20;
  const totalPages = Math.ceil(initialTotal / limit);

  const handleClick = async (notif: Notification) => {
    if (!notif.isRead) {
      await markAsRead(notif.id);
      setItems((prev) => prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n)));
      setUnread((c) => Math.max(0, c - 1));
    }
    const href = getNotificationHref(notif.entityType, notif.entityId, roleCode);
    if (href) router.push(href);
  };

  const handleMarkAll = () => {
    startTransition(async () => {
      await markAllAsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnread(0);
      toast.success('Semua notifikasi ditandai telah dibaca');
      router.refresh();
    });
  };

  const handleFilterChange = (filter: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (filter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', filter);
    }
    params.delete('page');
    router.push(`?${params.toString()}`);
  };

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', String(newPage));
    router.push(`?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {['all', 'unread', 'read'].map((filter) => (
            <Button
              key={filter}
              variant={currentFilter === filter ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleFilterChange(filter)}
            >
              {filter === 'all' ? 'Semua' : filter === 'unread' ? 'Belum Dibaca' : 'Sudah Dibaca'}
              {filter === 'unread' && unread > 0 && (
                <Badge variant="secondary" className="ml-1.5 px-1.5 py-0">
                  {unread}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        {unread > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={isPending}>
            <CheckCheck className="mr-1.5 h-4 w-4" />
            Tandai Semua Dibaca
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Bell className="mb-3 h-12 w-12 opacity-30" />
          <p className="text-lg font-medium">Tidak ada notifikasi</p>
          <p className="text-sm">
            {currentFilter === 'unread'
              ? 'Semua notifikasi sudah dibaca'
              : currentFilter === 'read'
              ? 'Belum ada notifikasi yang dibaca'
              : 'Belum ada notifikasi'}
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((item) => {
            const Icon = typeIcons[item.type] || FileText;
            const href = getNotificationHref(item.entityType, item.entityId, roleCode);
            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-colors hover:bg-muted/50 ${!item.isRead ? 'border-primary/30 bg-primary/5' : ''}`}
                onClick={() => handleClick(item)}
              >
                <div className="flex gap-4 p-4">
                  <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${!item.isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className={`line-clamp-1 break-words text-sm ${!item.isRead ? 'font-semibold' : ''}`}>{item.title}</p>
                      <div className="flex shrink-0 items-center gap-2">
                        {!item.isRead && <div className="h-2 w-2 rounded-full bg-primary" />}
                        <Badge variant="outline" className="text-xs">
                          {typeLabels[item.type] || item.type}
                        </Badge>
                      </div>
                    </div>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.message}</p>
                    <div className="mt-2 flex items-center gap-3">
                      <span className="text-xs text-muted-foreground/70">
                        {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: id })}
                      </span>
                      {href && (
                        <span className="text-xs text-primary">Lihat Detail →</span>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Sebelumnya
          </Button>
          <span className="text-sm text-muted-foreground">
            Halaman {page} dari {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages}
            onClick={() => handlePageChange(page + 1)}
          >
            Selanjutnya
          </Button>
        </div>
      )}
    </div>
  );
}
