import { db } from '@/lib/db';
import { notifications } from '@/lib/db/schema';

export interface NotificationEvent {
  type: string;
  recipientUserIds: number[];
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}

interface NotificationChannel {
  send(event: NotificationEvent): Promise<void>;
}

class InAppChannel implements NotificationChannel {
  async send(event: NotificationEvent): Promise<void> {
    if (event.recipientUserIds.length === 0) return;

    const values = event.recipientUserIds.map((userId) => ({
      userId,
      type: event.type,
      title: event.title,
      message: event.message,
      entityType: event.entityType || null,
      entityId: event.entityId || null,
      isRead: false,
    }));

    await db.insert(notifications).values(values);
  }
}

const channels: NotificationChannel[] = [new InAppChannel()];

export async function sendNotification(event: NotificationEvent): Promise<void> {
  try {
    await Promise.all(channels.map((ch) => ch.send(event)));
  } catch (error) {
    console.error('Notification send error:', error);
  }
}
