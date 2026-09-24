import { auth } from '@/lib/auth/config';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { PageContainer } from '@/components/layout/page-container';
import { PageHeader } from '@/components/layout/page-header';
import { NotificationListClient } from '@/components/notifications/notification-list-client';
import { getNotifications, getUnreadCount } from '@/app/actions/notifications';

export default async function DeveloperNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ filter?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.roleCode !== 'developer') redirect('/login');

  const params = await searchParams;
  const page = Number(params.page) || 1;
  const filter = params.filter || 'all';
  const isRead = filter === 'unread' ? false : filter === 'read' ? true : null;

  const [result, unreadCount] = await Promise.all([
    getNotifications({ page, limit: 20, isRead }),
    getUnreadCount(),
  ]);

  return (
    <PageContainer>
      <PageHeader title="Notifikasi" description="Semua notifikasi Anda" />
      <Suspense>
        <NotificationListClient
          initialData={result.data}
          initialTotal={result.total}
          initialPage={page}
          roleCode="developer"
          unreadCount={unreadCount}
        />
      </Suspense>
    </PageContainer>
  );
}
