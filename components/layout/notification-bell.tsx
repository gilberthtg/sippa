'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, FileText, CheckCircle, XCircle, UserPlus, RefreshCw, Check, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { getUnreadCount, getRecentNotifications, markAsRead, markAllAsRead } from '@/app/actions/notifications';
import { formatDistanceToNow } from 'date-fns';
import { id } from 'date-fns/locale';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const POLL_INTERVAL = 30_000;

const typeIcons: Record<string, typeof FileText> = {
  request_submitted: FileText,
  request_approved: CheckCircle,
  request_rejected: XCircle,
  developer_assigned: UserPlus,
  progress_updated: RefreshCw,
  request_completed: Check,
};

function getNotificationHref(entityType: string | null, entityId: string | null, roleCode: string) {
  if (entityType !== 'request' || !entityId) return null;
  if (roleCode === 'admin') return `/admin/requests/${entityId}`;
  if (roleCode === 'developer') return `/developer/requests/${entityId}`;
  return `/requests/${entityId}`;
}

function getNotificationsPageHref(roleCode: string) {
  if (roleCode === 'admin') return '/admin/notifications';
  if (roleCode === 'developer') return '/developer/notifications';
  return '/notifications';
}

interface NotificationBellProps {
  userId: number;
  roleCode: string;
}

export function NotificationBell({ userId, roleCode }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Awaited<ReturnType<typeof getRecentNotifications>>>([]);
  const [open, setOpen] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const router = useRouter();

  const fetchCount = useCallback(async () => {
    try {
      const count = await getUnreadCount();
      setUnreadCount(count);
    } catch {}
  }, []);

  const fetchItems = useCallback(async () => {
    try {
      const data = await getRecentNotifications();
      setItems(data);
    } catch {}
  }, []);

  const startPolling = useCallback(() => {
    if (intervalRef.current) return;
    intervalRef.current = setInterval(fetchCount, POLL_INTERVAL);
  }, [fetchCount]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    fetchCount();
    startPolling();

    const onVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        fetchCount();
        startPolling();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      stopPolling();
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [fetchCount, startPolling, stopPolling]);

  useEffect(() => {
    if (open) fetchItems();
  }, [open, fetchItems]);

  const handleClick = async (notifId: number, entityType: string | null, entityId: string | null) => {
    await markAsRead(notifId);
    setItems((prev) => prev.map((n) => (n.id === notifId ? { ...n, isRead: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
    const href = getNotificationHref(entityType, entityId, roleCode);
    if (href) {
      setOpen(false);
      router.push(href);
    }
  };

  const handleMarkAll = async () => {
    await markAllAsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    setUnreadCount(0);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="relative flex h-9 w-9 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-white">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between px-4 py-3">
          <p className="text-sm font-semibold">Notifikasi</p>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="h-auto py-1 text-xs" onClick={handleMarkAll}>
              Tandai semua dibaca
            </Button>
          )}
        </div>
        <Separator />
        <ScrollArea className="max-h-80">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-40" />
              <p className="text-sm">Tidak ada notifikasi</p>
            </div>
          ) : (
            <div>
              {items.map((item) => {
                const Icon = typeIcons[item.type] || FileText;
                return (
                  <button
                    key={item.id}
                    className={`flex w-full gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${!item.isRead ? 'bg-primary/5' : ''}`}
                    onClick={() => handleClick(item.id, item.entityType, item.entityId)}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${!item.isRead ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-tight ${!item.isRead ? 'font-semibold' : ''}`}>
                        {item.title}
                      </p>
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {item.message}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground/70">
                        {item.createdAt && formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: id })}
                      </p>
                    </div>
                    {!item.isRead && (
                      <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </ScrollArea>
        <Separator />
        <div className="p-2">
          <Link href={getNotificationsPageHref(roleCode)}>
            <Button variant="ghost" size="sm" className="w-full text-xs">
              <ExternalLink className="mr-1 h-3 w-3" />
              Lihat Semua Notifikasi
            </Button>
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
